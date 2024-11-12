const Tutor = require('../models/Tutor');
const GroupTable = require('../models/GroupTable');

//Create Tutor function
const createTutor = async (req, res) => {
    try{
        const { firstName, lastName, subjects,studentId, shifts } = req.body;
        
        const tutor = await Tutor.create({ firstName, lastName, studentId, subjects, shifts });

        await tutor.save();

        return res.status(201).json({ tutor });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}

//Get all available tutors
const getAllAvailableTutors = async (req, res) => {
    try{   
        const tutors = await Tutor.find({ clockedIn:true,isAvailable: true });

        return res.status(200).json({tutors})
    }
    catch(err){
            return res.status(500).json({message: err.message})
    }
}

//Get all available tutors by subject
const getAvailableTutorsBySubject = async (req, res) => {
    try{   
        const {option} = req.body;
        let tutors;

        if(option == null){
            tutors = await Tutor.find({ clockedIn:true,isAvailable: true });
        }
        else{
            tutors = await Tutor.find({
                    clockedIn:true,
                    isAvailable: true,
                    subjects : {$in: [option]}
                })
        }
        return res.status(200).json({tutors})
    }
    catch(err){
            return res.status(500).json({message: err.message})
    }
}

//Get clocked in tutors by subject
const getClockedInTutors = async (req,res) => {
    try{   
        let tutors;

        tutors = await Tutor.find({ clockedIn:true});

        return res.status(200).json({tutors})
    }
    catch(err){
            return res.status(500).json({message: err.message})
    }
}

//For finding tutors that are in sessions & are able to have students queued 
const getTutorsInIndvlSessions = async (req,res) => {
    if(!req.body.option) return res.status(400).json({message: "Bad Request"})
    try{
        const option = req.body.option;

        const tutors = await Tutor.find({
            clockedIn:true,
            atGroup:false,
            isAvailable:false,
            subjects : {$in: [option]}
        })
        
        return res.status(200).json({tutors})
    }
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

const getTutorsInGroup = async (req,res) => {
    try{
        let subjectQuery;

        if(!req.body.subjectQuery)
            subjectQuery = {}
        else
            subjectQuery = req.body.subjectQuery

        const tutors = await Tutor.find({atGroup: true})

        return res.status(200).json(tutors)
    }
    catch(err){
        return res.status(500).json({message: err.message})
    }

}


//Get all tutors
const getAllTutors = async (req, res) => {
    try{
        const tutors = await Tutor.find();

        return res.status(200).json({ tutors });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}

//Get tutor by ID
const getTutorById = async (req, res) => {
    try{
        const tutor = await Tutor.findById(req.params.id);

        return res.status(200).json({ tutor });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}


//Update tutor
const updateTutor = async (req, res) => {
    try{
        const tutor = await Tutor.findById(req.params.id);

        if(tutor){
            const { firstName, lastName, subjects,studentId, shifts, daysavailable } = req.body;

            tutor.firstName = firstName;
            tutor.lastName = lastName;
            tutor.studentId = studentId;
            tutor.subjects = subjects;
            tutor.shifts = shifts;
            tutor.daysavailable = daysavailable;

            await tutor.save();

            return res.status(200).json({ tutor });
        }
        else{
            return res.status(404).json({ message: 'Tutor not found' });
        }
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}

//TO-DO: Delete tutors students in queue after they check out
const checkInOrOut = async (req, res) => {
    const option = parseInt(req.body.option);

    switch(option){
        case 1:
            try{
                const tutor = await Tutor.findOne({studentId: req.body.studentId});
                if(!tutor) return res.status(404).json({message:"No tutor found"})
                    
                tutor.clockedIn = true;
                tutor.isAvailable = true;
        
                await tutor.save();
        
                return res.status(200).json({message:"success"})
            }
            catch(err){
                return res.status(409).json({message: err.message})
            }
        
        case 2:
            try{
                const tutor = await Tutor.findOne({studentId: req.body.studentId});
                tutor.clockedIn = false;
                tutor.isAvailable = false;

                await tutor.save();

                return res.status(200)
            }
            catch(err){
                return res.status(500).json({message: err.message})
            }
    }
}

//
// const checkInOrOutGroup = async (req,res) => {
//     const option = parseInt(req.body.option);

//     switch(option){
//         case 1:
//             try{
//                 const tutor = await Tutor.findOne({studentId: req.body.studentId});
//                 console.log(tutor.firstName);
//                 tutor.clockedIn = true;
//                 tutor.isAvailable = true;
        
//                 await tutor.save();
        
//                 return res.status(200)
//             }
//             catch(err){
//                 return res.status(500).json({message: err.message})
//             }
        
//         case 2:
//             try{
//                 const tutor = await Tutor.findOne({studentId: req.body.studentId});
//                 tutor.clockedIn = false;
//                 tutor.isAvailable = false;

//                 await tutor.save();

//                 return res.status(200)
//             }
//             catch(err){
//                 return res.status(500).json({message: err.message})
//             }
//     }
// }

//Delete tutor
const deleteTutor = async (req, res) => {
    try{
        const tutor = await Tutor.findById(req.params.id);

        if(tutor){
            await tutor.remove();

            return res.status(200).json({ message: 'Tutor removed' });
        }
        else{
            return res.status(404).json({ message: 'Tutor not found' });
        }
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    createTutor,
    getTutorsInGroup,
    getAllAvailableTutors,
    getAvailableTutorsBySubject,
    getTutorsInIndvlSessions,
    getAllTutors,
    getClockedInTutors,
    checkInOrOut,
    updateTutor,
    deleteTutor
}

