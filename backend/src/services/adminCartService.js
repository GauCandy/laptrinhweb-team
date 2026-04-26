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
  const totalUsersWithCart = await prisma.cart.count();
  // Giả định bạn có bảng order. Nếu tên bảng khác, bạn sửa lại nhé!
  const usersWithOrdersRaw = await prisma.order.groupBy({
    by: ["userId"],
  });
  const totalUsersWithOrders = usersWithOrdersRaw.length;

  let conversionRate = 0;
  if (totalUsersWithCart > 0) {
    // Capping (Giới hạn tối đa 100% để tránh lỗi hiển thị nếu data test bị rác)
    let rate = (totalUsersWithOrders / totalUsersWithCart) * 100;
    conversionRate = rate > 100 ? 100 : rate.toFixed(1);
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
      try {
        const productInfo = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            images: true,
          },
        });

        if (!productInfo) {
          return {
            productId: item.productId,
            name: "Sản phẩm đã bị xóa",
            price: 0,
            image: null,
            totalInCarts: item._sum.quantity,
          };
        }

        let imageUrl = null;
        if (productInfo.images && productInfo.images.length > 0) {
          imageUrl = productInfo.images[0].url;
        }

        return {
          productId: item.productId,
          name: productInfo.name,
          price: productInfo.price,
          image: imageUrl,
          totalInCarts: item._sum.quantity,
        };
      } catch (error) {
        console.error(
          `Lỗi lấy thông tin sản phẩm ID ${item.productId}:`,
          err.message,
        );
        return {
          productId: item.productId,
          name: "Lỗi hiển thị tên",
          price: 0,
          image: null,
          totalInCarts: item._sum.quantity,
        };
      }
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
