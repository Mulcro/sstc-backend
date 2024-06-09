const Tutor = require('../models/Tutor');
const Student = require('../models/Student');
const Session = require('../models/Session');

//Create Session


    //TO-DO: Need to implement queue for students waiting for a tutor that isn't available yet

    //TO-DO: Need to implement session timer

    //TO-DO: Need to implement logic to not allow a tutor to be in multiple sessions at once

    //TO-DO: Need functionality to extend a session

const createSession = async (req, res) => {
    console.log(req.body)
    if(!req.body.tutorId || !req.body.subjectId || !req.body.studentFirstName || !req.body.studentLastName || !req.body.type || !req.body.startTime) return res.status(400).json({message:"Missing Parameters"
    })
    try{
        const {tutorId} = req.body;

        const tutorInSession = await Session.findOne({tutorId:tutorId, active: true});


        if(tutorInSession) return res.status(409).json({message: "Tutor already in session"});
        const studentId = parseInt(req.body.studentId);

        let studentObjectId;

        
        studentObjectId = await Student.findOne({studentId})._id;

        
        const {subjectId, startTime, studentFirstName, type, studentLastName} = req.body;


        //Went through the hassle of doing this so I can query sessions by student if ever needed
        if(!studentObjectId){
            const createdUser = await Student.create({
                firstName: studentFirstName,
                lastName: studentLastName,
                studentId
            })

            const savedStudent = await createdUser.save()
            if(!savedStudent) return res.status(500)

            studentObjectId = savedStudent._id;
        }
        

        const session = await Session.create({ type, tutorId, student:studentObjectId, subjectId, startTime});
        
        const tutor = await Tutor.findById(tutorId);

        if(!tutor) return res.status(404).json({message: "user doesn't exist"})

        tutor.isAvailable = false;   
        await tutor.save()

        await session.save();

        console.log("new session created");
        
        return res.status(201).json({ session });
    }
    catch(err){
        console.log(err._message)
        return res.status(500).json({ message: err._message });
    }
}

//The queue has to check if sessions are over asynchronously and has to operate at intervals

// TO-DO: get this to work

//To get this functionality to work I'm going to add a students in queue object to the tutors and ensure that whenever a student is added to their queue, that attribute of the tutor is populated.

//When the session that the tutor is in ends, if the queue isn't empty then the next student starts a session with them automatically.

//The queue should maybe only hold a max of 3 students

//To implement this I'll only need to use the create session funtion to create a new session then remove the student from the queue. Maybe I'll remove the student from the queue first so I can send it without having to create functionality to modify the queue inside of the create session function.

//TO-DO: Need to have functionality to update the queue in case someone doesn't show up
//TO-DO: Need to create possibility to view the queue and remove people from the queue if they don't want to wait anymore
const addStudentToQueue = async (req,res) => {
    if(!req.body.tutorId || !req.body.subjectId || !req.body.studentFirstName || !req.body.studentLastName || !req.body.type) return res.status(400).json({message:"Missing Parameters"
    })
    try {       
        const {studentFirstName,studentLastName,tutorId,studentId,subjectId,type} = req.body;

        const tutor = await Tutor.findById(tutorId);
        if(!tutor) return res.status(404).json({message: "no tutor found"});

        if(tutor.isAvailable === true) return res.status(400).json({message: "Tutor is currently free, can't queue"});

        if(tutor.studentsInQueue.length > 2) return res.status(500).json({message: "Queue is full"});

        const studentData = {
            studentFirstName,
            studentLastName,
            studentId,
            tutorId,
            subjectId,
            type
        }

        tutor.studentsInQueue.push(studentData)

        await tutor.save()

        return res.status(200)
    }

    catch (err) { 
        console.log(err);
        return res.status(500).json({message: err})
    }
}

const createSessionFromQueuedStudent = (req,res) => {
    const studentInQueue = tutor.studentsInQueue.shift();
}

//TO-DO: Check if student is in queue after session ends
//TO-DO: Add startTime when creating new session if someone is in queue
const endSession = async (req, res) => {
    if(!req.params.sessionId) return res.status(400).json({message:"Missing Parameters"
    })
    try{
        const { sessionId } = req.params;
        const session = await Session.findById(sessionId);

        console.log(session._id);

        session.actualEnd = Date.now();
        session.active = false;
        await session.save();

        const tutor = await Tutor.findById(session.tutorId);

        if(tutor.studentsInQueue.length > 0){
            const nextStudent = tutor.studentsInQueue.shift();
            await tutor.save()

            const modifiedReq = {
                body:{
                    studentFirstName: nextStudent.studentFirstName,
                    studentLastName: nextStudent.studentLastName,
                    tutorId: session.tutorId,
                    subjectId: nextStudent.subjectId,
                    type: nextStudent.type,
                    studentId: nextStudent.studentId,
                    startTime: Date.now()
                }
            }

            console.log("hit")
            await createSession(modifiedReq,res);
        }

        else{
            tutor.isAvailable = true;
            await tutor.save();
            return res.status(200).json({ session });
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}


//Get every session that has taken place
const getAllSessions = async (req, res) => {
    try{
        const sessions = await Session.find().populate('tutorId').populate('subject').populate('student');

        return res.status(200).json({ sessions });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

//Get Tutors in Sessions
const getActiveSessions = async (req, res) => {
    try{
        const sessions = await Session.find({ active: true }).populate('tutorId').populate('subjectId').populate('student');

        return res.status(200).json({ sessions });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

//Get all sessions in a certain time frame
//Need to work on

//Get all sessions for a certain tutor
const getTutorSessionHistory = async (req, res) => {
    try{
        const { tutorId } = req.params;
        const sessions = await Session.find({ tutor: tutorId });

        return res.status(200).json({ sessions });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}

//Get all sessions for a certain student
const getStudentSessionHistory = async (req, res) => {
    try{
        const { studentId } = req.params;
        const studentObjId = await Student.findOne({ studentId: studentId })._id;
        
        const sessions = await Session.find({ student: studentObjId });

        return res.status(200).json({ sessions });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}


module.exports = { createSession, endSession, getAllSessions, getActiveSessions, getTutorSessionHistory, getStudentSessionHistory, addStudentToQueue };