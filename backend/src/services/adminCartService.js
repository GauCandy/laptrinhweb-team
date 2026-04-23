const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * DÀNH CHO ADMIN: Lấy dữ liệu thống kê Giỏ hàng
 */
const getCartAnalytics = async () => {
  const now = new Date();
  // Lấy thời điểm 24h trước
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Đếm Giỏ hàng Active (Có item & update trong 24h)
  const activeCartsCount = await prisma.cart.count({
    where: {
      updatedAt: { gte: twentyFourHoursAgo },
      items: { some: {} }, // Chỉ lấy giỏ có ít nhất 1 sản phẩm
    },
  });

  // Đếm Giỏ hàng Bị bỏ quên (Có item & update trước 24h)
  const abandonedCartsCount = await prisma.cart.count({
    where: {
      updatedAt: { lt: twentyFourHoursAgo },
      items: { some: {} },
    },
  });

  // Tính Tỉ lệ chuyển đổi (Tổng Đơn hàng / Tổng Giỏ hàng)
  const totalCarts = await prisma.cart.count();
  // Giả định bạn có bảng order. Nếu tên bảng khác, bạn sửa lại nhé!
  const totalOrders = await prisma.order.count();

  let conversionRate = 0;
  if (totalCarts > 0) {
    conversionRate = ((totalOrders / totalCarts) * 100).toFixed(1); // Lấy 1 chữ số thập phân
  }

  // Lấy Top 5 Sản phẩm đang nằm trong giỏ nhiều nhất
  const topProductsRaw = await prisma.cartItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  // Đi lấy thêm tên và ảnh của 5 sản phẩm này để Frontend hiển thị cho đẹp
  const topProducts = await Promise.all(
    topProductsRaw.map(async (item) => {
      const productInfo = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true, price: true, images: true },
      });
      return {
        productId: item.productId,
        name: productInfo.name,
        price: productInfo.price,
        image: productInfo.images[0]?.url || null, // Lấy ảnh đầu tiên
        totalInCarts: item._sum.quantity,
      };
    }),
  );

  return {
    stats: {
      activeCarts: activeCartsCount,
      abandonedCarts: abandonedCartsCount,
      conversionRate: parseFloat(conversionRate), // Trả về số thực (ví dụ: 45.5)
    },
    leaderboard: topProducts,
  };
};

module.exports = {
  getCartAnalytics,
};
