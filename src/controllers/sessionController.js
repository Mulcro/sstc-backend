const Tutor = require('../models/Tutor');
const Student = require('../models/Student');
const IndividualSession = require('../models/IndividualSession');
const GroupSession = require('../models/GroupSession');
const GroupTable = require('../models/GroupTable');

//TO-DO: Need to prevent students from being in multiple sessions at a time

//Create Session
const createGroupSession = async (req,res) => {
    console.log(req.body)
    if(!req.body.studentId || !req.body.groupTableId || !req.body.subjectId || !req.body.type) return res.status(400).json({message: "Bad request"})
    try{
        const {firstName,lastName,studentId,groupTableId,subjectId,type,language} = req.body;
        
        let student = await Student.findOne({ studentId });
        // Check if student exists; if not, create and save
            //Went through the hassle of doing this so I can query sessions by student if ever needed
        if(student){
            const isStudentInIndividualSession = await IndividualSession.find({student: student._id});
            const isStudentInGroupSession = await GroupSession.find({studentId: student._id});

            if(isStudentInGroupSession && isStudentInIndividualSession){
                console.log("Student in Session: " + (isStudentInGroupSession && isStudentInIndividualSession));
                return res.status(409).json({message: "Student is in Session"})
            }
        }
        else if (!student) {
            const createdStudent = await Student.create({
                firstName,
                lastName,
                studentId
            });

            const savedStudent = await createdStudent.save();

            if (!savedStudent) {
                return res.status(500).send("Failed to save student");
            }

            student = savedStudent;
        }

        const groupSession = await GroupSession.create({
            studentId: student._id,
            groupTableId,
            subjectId,
            type,
            startTime: Date.now(),
            language
        })
        
        await groupSession.save();

        return res.status(200).json(groupSession)
        
    }
    catch(err){
        console.log(err)
        return res.status(500).json({ message: err._message });
    }
}

//TO-DO: Need functionality for group sessions

//TO-DO: Need to add ability to be able to read array of users for session with multiple students.
const createIndividualSession = async (req, res) => {
    console.log('Req body: ' + req.body)
    if(!req.body.students || !req.body.tutorId || !req.body.subjectId || !req.body.type || !req.body.language) return res.status(400).json({message:"Missing Parameters"
    })
    try{
        const studentArr = req.body.students
        const {tutorId} = req.body;

        console.log("Students: " + JSON.stringify(studentArr))
        const tutorInSession = await IndividualSession.findOne({tutorId:tutorId, active: true});


        if(tutorInSession) return res.status(409).json({message: "Tutor already in session"});

        const {subjectId, studentFirstName, type, studentLastName, language} = req.body;

        let studentIdArr = [];
        studentArr.forEach((obj) => {
            studentIdArr.push(parseInt(obj.studentId));
        })
        
        let studentObjectIds = [];
        
        //Array.prototype.forEach doesn't not wait for asychronous operations so using loop here

        for (let i = 0; i < studentIdArr.length; i++) {
            try {
                const studentObject = await Student.findOne({ studentId: studentIdArr[i] });

                // Check if student exists; if not, create and save
                    //Went through the hassle of doing this so I can query sessions by student if ever needed
                if (!studentObject) {
                    const createdStudent = await Student.create({
                        firstName: studentArr[i].firstName,
                        lastName: studentArr[i].lastName,
                        studentId: studentIdArr[i]
                    });

                    const savedStudent = await createdStudent.save();
                    if (!savedStudent) {
                        return res.status(500).send("Failed to save student");
                    }

                    // Push the newly created student's _id to studentObjectIds
                    studentObjectIds.push(savedStudent._id); // Assuming savedStudent has _id
                } else {
                    // If student exists, push their _id to studentObjectIds
                    studentObjectIds.push(studentObject._id);
                }
            }     
            catch (error) {
                console.error("Error processing student:", error);
                return res.status(500).send("Error processing student");
            }
        }
    
        console.log(`Student Object Ids: ${studentObjectIds}`)
        const session = await IndividualSession.create({ 
            type, 
            tutorId, 
            student:studentObjectIds, 
            subjectId, 
            language
        });
        
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

const startIndividualSession = async (req,res) => {
    if(!req.params.sessionId) return res.status(400)

    try{
        const session = await IndividualSession.findById(req.params.sessionId);
        console.log("working")
        const currTime = Date.now();
        session.startTime = new Date(currTime);
        console.log("working")

        
        session.expectedEnd = new Date(currTime + (2*60*1000));

        console.log("working")

        await session.save();

        console.log("working")

        return res.status(200).json({message:"success"})
    }
    catch(err){
        return res.status(500).json({message: err})
    }
}

const getActiveGroupSessionByTable = async (req,res) => {
    if(!req.params.tableId) return res.status(400)
    try{
        const {tableId} = req.params;

        const activeSessions = await GroupSession.find({groupTableId: tableId, active: true}).populate('studentId').populate('subjectId');

        if(!activeSessions) return res.status(404).json({message: "No sessions"})

        return res.status(200).json(activeSessions);
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message: err})
    }
}

const endGroupSession = async (req,res) => {
    if(!req.params.sessionId) return res.status(400)
        try{
            const {sessionId} = req.params;
    
            const session = await GroupSession.findById(sessionId)
    
            if(!session) return res.status(404).json({message: "No session found"})
                
            session.active = false;
            session.endTime = Date.now();

            await session.save()

            return res.status(200).json({message:"Ended session"});
        }
        catch(err){
            console.log(err)
            return res.status(500).json({message: err})
        }
}
//The queue has to check if sessions are over asynchronously and has to operate at intervals

//To get this functionality to work I'm going to add a students in queue object to the tutors and ensure that whenever a student is added to their queue, that attribute of the tutor is populated.

