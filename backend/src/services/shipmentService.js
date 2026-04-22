const { PrismaClient } = require("@prisma/client");
const { shipment } = require("../config/prisma");
const prisma = new PrismaClient();

/**
 * Admin cập nhật thông tin vận chuyển
 */
const updateShipmentInfo = async (orderId, shipmentData) => {
  const { carrier, trackingNumber, shippedAt } = shipmentData;

  // Dùng Transaction: Gói 2 hành động vào 1 khối. Chết 1 là chết cả 2, không sợ lệch data.
  return await prisma.$transaction(async (tx) => {
    // Hành động 1: Cập nhật thông tin vào bảng Shipment
    const updatedShipment = await tx.shipment.update({
      where: { orderId: Number(orderId) },
      data: {
        carrier: carrier,
        trackingNumber: trackingNumber,
        shippedAt: shippedAt ? new Date(shippedAt) : new Date(),
        status: "SHIPPED",
      },
    });

    // Hành động 2: Cập nhật luôn trạng thái của Order sang SHIPPED
    await tx.order.update({
      where: { id: Number(orderId) },
      data: { status: "SHIPPED" },
    });

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

module.exports = {
  updateShipmentInfo,
  confirmDelivered,
};
