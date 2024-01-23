const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authRoutes = require('./authRoutes');

// Rotas para inserir, atualizar e deletar dados
router.post('/items', itemController.createItem);
router.get('/items', itemController.getAllItems)
router.put('/items/:id', itemController.updateItemById);
router.delete('/items/:id', itemController.deleteItemById);

router.use('/auth', authRoutes);

module.exports = router;
