const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createReview = async (userId, productId, reviewData) => {

  const cleanUserId = Number(userId);
  const cleanProductId = Number(productId);
  const { rating, comment } = reviewData;

    // Nâng cao: Kiểm tra xem user đã từng mua sản phẩm này chưa
    const hasBought = await prisma.order.findFirst({
        where: {
            userId: cleanUserId,
            status: 'DELIVERED', // Đã nhận hàng mới được review
            items: {
                some:{ 
                    productId: cleanProductId 
                } // Trong đơn hàng có sản phẩm này
            }
        }
    });

    if (!hasBought) {
        throw new Error("Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công!");
    }

    // Nếu thỏa mãn, tiến hành tạo Review
    return await prisma.review.create({
        data: {
            userId: Number(userId),
            productId: Number(productId),
            rating: Number(rating),
            comment: comment
        }
    });
};

const getProductReviews = async (productId) => {
    return await prisma.review.findMany({
        where: { productId: Number(productId) },
        include: {
            user: { select: { fullName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

module.exports = { createReview, getProductReviews };