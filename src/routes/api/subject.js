const express = require('express');
const router = express.Router();
const subjectController = require('../../controllers/subjectController');

router.route('/')
    .get(subjectController.getAllSubjects)
    .post(subjectController.createSubject);

router.route('/:subjectId')
    .get(subjectController.getSubjectById)
    .patch(subjectController.updateSubject)
    .delete(subjectController.deleteSubject);

module.exports = router;