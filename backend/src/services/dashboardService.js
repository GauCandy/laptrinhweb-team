const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getDashboardData = async () => {
  // 1. CHUẨN BỊ MỐC THỜI GIAN (Lấy 7 ngày gần nhất tính cả hôm nay)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // =========================================
  // PHẦN 1: 4 THẺ THỐNG KÊ TRÊN CÙNG
  // =========================================
  const totalUsers = await prisma.user.count({ where: { role: "CUSTOMER" } }); // Chỉ đếm khách hàng
  const totalProducts = await prisma.product.count();
  const totalOrders = await prisma.order.count();

  // Tính tổng doanh thu (Giả sử bỏ qua các đơn PENDING hoặc CANCELLED, bạn có thể chỉnh lại enum cho đúng)
  const revenueAgg = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      // status: 'COMPLETED' // Mở comment dòng này nếu bạn có trạng thái COMPLETED
    },
  });
  const totalRevenue = Number(revenueAgg._sum.totalAmount || 0); // Ép kiểu Decimal về Number

  // =========================================
  // PHẦN 2: DỮ LIỆU BIỂU ĐỒ (7 ngày qua)
  // =========================================
  // Khởi tạo mảng 7 ngày mặc định doanh thu = 0 (Để lỡ ngày nào ko có đơn thì biểu đồ không bị thủng)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    chartData.push({ date: dateStr, revenue: 0 });
  }

  // Lấy các đơn hàng trong 7 ngày qua
  const recentOrdersForChart = await prisma.order.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, totalAmount: true },
  });

  // Cộng dồn doanh thu vào đúng ngày
  recentOrdersForChart.forEach((order) => {
    const d = new Date(order.createdAt);
    const dateStr = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const chartItem = chartData.find((item) => item.date === dateStr);
    if (chartItem) {
      chartItem.revenue += Number(order.totalAmount);
    }
  });

  // =========================================
  // PHẦN 3: 5 ĐƠN HÀNG GẦN ĐÂY
  // =========================================
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { fullName: true, email: true } }, // Lấy thêm tên khách hàng
    },
  });

  // Ép kiểu Decimal về Number cho dễ dùng ở Frontend
  const formattedRecentOrders = recentOrders.map((order) => ({
    ...order,
    totalAmount: Number(order.totalAmount),
  }));

  // PHẦN 4: TOP 5 SẢN PHẨM BÁN CHẠY NHẤT
  // Gom nhóm (Group By) theo productId và tính tổng quantity
  const topProductsAgg = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  // Lấy thêm thông tin chi tiết (Tên, Giá) cho các sản phẩm lọt top
  const topProductIds = topProductsAgg.map((p) => p.productId);
  const topProductsData = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, price: true },
  });

  // Ráp dữ liệu tổng quantity và thông tin sản phẩm lại với nhau
  const topSellingProducts = topProductsAgg.map((agg) => {
    const productInfo = topProductsData.find((p) => p.id === agg.productId);
    const soldQuantity = agg._sum.quantity;
    const price = Number(productInfo.price);
    return {
      id: productInfo.id,
      name: productInfo.name,
      price: price,
      soldQuantity: soldQuantity,
      revenue: price * soldQuantity, // Tính doanh thu mang lại từ sp này
    };
  });

  // TRẢ VỀ TOÀN BỘ CỤC DATA
  return {
    stats: { totalUsers, totalProducts, totalOrders, totalRevenue },
    chartData: chartData,
    recentOrders: formattedRecentOrders,
    topSellingProducts: topSellingProducts,
  };
};

module.exports = { getDashboardData };
