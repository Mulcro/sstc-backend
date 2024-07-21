const express = require('express');
const router = express.Router();
const groupTableController = require('../../controllers/groupTableController')


router.route('/')
    .get(groupTableController.getGroupTables)
    .post(groupTableController.createGroupTable)

router.route('/find')
    .post(groupTableController.findGroupTable)

router.route('/clock')
    .patch(groupTableController.clockTutorInOrOut)

module.exports = router;