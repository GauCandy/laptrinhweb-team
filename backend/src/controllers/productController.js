const productService = require('../services/productService');
const getProducts = async (req, res) => {
    try {
        // Truyền toàn bộ URL Query (sau dấu ?) xuống cho Service xử lý
        const result = await productService.getPublicProducts(req.query);
        
        res.status(200).json({
            success: true,
            data: result.products,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
    }
};

const getProductDetails = async (req, res) => {
    try{
        const { id } = req.params;
        const product = await productService.getProductById(id);
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {

        // Lấy url ảnh từ req.file (do Cloudinary middleware xử lý)
        const images = req.file ? [req.file.path] : [];

        const product = await productService.createProduct({
            ...req.body, // name, price, stock, categoryId, description
            images,     // Truyền thêm mảng ảnh vào

        });

        res.status(201).json({ success: true, message: "Tạo sản phẩm thành công", data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {

         const images = req.file ? [req.file.path] : null;

        const product = await productService.updateProduct(
            req.params.id,
            {
                 ...req.body,
                 images,
            }
        );
        res.status(200).json({ success: true, messgae: "Cập nhật thành công", data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.status(200).json({ success: true, message: "Xóa sản phẩm thành công" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
    createProduct
};