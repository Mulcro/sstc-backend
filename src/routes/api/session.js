const express = require('express');
const router = express.Router();
const sessionController = require('../../controllers/sessionController');

router.route('/')
    .get(sessionController.getAllSessions)
    .post(sessionController.createSession);

router.route('/end/:sessionId')
    .patch(sessionController.endSession);

router.route('/active')
    .get(sessionController.getActiveSessions);

router.route('/tutors/:tutorId')
    .get(sessionController.getTutorSessionHistory);

router.route('/students/:studentId')
    .get(sessionController.getStudentSessionHistory);

router.route('/queue')
    .post(sessionController.addStudentToQueue);
    
module.exports = router;
