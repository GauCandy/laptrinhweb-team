const reviewService = require('../services/reviewService');

const addReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.id;
        const review = await reviewService.createReview(userId, productId, req.body);

        res.status(201).json({ success: true, message: "Cảm ơn bạn đã đánh giá!", data: review });
    } catch (error) {
        res.status(403).json({ success: false, message: error.message });
    }
};

const getReviews = async (req, res) => {
    try {
        const productId = req.params.id;
        const reviews = await reviewService.getProductReviews(productId);
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addReview, getReviews };