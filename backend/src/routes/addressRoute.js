const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

const { verifyToken } = require('../middlewares/authMiddleware');

// Khai báo các endpiont
router.post('/', verifyToken, addressController.createAddress);
router.get('/', verifyToken, addressController.getAddresses);
router.put('/:id', verifyToken, addressController.updateAddress);
router.delete('/:id', verifyToken, addressController.deleteAddress);

module.exports= router;