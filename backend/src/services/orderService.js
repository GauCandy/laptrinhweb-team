const { PrismaClient } = require("@prisma/client");
const { shipment } = require("../config/prisma");
const prisma = new PrismaClient();

const placeOrder = async (userId, shippingAddress) => {
  // Kéo giỏ hàng ra triểm tra
  const cart = await prisma.cart.findUnique({
    where: { userId: Number(userId) },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng của bạn đang rỗng, không thể đặt hàng!");
  }

  // Tính tiên và chuẩn bị Data (Chốt giá lúc mua)
  let totalAmount = 0;
  const orderItemsData = [];

  for (const item of cart.items) {
    // Check lại tồn kho
    if (item.product.stock < item.quantity) {
      throw new Error(
        `Rất tiếc, sản phẩm "${item.product.name}" chỉ còn ${item.product.stock} cái trong kho!`,
      );
    }

    totalAmount += item.quantity * item.product.price;

    // Lưu lại giá tiền hiện tại. Để lỡ ngày mai shop tăng giá, đơn cũ vẫn giữ giá cũ.
    orderItemsData.push({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
    });
  }

  // Kích hoạt transaction
  const result = await prisma.$transaction(async (tx) => {
    // Tạo đơn hàng (order) và chi tiết đơn (orderItems) lồng nhau
    const newOrder = await tx.order.create({
      data: {
        userId: Number(userId),
        totalAmount: totalAmount,
        shipment: {
          create: {
            shippingAddress: shippingAddress,
            status: "PENDING",
          },
        },
        status: "PENDING", // Đơn mới tại mặc định là chờ xử lý
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true },
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: item.product.stock - item.quantity },
      });
    }

    // Dọn dẹp sạch sẽ giỏ hàng (CartItem)
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    return newOrder; // Trả về đơn hàng thành công
  });

  return result;
};

/**
 * Lấy danh sách toàn bộ đơn hàng của 1 User (Lịch sử mua hàng)
 */
const getUserOrders = async (userId) => {
  return await prisma.order.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: "desc" }, // Sắp sếp đơn mới nhất lên đầu
    include: {
      // Kéo thêm orderItems ra để biết đơn này mua mấy món, nhưng không cần kéo chi tiết Product để tránh nặng data
      items: true,
    },
  });
};

/**
 * Lấy chi tiết 1 đơn hàng cụ thể
 */
const getOrderDetails = async (userId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: {
      items: {
        include: {
          product: {
            include: { images: true }, // Lấy cả ảnh để frontend render hóa đơn cho đẹp
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng này!");
  }

  // Bảo vệ: Không cho phép user này xem hóa đơn của user khác
  if (order.userId !== Number(userId)) {
    throw new Error("Bạn không có quyền xem đơn hàng của người khác!");
  }

  return order;
};

/**
 * Mô phỏng thanh toán đơn hàng
 */
const payOrder = async (orderId, paymentMethod) => {
  // Kiểm tra đơn hàng có tồn tại không
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
  });

  if (!order) throw new Error("Không tìm thấy đơn hàng!");
  if (order.status !== "PENDING")
    throw new Error("Đơn hàng này đã được xử lý hoặc đã thanh toán trước đó!");

  // Dùng Transaction: Vừa tạo bản ghi thanh toán, vừa cập nhật trạng thái đơn hàng
  return await prisma.$transaction(async (tx) => {
    // Tạo bản ghi trong bảng payment (Để kế toán sau này đối soát)
    await tx.payment.create({
      data: {
        orderId: Number(orderId),
        amount: order.totalAmount,
        paymentMethod: paymentMethod, // MOMO, VNPAY...
        status: "COMPLETED",
      },
    });

    // Cập nhật đơn hàng sang trạng thái PROCESSING (Đang xử lý/Đã thanh toán)
    return await tx.order.update({
      where: { id: Number(orderId) },
      data: { status: "PROCESSING" },
    });
  });
};

// Danh sách thanh toán
const getAllPayments = async () => {
  return await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: {
          user: { select: { fullName: true, email: true } },
        },
      },
    },
  });
};

/**
 * API dành cho ADMIN: Xem tất cả đơn hàng
 */
const getAllOrders = async () => {
  return await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { fullName: true, email: true } }, // Để admin biết ai mua
      items: true,
    },
  });
};

/**
 * Admin cập nhật trạng thái đơn hàng (PENDING -> PROCESSING -> SHIPPED -> ...)
 */
const updateOrderStatus = async (orderId, status) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Cập nhật trạng thái Đơn hàng
    const updatedOrder = await tx.order.update({
      where: { id: Number(orderId) },
      data: { status: status },
    });

    // 2. NẾU status là DELIVERED, thì tự động cập nhật luôn bảng Shipment
    if (status === "DELIVERED") {
      await tx.shipment.update({
        where: { orderId: Number(orderId) },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
        },
      });
    }

    return updatedOrder;
  });
};

/**
 * Admin cập nhật thông tin vận chuyển
 */
const updateShipmentInfo = async (orderId, shipmentData) => {
  const { carrier, trackingNumber, shippedAt } = shipmentData;

  // Cập nhật thông tin trong bảng shipment liên kết với order
  return await prisma.shipment.update({
    where: { orderId: Number(orderId) },
    data: {
      carrier: carrier,
      trackingNumber: trackingNumber,
      shippedAt: shippedAt ? new Date(shippedAt) : new Date(),
      status: "SHIPPED", // khi đã có thông tin này thì bên vận chuyển cũng đổi trạng thái
    },
  });
};

/**
 * Xác nhận đã giao hàng thành công
 */
const confirmDelivered = async (orderId) => {
  return await prisma.$transaction(async (tx) => {
    // Cập nhật trạng thái shipment
    await tx.shipment.update({
      where: { orderId: Number(orderId) },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    // Cập nhật trạng thái Order
    return await tx.order.update({
      where: { id: Number(orderId) },
      data: { status: "DELIVERED" },
    });
  });
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderDetails,
  payOrder,
  getAllOrders,
  updateOrderStatus,
  updateShipmentInfo,
  confirmDelivered,
  getAllPayments,
};
