const express = require('express');
const router = express.Router();
const { addEliteCard, getEliteCards } = require('../controllers/eliteCardsController');

router.post('/elite-cards', addEliteCard);
router.get('/elite-cards', getEliteCards);

module.exports = router;
