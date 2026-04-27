const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Cho khách : Chỉ lấy những banner đang bật
const getActiveBanners = async () => {
  return await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
};

// Cho admin : Lấy tất cả banner
const getAllBannersAdmin = async () => {
  return await prisma.banner.findMany({
    orderBy: { createdAt: "desc" },
  });
};

// Thêm Banner mới
const createBanner = async (data) => {
  return await prisma.banner.create({
    data: {
      imageUrl: data.imageUrl,
      targetLink: data.targetLink || null,
      position: data.position || "HERO",
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
};

// Cho admin Bật tắt Banner
const toggleBannerStatus = async (id, currentStatus) => {
  return await prisma.banner.update({
    where: { id: Number(id) },
    data: { isActive: !currentStatus },
  });
};

// Xóa hẳn banner
const deleteBanner = async (id) => {
  return await prisma.banner.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  getActiveBanners,
  getAllBannersAdmin,
  createBanner,
  toggleBannerStatus,
  deleteBanner,
};
