const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient;

// Tạo danh mục mới
const createCategory = async (name, description ) => {
    // Kiểm tra xem tên danh mục đã tồn tại chưa (vì chúng ta đặt @unique trong schema)
    const existingCategory = await prisma.category.findUnique({ where: { name } });
    if (existingCategory) {
        throw new Error("Tên danh mục này đã tồn tại!");
    }

    const category = await prisma.category.create({
        data: { name , description }
    });

    return category;
};

// Lấy tất cả danh mục
const getCategories = async () => {
    const categories = await prisma.category.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return categories;
};

// Cập nhật danh mục
const updateCategory = async (id, data) => {
    const { name, description } = data;

    // Kiểm tra id có tồn tại không
    const categoryExists = await prisma.category.findUnique({ where: { id: Number(id) } });
    if (!categoryExists) throw new Error("Không tìm thấy danh mục!");

    const updateCategory = await prisma.category.update({
        where: { id: Number(id) },
        data: { name, description }
    });
    return updateCategory;
};

// Xóa danh mục 
const deleteCategory = async (id) => {
    const categoryExists = await prisma.category.findUnique({ where: {id: Number(id) } });
    if (!categoryExists) throw new Error("Không tìm thấy danh mục!");

    await prisma.category.delete({
        where: { id: Number(id) }
    });
    return true;
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};