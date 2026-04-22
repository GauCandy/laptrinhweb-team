const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

// PUT payment
const updatePaymentStatus = async (paymentId, status) => {
  // Kiểm tra payment có tồn tại không
  const payment = await prisma.payment.findUnique({
    where: { id: Number(paymentId) },
  });
  if (!payment) throw new Error("Không tìm thấy giao dịch!");

  // Cập nhật status
  return await prisma.payment.update({
    where: { id: Number(paymentId) },
    data: { status: status },
  });
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

module.exports = {
  payOrder,
  getAllPayments,
  updatePaymentStatus,
};
