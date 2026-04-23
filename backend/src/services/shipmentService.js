const { PrismaClient } = require("@prisma/client");
const { shipment } = require("../config/prisma");
const prisma = new PrismaClient();

/**
 * Admin cập nhật thông tin vận chuyển
 */
const updateShipmentInfo = async (orderId, shipmentData) => {
  const { carrier, trackingNumber, shippedAt, status } = shipmentData;

  // Dùng Transaction: Gói 2 hành động vào 1 khối. Chết 1 là chết cả 2, không sợ lệch data.
  return await prisma.$transaction(async (tx) => {
    // Cập nhật thông tin vào bảng Shipment
    const updatedShipment = await tx.shipment.update({
      where: { orderId: Number(orderId) },
      data: {
        carrier: carrier,
        trackingNumber: trackingNumber,
        shippedAt: shippedAt ? new Date(shippedAt) : new Date(),
        status: status || "SHIPPED",
        deliveredAt: status === "DELIVERED" ? new Date() : null,
      },
    });

    // Cập nhật luôn trạng thái của Order sang SHIPPED
    await tx.order.update({
      where: { id: Number(orderId) },
      data: { status: status || "SHIPPED" },
    });

    if (status === "DELIVERED") {
      const payment = await tx.payment.findUnique({
        where: { orderId: Number(orderId) },
      });

      if (payment && payment.paymentMethod === "CASH") {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "COMPLETED" },
        });
      }
    }

    return updatedShipment;
  });
};

/**
 * Xác nhận giao hàng thành công
 */
const confirmDelivered = async (orderId) => {
  return await prisma.$transaction(async (tx) => {
    // Cập nhật trạng thái shipment
    const updatedShipment = await tx.shipment.update({
      where: { orderId: Number(orderId) },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    // Cập nhật trạng thái order
    await tx.order.update({
      where: { id: Number(orderId) },
      data: { status: "DELIVERED" },
    });

    //Kiểm tra luồng thanh toán
    const payment = await tx.payment.findUnique({
      where: { orderId: Number(orderId) },
    });

    if (
      payment &&
      payment.paymentMethod === "CASH" &&
      payment.status !== "COMPLETED"
    ) {
      // Tự động chốt sổ thanh toán
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "COMPLETED" },
      });
    }

    return updatedShipment;
  });
};

/**
 * Admin lấy danh sách Vận chuyển
 */
const getAllShipments = async (search, status) => {
  // Tạo một object chứa các điều kiện cần lọc rỗng
  let whereClause = {};

  // Nếu lọc theo trạng thái
  if (status) {
    whereClause.status = status;
  }

  // Nếu gõ từ khóa tìm kiếm
  if (search) {
    // Ép kiểu người xem dùng gõ chữ hay số
    const searchNumber = parseInt(search);

    if (!isNaN(searchNumber)) {
      // Nếu là số tìm theo mẫ đơn hàng (orderId)
      whereClause.orderId = searchNumber;
    } else {
      // Nếu là chữ tìm gần đúng (LIKE) theo mã vận đơn (trackingnumber)
      whereClause.trackingNumber = {
        contains: search,
      };
    }
  }

  // Lấy dữ liệu từ DB, sắp sếp đơn mới nhất lên đầu
  return await prisma.shipment.findMany({
    where: whereClause,
    orderBy: {
      orderId: "desc",
    },
  });
};

module.exports = {
  updateShipmentInfo,
  confirmDelivered,
  getAllShipments,
};
