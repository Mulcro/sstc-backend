const express = require('express');
const router = express.Router();
const tutorController = require('../../controllers/tutorController');

router.route('/')
    .get(tutorController.getAllTutors)
    .post(tutorController.createTutor)
    .patch(tutorController.checkInOrOut)

router.route('/individualsession')
    .post(tutorController.getTutorsInIndvlSessions)

router.route('/ingroup')
    .get(tutorController.getTutorsInGroup);
    
router.route('/available')
    .get(tutorController.getAllAvailableTutors)
    .post(tutorController.getAvailableTutorsBySubject);

router.route('/clockedIn')
    .get(tutorController.getClockedInTutors);

router.route('/:id')
    .patch(tutorController.updateTutor)
    .delete(tutorController.deleteTutor);


module.exports = router;