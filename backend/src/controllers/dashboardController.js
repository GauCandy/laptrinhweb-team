const dashboardService = require("../services/dashboardService");

const getAdminDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData();
    res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi lấy dữ liệu Dashboard" });
  }
};

module.exports = { getAdminDashboard };