//When the session that the tutor is in ends, if the queue isn't empty then the next student starts a session with them automatically.

//The queue should maybe only hold a max of 3 students

//To implement this I'll only need to use the create session funtion to create a new session then remove the student from the queue. Maybe I'll remove the student from the queue first so I can send it without having to create functionality to modify the queue inside of the create session function.

//TO-DO: Need to have functionality to update the queue in case someone doesn't show up
//TO-DO: Need to create possibility to view the queue and remove people from the queue if they don't want to wait anymore
const addStudentToQueue = async (req,res) => {
    if(!req.body.tutorId || !req.body.subjectId || !req.body.students || !req.body.language || !req.body.type) return res.status(400).json({message:"Missing Parameters"
    })
    try {       
        const {tutorId,subjectId,type,language} = req.body;

        const students = req.body.students;
        const tutor = await Tutor.findById(tutorId);
        if(!tutor) return res.status(404).json({message: "no tutor found"});

        if(tutor.isAvailable === true) return res.status(400).json({message: "Tutor is currently free, can't queue"});

        if(tutor.studentsInQueue.length > 2) return res.status(500).json({message: "Queue is full"});

        const studentData = {
            students,
            tutorId,
            subjectId,
            language,
            type
        }

        console.log(studentData);

        tutor.studentsInQueue.push(studentData)

        const resp = await tutor.save();

        console.log("Respone: " + JSON.stringify(resp.studentsInQueue))

        return res.status(200)
    }

    catch (err) { 
        console.log(err);
        return res.status(500).json({message: err})
    }
}

//End session
const endIndividualSession = async (req, res) => {
    if(!req.params.sessionId) return res.status(400).json({message:"Missing Parameters"
    })
    try{
        const { sessionId } = req.params;
        const session = await IndividualSession.findById(sessionId);

        console.log(session._id);

        session.actualEnd = Date.now();
        session.active = false;
        await session.save();

        const tutor = await Tutor.findById(session.tutorId);

        if(tutor.studentsInQueue.length > 0){
            const nextStudent = tutor.studentsInQueue.shift();
            await tutor.save();
            console.log("Next Student: " + JSON.stringify(nextStudent))
            const modifiedReq = {
                body:{
                    students:nextStudent.students,
                    tutorId: session.tutorId,
                    subjectId: nextStudent.subjectId,
                    type: nextStudent.type,
                    language: nextStudent.language
                }
            }

            console.log("Modified Request: " + JSON.stringify(modifiedReq));
            await createIndividualSession(modifiedReq,res);
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

//Extend a session
//TO-DO: Maybe add option for the session to be extended for a specific amount of time. Might be overkill though.
const extendIndividualSession = async (req,res) => {
    console.log("hit");
    if(!req.params.sessionId) return res.status(400).json({message: "Bad request"});
    try{

        const {sessionId} = req.params;

        const session = await IndividualSession.findById(sessionId);

        session.extended = true;

        if(session.paused)
            session.paused = false;

        await session.save();

        return res.status(200).json({message: "Session successfully extended"})
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message: "Something went wrong"});
    }
}

const pauseIndividualSession = async (req,res) => {
    if(!req.params.sessionId) return res.status(400).json({message:"Bad Request"})
    
    try{
        const {sessionId} = req.params;

        const session = await IndividualSession.findById(sessionId);

        session.paused = true;

        session.timePaused = Date.now();

        await session.save()

        return res.status(200).json({message:"Successfully Paused"})
    }
    catch(err){
        return res.status(500).json({message: "Something went wrong"});
    }
}

const resumeIndividualSession = async (req,res) => {
    if(!req.params.sessionId) return res.status(400).json({message:"Bad Request"})
    
    try{
        const {sessionId} = req.params;

        const session = await IndividualSession.findById(sessionId);

        session.paused = false;

        const timeLeft = session.expectedEnd - session.timePaused;

        session.timeResumed = Date.now();

        console.log("Time Left: "+ (timeLeft/1000));

        console.log("Previous end date: " + session.expectedEnd);
        
        const newEnd = Date.now() + timeLeft;
        session.expectedEnd = newEnd;

        console.log("Current end date: " + session.expectedEnd);

        await session.save()

        return res.status(200).json({endTime:newEnd})
    }
    catch(err){
        return res.status(500).json({message: "Something went wrong"});
    }
}

//Get every session that has taken place
const getAllIndividualSessions = async (req, res) => {
    try{
        const sessions = await IndividualSession.find().populate('tutorId').populate('subject').populate('student');

        return res.status(200).json({ sessions });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

//Get Tutors in IndividualSessions
const getActiveIndividualSessions = async (req, res) => {
    try{
        const sessions = await IndividualSession.find({ active: true }).populate('tutorId').populate('subjectId').populate('student');

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
const getTutorIndividualSessionHistory = async (req, res) => {
    try{
        const { tutorId } = req.params;
        const sessions = await IndividualSession.find({ tutor: tutorId });

        return res.status(200).json({ sessions });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}

//Get all sessions for a certain student
const getStudentIndividualSessionHistory = async (req, res) => {
    try{
        const { studentId } = req.params;
        const studentObjId = await Student.findOne({ studentId: studentId })._id;
        
        const sessions = await IndividualSession.find({ student: studentObjId });

        return res.status(200).json({ sessions });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}


module.exports = { createIndividualSession,createGroupSession, pauseIndividualSession,resumeIndividualSession, startIndividualSession, endIndividualSession, extendIndividualSession, getAllIndividualSessions, getActiveIndividualSessions, getTutorIndividualSessionHistory, getStudentIndividualSessionHistory, addStudentToQueue, getActiveGroupSessionByTable, endGroupSession };