const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Thêm địa chỉ mới
 */

const createAddress = async (userId, addressData) => {
  const { address, phone } = addressData;
  
  const newAddress = await prisma.address.create({
    data: {
      userId: userId,
      address: address,
      phone: phone
    }
  });
  
  return newAddress;
};

/**
 *  Lấy danh sách địa chỉ một người dùng
 */
const getUserAddresses = async (userId) => {
    const addresses = await prisma.address.findMany({
        where: {
        userId: userId
        },
        orderBy: {
            createdAt: 'desc' // Sắp sếp thời gian mới tạo lên đầu
        }
    });

    return addresses;
};

/**
 *  Cập nhật địa chỉ
 */
const updateAddress = async (userId, addressId, addressData) => {
    const { address, phone } = addressData;

    // Bảo mật: Đảm bảo địa chỉ này thực sự thuộc về userId đang request (Tránh lỗi IDOR)
    const existingAddress = await prisma.address.findFirst({
        where: { id: Number(addressId), userId: userId }
    });

    if (!existingAddress) {
        throw new Error("Không tìm thấy địa chỉ hoặc bạn không có quyền sửa!")
    }

    const updateAddress = await prisma.address.update({
        where: { id: Number(addressId) },
        data: { address, phone }
    });

    return updateAddress;
};

/**
 *  Xóa địa chỉ
 */
const deleteAddress = async (userId, addressId) => {
    // Bảo mật tương tự như lúc update
    const existingAddress = await prisma.address.findFirst({
       where: { id: Number(addressId), userId: userId }
    });

    if (!existingAddress) {
        throw new Error("Không tìm thấy địa chỉ hoặc bạn không có quyền xóa!");
    }

    await prisma.address.delete({
        where: { id: Number(addressId) }
    });

    return true;
};

module.exports = {
    createAddress,
    getUserAddresses,
    updateAddress,
    deleteAddress
};