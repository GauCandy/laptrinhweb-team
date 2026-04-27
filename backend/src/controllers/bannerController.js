const bannerService = require("../services/bannerService");

const getActive = async (req, res) => {
  try {
    const banners = await bannerService.getActiveBanners();
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdmin = async (req, res) => {
  try {
    const banners = await bannerService.getAllBannersAdmin();
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const bannerData = {
      imageUrl: req.file?.path || req.body.imageUrl,
      targetLink: req.body.targetLink,
      position: req.body.position,
    };

    const newBanner = await bannerService.createBanner(bannerData);
    res.status(201).json({
      success: true,
      message: "Thêm Banner thành công!",
      data: newBanner,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const toggleStatus = async (req, res) => {
  try {
    const { currentStatus } = req.body;
    const update = await bannerService.toggleBannerStatus(
      req.params.id,
      currentStatus,
    );
    res.status(200).json({ success: true, message: "Đã cập nhật trạng thái!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await bannerService.deleteBanner(req.params.id);
    res.status(200).json({ success: true, message: "Đã xóa Banner!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getActive,
  getAdmin,
  create,
  toggleStatus,
  remove,
};
