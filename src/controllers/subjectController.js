const Subject = require('../models/Subject');

//Create Subject function
const createSubject = async (req, res) => {
    try{
        const { name } = req.body;

        //check if subject already exists
        if (await
            Subject.findOne({ name })) {
            return res.status(400).json({ message: 'Subject already exists' });
        }

        const subject = await Subject.create({ name });

        await subject.save();

        return res.status(201).json({ subject });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}

//Get all subjects
const getAllSubjects = async (req, res) => {
    try{
        const subjects = await Subject.find();

        return res.status(200).json({ subjects });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}

const getSubjectById = async (req, res) => {
    try{
        const { subjectId } = req.params;

        const subject = await Subject.findById(subjectId);

        return res.status(200).json({ subject });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}

//update subject name
const updateSubject = async (req, res) => {
    try{
        const {subjectId, newName } = req.params;

        const subject = await Subject.findById(subjectId);
        
        subject.name = newName;

        subject.save();

        return res.status(200).json({ subject });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}


//delete subject by id
const deleteSubject = async (req, res) => {
    try{
        const { subjectId } = req.params;

        const subject = await Subject.findById(subjectId);

        subject.remove();

        subject.save();

        return res.status(200).json({ message: 'Subject deleted' });

    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}

module.exports = { createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject };



