const mongoose = require("mongoose");
require('dotenv').config();
const { createSession, endSession, getAllSessions, getActiveSessions, getTutorSessionHistory, getStudentSessionHistory, addStudentToQueue } = require('../controllers/sessionController');
const Session = require('../models/Session');
const Tutor = require('../models/Tutor')
const Subject = require('../models/Subject')
const Student = require('../models/Student')

//TO-DO: Find way to run tests everytime I make a change

const mockReq = {
    params: {
        sessionId: null,
        studentId: null,
        tutorId: null,
    },
    body: {
        tutorId: null,
        type: "1",
        studentId: "00000",
        subjectId: null,
        startTime: Date.now(),
        studentFirstName: "John",
        studentLastName: "Doe" 
    }
};

const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
};

describe('gets sessions', () => {
    beforeAll(async () => {
        try {
            await mongoose.connect(process.env.MONGO_TEST_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        } catch (err) {
            console.log('Error connecting to database:', err);
        }
    });

    it('Successfully gets all sessions', async () => {
        await getAllSessions(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();        
    })

    it('Succesfully gets active sessions', async () => {
        await getActiveSessions(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
    })

    afterAll(async () => {
        await mongoose.disconnect();
    })
})

describe('create and end session', () => {
    beforeAll(async () => {
        try {
            await mongoose.connect(process.env.MONGO_TEST_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            await Session.deleteMany({});

            const subject = await Subject.findOne({});   
            const tutor = await Tutor.findOne({});

            mockReq.body.subjectId = subject._id;
            mockReq.body.tutorId = tutor._id;

        } catch (err) {
            console.log('Error connecting to database:', err);
        }
    });

    it("Successfully creates session", async () => {
        await createSession(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalled();
    });

    it("Fails to create session with a tutor already in a session", async () => {
        await createSession(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(409);
        expect(mockRes.json).toHaveBeenCalled();
    })

    it("Succesfully ends session", async () => {
        const session = await Session.findOne({});
        mockReq.params.sessionId = session._id;
        await endSession(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
    })

    afterAll(async () => {
        await mongoose.disconnect();
    });
});

describe('get sessions for specific tutor or student', () => {
    beforeAll(async () => {
        try {
            await mongoose.connect(process.env.MONGO_TEST_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB database');
            await Session.deleteMany({});

            const student = await Student.findOne({});   
            const tutor = await Tutor.findOne({});

            mockReq.params.studentId = student._id;
            mockReq.params.tutorId = tutor._id;

        } catch (err) {
            console.log('Error connecting to database:', err);
        }
    });

    it('Succesfully get all sessions for a specific tutor', async () => {
        await getTutorSessionHistory(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
    })

    it('Successfully get all sessions for specific student', async () => {
        await getStudentSessionHistory(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
    })

    afterAll(async () => {
        await mongoose.disconnect();
    });
})

describe('Successfully queue session', () => {
    beforeAll(async () => {
        try {
            await mongoose.connect(process.env.MONGO_TEST_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB database');
            await Session.deleteMany({});

            const student = await Student.findOne({});   
            const tutor = await Tutor.findOne({});
            const subject = await Subject.findOne({})

            tutor.studentsInQueue = [];

            mockReq.body.studentId = student._id;
            mockReq.body.tutorId = tutor._id;
            mockReq.body.subjectId = subjectId;

        } catch (err) {
            console.log('Error connecting to database:', err);
        }
    });

    it("Fails to queue student to already free tutor", async () => {
        const tutor = await Tutor.findOne({});
        tutor.isAvailable = true;
        await tutor.save();

        await addStudentToQueue(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenLastCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled

        tutor.isAvailable = false;
        await tutor.save();
    })
    
    it('Succesfully adds a student to the queue', async () => {
        await addStudentToQueue(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        
        // Verify the student was added to the queue
        const tutor = await Tutor.findById(mockReq.body.tutorId);
        expect(tutor.studentsInQueue).toHaveLength(1);
        expect(tutor.studentsInQueue[0].studentFirstName).toBe(mockReq.body.studentFirstName);
    })

    it('Fails to students to queue past 3 students', async () => {
        await addStudentToQueue(mockReq,mockRes);
        await addStudentToQueue(mockReq,mockRes);
        await addStudentToQueue(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenLastCalledWith(500);
        expect(mockRes.json).toHaveBeenCalled

        //Verify length
        const tutor = await Tutor.findById(mockReq.body.tutorId);
        expect(tutor.studentsInQueue).toHaveLength(3);
    })

    afterAll(async () => {
        await mongoose.disconnect();
    });
})
