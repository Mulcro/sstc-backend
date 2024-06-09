const express = require('express');
const router = express.Router();
const hoursController = require('../../controllers/hoursController');

router.route('/')
    .get(hoursController.getAllHours)


module.exports = router;