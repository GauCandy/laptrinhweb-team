// src/services/productService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Lấy danh sách Sản phẩm (Có phân trang và tìm kiếm)
 */
const getPublicProducts = async (query) => {
  // Đặt giá trị mặc định nếu client không gửi lên
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || '';
  const categoryId = query.categoryId;

  // Tính toán số bản ghi cần bỏ qua (skip)
  const skip = (page - 1) * limit;

  // Xây dựng bộ lọc động (Dynamic Where)
  const whereCondition = {};
  
  if (search) {
    // Tìm kiếm tương đối theo tên, không phân biệt hoa thường
    whereCondition.name = { contains: search, mode: 'insensitive' };
  }
  
  if (categoryId) {
    whereCondition.categoryId = Number(categoryId);
  }

  // Dùng Promise.all để chạy song song 2 lệnh: Lấy dữ liệu + Đếm tổng số
  const [products, totalItems] = await Promise.all([
    prisma.product.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      include: { category: true }, // Kéo theo cả thông tin Danh mục của sản phẩm đó
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where: whereCondition })
  ]);

  return {
    products,
    pagination: {
      currentPage: page,
      limit: limit,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / limit) // Làm tròn lên
    }
  };
};

/**
 * Xem chi tiết 1 Sản phẩm
 */
const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true } // Tương lai sẽ include thêm bảng Reviews hoặc Images ở đây
  });

  if (!product) throw new Error("Không tìm thấy sản phẩm này!");
  return product;
};

/**
 * Thêm sản phẩm mới (ADMIN)
 */
const createProduct = async (productData) => {
    const { name, description, price, stock, categoryId, images } = productData;

    // Kiểm tra danh mục có tồn tại không trước khi gán sản phẩm vào
    const category = await prisma.category.findUnique({
        where: { id: Number(categoryId) }
    });
    if (!category) throw new Error("Danh mục không tồn tại!");

    return await prisma.product.create({
        data: {
            name,
            description,
            price: parseFloat(price), // Đảm bảo là số thực (Float)
            stock: parseInt(stock), // Đảm bảo tồn kho là số nguyên (Int)
            categoryId: Number(categoryId),
            images: {
              create: images && images.length > 0
              ? images.map(imgUrl => ({ url: imgUrl }))
              :[] // Nếu không có ảnh thì để mảng rỗng
            } 
        },
        include: {
          images: true // Để sau khi tạo xong nó trả về một list ảnh cho mình xem
        }
    });
};

/**
 * Cập nhật sản phẩm (ADMIN)
 */
const updateProduct = async (id, updateData) => {
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) throw new Error("Không tìm thấy sản phẩm!");

    return await prisma.product.update({
        where: { id: Number(id) },
        data: {
            ...updateData,
            price: updateData.price ? parseFloat(updateData.price) : undefined,
            stock: updateData.stock ? parseInt(updateData.stock) : undefined,
            categoryId: updateData.categoryId ? Number(updateData.categoryId) : undefined
        }
    });
};

/**
 * Xóa sản phẩm (ADMIN)
 */
const deleteProduct = async (id) => {
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) throw new Error("Không tìm thấy sản phẩm!");

    await prisma.product.delete({ where: { id: Number(id) } });
    return true;
};

module.exports = {
  getPublicProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};