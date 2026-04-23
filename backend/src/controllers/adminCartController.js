const adminCartService = require("../services/adminCartService");

const adminGetCartDashboard = async (req, res) => {
  try {
    const dashboardData = await adminCartService.getCartAnalytics();
    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi lấy thống kê: " + error.message });
  }
};

module.exports = {
  adminGetCartDashboard,
};
