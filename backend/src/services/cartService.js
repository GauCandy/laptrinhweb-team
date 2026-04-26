const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Thêm sản phẩm vào giỏ hàng
 */

const addToCart = async (userId, productId, quantity) => {
  // Kiểm tra sản phẩm có tồn tại và còn hàng không?
  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  });
  if (!product) throw new Error("Sản phẩm không tồn tại!");
  if (product.stock < quantity) throw new Error("Số lượng tồn kho không đủ!");

  // Tìm giỏ hàng của user. Nếu chưa có thì tạo mới
  let cart = await prisma.cart.findUnique({
    where: { userId: Number(userId) },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: Number(userId) },
    });
  }

  // Kiểm tra xem sản phẩm đã có trong giỏ hàng (CartItem) chưa
  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: Number(productId),
    },
  });

  let savedCartItem;

  if (existingCartItem) {
    // ĐÃ có : Cộng dồn số lượng
    const newQuantity = existingCartItem.quantity + Number(quantity);

    // Kiểm tra lại tồn kho một lần nữa sau khi cộng dồn
    if (product.stock < newQuantity)
      throw new Error("Số lượng vượt quá tồn kho cho phép!");

    savedCartItem = await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    // chưa có cartItem
    return await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: Number(productId),
        quantity: Number(quantity),
      },
    });
  }

  await prisma.cart.update({
    where: { id: cart.id },
    data: { updatedAt: new Date() }, // Ép thời gian về đúng giây phút hiện tại
  });

  return savedCartItem;
};

/**
 * Lấy toàn bộ giỏ hàng và tính tổng tiền
 */
const getCart = async (userId) => {
  // Lấy giỏ hàng, kéo theo CartItems, kéo theo Product, kéo theo cả Images
  const cart = await prisma.cart.findUnique({
    where: { userId: Number(userId) },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true, // Lấy luôn mảng ảnh để frontend hiển thị
            },
          },
        },
      },
    },
  });

  // Nếu user chưa từng thêm cái gì vào giỏ, trẻ về giỏ rỗng
  if (!cart) {
    return { items: [], totalAmount: 0 };
  }

  // Tính toán tổng tiền và format lại dữ liệu cho frontend dễ đọc
  let totalAmount = 0;

  const formattedItems = cart.items.map((item) => {
    const itemTotal = item.quantity * item.product.price;
    totalAmount += itemTotal; // Cộng dồn vào tổng hóa đơn

    // Dọn dẹp lại cục dữ liệu cho gọn gàng
    return {
      cartItemId: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      itemTotal: itemTotal,
      images: item.product.images,
    };
  });

  return {
    cartId: cart.id,
    items: formattedItems,
    totalAmount: totalAmount,
  };
};

/**
 * Cập nhật số lượng của một món trong giỏ
 */
const updateCartItem = async (userId, itemId, newQuantity) => {
  // Chặn ngay nếu truyền số lượng âm hoặc bằng 0
  if (newQuantity < 1) {
    throw new Error("Số lượng sản phẩm phải lớn hơn 0!");
  }

  // Tìm món hàng đó, đồng thời kéo theo thông tin Giỏ (cart) và Sản phẩm (product)
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: Number(itemId) },
    include: {
      cart: true, // Check giỏ hàng này của ai
      product: true, // Check xem kho còn bao nhiêu
    },
  });

  if (!cartItem) {
    throw new Error("Không tìm thấy sản phẩm này trong giỏ hàng!");
  }

  // Lớp bảo vệ: Giỏ hàng này có phải của User đang request không?
  if (cartItem.cart.userId !== Number(userId)) {
    throw new Error(
      "Cảnh báo: Bạn không có quyền sửa giỏ hàng của người khác!",
    );
  }

  // Lớp bảo vệ tồn kho: Số lượng mới có vượt quá số lượng trong kho không?
  if (cartItem.product.stock < newQuantity) {
    throw new Error(
      `Không đủ hàng! Kho chỉ còn tối đa ${cartItem.product.stock} sản phẩm.`,
    );
  }

  // Mọi thuews hợp lệ -> tiến hành cập nhật
  return await prisma.cartItem.update({
    where: { id: Number(itemId) },
    data: { quantity: Number(newQuantity) },
  });
};

/**
 * Xóa một món hàng khỏi giỏ
 */
const removeCartItem = async (userId, itemId) => {
  // Tìm món hàng và check xem nó nawmg ở giỏ của ai
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: Number(itemId) },
    include: {
      cart: true, // Kéo thông tin ra để check userId
    },
  });

  if (!cartItem) {
    throw new Error("Không tìm thấy sản phẩm này trong giỏ hàng!");
  }

  // Check xem user có đang xóa đúng đồ của mình chưa
  if (cartItem.cart.userId !== Number(userId)) {
    throw new Error(
      "Cảnh báo: Bạn không có quyền xóa đồ trong giỏ của người khác!",
    );
  }

  // Mọi thứ Ok -> Tiến hành xóa luônn
  await prisma.cartItem.delete({
    where: { id: Number(itemId) },
  });

  return true;
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
};
