const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createReview = async (userId, productId, reviewData) => {
  const cleanUserId = Number(userId);
  const cleanProductId = Number(productId);
  const { rating, comment } = reviewData;

  // Nâng cao: Kiểm tra xem user đã từng mua sản phẩm này chưa
  const hasBought = await prisma.order.findFirst({
    where: {
      userId: cleanUserId,
      status: "DELIVERED", // Đã nhận hàng mới được review
      items: {
        some: {
          productId: cleanProductId,
        }, // Trong đơn hàng có sản phẩm này
      },
    },
  });

  if (!hasBought) {
    throw new Error(
      "Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công!",
    );
  }

  // Nếu thỏa mãn, tiến hành tạo Review
  return await prisma.review.create({
    data: {
      userId: Number(userId),
      productId: Number(productId),
      rating: Number(rating),
      comment: comment,
    },
  });
};

const getProductReviews = async (productId) => {
  return await prisma.review.findMany({
    where: { productId: Number(productId), status: "ACTIVE" },
    include: {
      user: { select: { fullName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getAdminReviewDashboard = async (filters = {}) => {
  const { rating, status, search } = filters;

  // Tính tổng review và điểm trung bình toàn sàn
  const aggregations = await prisma.review.aggregate({
    _count: { id: true },
    _avg: { rating: true },
  });

  // Thống kê xem có bao nhiêu review 1*,2*...
  const startBreakdown = await prisma.review.groupBy({
    by: ["rating"],
    _count: { id: true },
  });

  const whereClause = {};

  // Nếu có lọc theo sao và khác chữ ALL
  if (rating && rating !== "ALL") {
    whereClause.rating = Number(rating);
  }

  // Nếu có lọc theo trạng thái
  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  // Nếu có gõ từ khóa tìm kiếm (tìm theo tên sản phẩm)
  if (search) {
    whereClause.product = {
      name: { contains: search }, // TÌm kiếm chuỗi (Prisma hỗ trợ tự động tìm đối tượng)
    };
  }

  // Lấy danh sách reviews mới nhất (kéo theo tên user và tên product)
  const recentReviews = await prisma.review.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { fullName: true, email: true } },
      product: { select: { name: true, images: true } },
    },
  });

  return {
    stats: {
      totalReviews: aggregations._count.id,
      averageRating: aggregations._avg.rating
        ? aggregations._avg.rating.toFixed(1)
        : 0,
      breakDown: startBreakdown,
    },
    reviews: recentReviews,
  };
};

// Hàm ẩn/hiện Review
const toggleReviewStatus = async (reviewId, status) => {
  return await prisma.review.update({
    where: { id: Number(reviewId) },
    data: { status: status },
  });
};

module.exports = {
  createReview,
  getProductReviews,
  toggleReviewStatus,
  getAdminReviewDashboard,
};
