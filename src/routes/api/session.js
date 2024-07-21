const express = require('express');
const router = express.Router();
const sessionController = require('../../controllers/sessionController');

router.route('/')
    .get(sessionController.getAllIndividualSessions)
    .post(sessionController.createIndividualSession);

router.route('/group')
    .post(sessionController.createGroupSession);

router.route('/group/:sessionId')
    .patch(sessionController.endGroupSession)

router.route('/group/:tableId')
    .get(sessionController.getActiveGroupSessionByTable)

router.route('/:sessionId')
    .patch(sessionController.startIndividualSession)

router.route('/end/:sessionId')
    .patch(sessionController.endIndividualSession);

router.route('/active')
    .get(sessionController.getActiveIndividualSessions);

router.route('/tutors/:tutorId')
    .get(sessionController.getTutorIndividualSessionHistory);

router.route('/students/:studentId')
    .get(sessionController.getStudentIndividualSessionHistory);

router.route('/queue')
    .post(sessionController.addStudentToQueue);

router.route('/extend/:sessionId')
    .patch(sessionController.extendIndividualSession);    
    
router.route('/:sessionId/pause')
    .patch(sessionController.pauseIndividualSession)

router.route('/:sessionId/resume')
    .patch(sessionController.resumeIndividualSession)
    
module.exports = router;
