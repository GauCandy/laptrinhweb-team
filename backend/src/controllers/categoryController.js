const categoryService = require('../services/categoryService');

const createCategory = async (req, res) => {
    try  {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Tên danh mục là bắt buộc"});

        const category = await categoryService.createCategory(name, description);
        res.status(201).json({ success: true, message: "Tạo danh mục thành công", data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategories();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

const updateCategory = async (req, res ) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updateCategory = await categoryService.updateCategory(id, data);

        res.status(200).json({ success: true, message: "Cập nhật thành công", data: updatedCategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await categoryService.deleteCategory(id);
        res.status(200).json({ success: true, message: "Xóa danh mục thành công"});
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};