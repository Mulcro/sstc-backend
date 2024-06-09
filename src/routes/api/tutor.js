const express = require('express');
const router = express.Router();
const tutorController = require('../../controllers/tutorController');

router.route('/')
    .get(tutorController.getAllTutors)
    .post(tutorController.createTutor)
    .patch(tutorController.checkInOrOut)

router.route('/available')
    .post(tutorController.getAvailableTutors);

router.route('/clockedIn')
    .post(tutorController.getClockedInTutors);

router.route('/:id')
    .patch(tutorController.updateTutor)
    .delete(tutorController.deleteTutor);


module.exports = router;