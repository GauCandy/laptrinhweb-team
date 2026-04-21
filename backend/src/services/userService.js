const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Lấy danh sách tất cả người dùng (dành cho admin)
 */
const getAllUsers = async (search, roleFilter) => {

    let whereCondition = {};

    // Nếu có từ khóa tìm kiếm
    if (search) {
        whereCondition.OR = [
            { fullName: { contains: search } },
            { email: { contains: search } }
        ];
    }

    // Lọc theo Role
    if ( roleFilter && roleFilter !== 'ALL') {
        whereCondition.role = roleFilter;
    }

    const users = await prisma.user.findMany({
        // Chỉ lấy các trường an toàn, GIẤU password đi
        select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            authProvider: true,
            isActive: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return users;
};

/**
 * Thay đổi phân quyền người dùng (Dành cho Admin)
 */
const updateUserRole = async (userId, newRole) => {
    // Kiểm tra xem Role truyền lên có hợp lệ với Enum trong Database không
    const validRole = ['CUSTOMER', 'ADMIN'];
    if (!validRole.includes(newRole)) {
        throw new Error("Quyền (Role) không hợp lệ! Chỉ chấp nhận CUSTOMER hoặc ADMIN.");
    }

    // Kiểm tra user có tồn tại không
    const userExists = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!userExists) {
        throw new Error("Không tìm thấy ngưới dùng này!");
    }

    // Cập nhật role
    const updatedUser = await prisma.user.update({
        where: { id: Number(userId) },
        data: { role: newRole },
        select: { id: true, email: true, fullName: true, role: true } // Trả về thông tin cơ bản sau khi update
    });

    return updatedUser;
};

/**
 * Khóa hoặc Mở khóa tài khoản người dùng
 */
const toggleUserStatus = async (userId, status) => {
    const userExists = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!userExists) {
        throw new Error("Không tìm thấy người dùng này!");
    }

    const updatedUser = await prisma.user.update({
        where: { id: Number(userId) },
        data: { isActive: status }, // Truyền vào là true hoặc false
        select: { id: true, email: true, fullName: true, isActive: true }
    });

    return updatedUser;
}

module.exports = {
    getAllUsers,
    updateUserRole,
    toggleUserStatus
};