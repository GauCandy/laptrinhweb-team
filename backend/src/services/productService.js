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
  // Tính toán số bản ghi cần bỏ qua (skip)
  const skip = (page - 1) * limit;

  // Lấy thêm các tham số mới từ query
  const { search, categoryId, minPrice, maxPrice, sortBy } = query;

  // Xây dựng bộ lọc động (Dynamic Where)
  const whereCondition = {};
  
  if (search) {
    // Tìm kiếm tương đối theo tên, không phân biệt hoa thường
    whereCondition.name = { contains: search, mode: 'insensitive' };
  }
  
  if (categoryId) {
    whereCondition.categoryId = Number(categoryId);
  }

  // Lọc theo khoảng giá
  if (minPrice || maxPrice) {
    whereCondition.price = {};
    if (minPrice) whereCondition.price.gte = parseFloat(minPrice);
    if (maxPrice) whereCondition.price.lte = parseFloat(maxPrice);
  }

  // Logic sắp sếp (orderBy)
  let orderByCondition = { createdAt: 'desc' }; // Mặc định mới nhất
  if (sortBy === 'price_asc') orderByCondition = { price: 'asc' };
  if (sortBy === 'price_desc') orderByCondition = { price: 'desc' };

  // Dùng Promise.all để chạy song song 2 lệnh: Lấy dữ liệu + Đếm tổng số
  const [products, totalItems] = await Promise.all([
    prisma.product.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      include: { category: true, images: true }, // Kéo theo cả thông tin Danh mục của sản phẩm đó
      orderBy: orderByCondition // Sử dụng biến sắp sếp động
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

     // Tách images ra khỏi updateData để xử lý riêng
    const { images, ...productData } = updateData;

    return await prisma.product.update({
        where: { id: Number(id) },
        data: {
            ...productData,
            price: updateData.price ? parseFloat(updateData.price) : undefined,
            stock: updateData.stock ? parseInt(updateData.stock) : undefined,
            categoryId: updateData.categoryId ? Number(updateData.categoryId) : undefined,

            ...(images && images.length > 0 && {
              images: {
                deleteMany: {},  // Xóa ảnh cũ
                create: images.map(url => ({ url})) // Tạo ảnh mới
              }
            })
        },
        include: { images: true }
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