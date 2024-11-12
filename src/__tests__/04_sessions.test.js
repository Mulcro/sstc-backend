const mongoose = require("mongoose");
require('dotenv').config();
const { createIndividualSession, endIndividualSession, getAllIndividualSessions, getActiveIndividualSessions, getTutorSessionHistory, getStudentSessionHistory, addStudentToQueue, startIndividualSession, pauseIndividualSession, resumeIndividualSession, extendIndividualSession } = require('../controllers/sessionController');
const IndividualSession = require('../models/IndividualSession');
const Tutor = require('../models/Tutor')
const Subject = require('../models/Subject')
const Student = require('../models/Student')
const Language = require('../models/Language')
const redis = require('redis-mock'); // Or 'redis' if you want a live connection
const { promisify } = require('util');

const client = redis.createClient();
client.getAsync = promisify(client.get).bind(client);
client.setAsync = promisify(client.set).bind(client);

//TO-DO: Find way to run tests everytime I make a change

const mockReq = {
    params: {
        sessionId: null,
        studentId: null,
        tutorId: null,
    },
    //Check sessionController to see what is needed for the body. It might vary by request
    body: {
        tutorId: null,
        type: "1",
        studentId: "00000",
        subjectId: null,
        startTime: Date.now(),
        studentFirstName: "John",
        studentLastName: "Doe",
    }
};

const mockReqCreateSession = {
    body: {
        tutorId: null,
        type: "1",
        subjectId: null,
        students: [{firstName: "John", lastName: "Doe", studentId: "00001"},{firstName: "John", lastName: "Doe", studentId: "00002"},{firstName: "John", lastName: "Doe", studentId: "00003"}],
        language: null
    }
}

const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
};


describe('create, start, pause, resume, & extend session', () => {
    beforeAll(async () => {
        try {
            await mongoose.connect(process.env.MONGO_TEST_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            
            const language = await Language.findOne({});
            const subject = await Subject.findOne({});   
            const tutor = await Tutor.findOne({});
            
            mockReqCreateSession.body.language = language._id;

            mockReq.body.subjectId, mockReqCreateSession.body.subjectId = subject._id;
            mockReq.body.tutorId, mockReqCreateSession.body.tutorId = tutor._id;

        } catch (err) {
            console.log('Error connecting to database:', err);
        }
    });
    
    it("Successfully creates session", async () => {
        // Log mockReq body to see what's being sent
        // console.log(mockReq.body);
        await createIndividualSession(mockReqCreateSession, mockRes);
        
        // Check if the response is as expected
        expect(mockRes.status).toHaveBeenCalledWith(201);
    });
    
    
    it("Succesfully starts session", async () => {
        const session = await IndividualSession.findOne({})

        mockReq.params.sessionId = session._id;

        await startIndividualSession(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();    
    })
    
    it("Successfully paused Session", async () => {
        await pauseIndividualSession(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
    })
    
    it("Successfully resume session", async () => {
        await resumeIndividualSession(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
    })
    
    it("Succesfully extend session", async () => {  
        await extendIndividualSession(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
    })
    
    it("Fails to create session with a tutor already in a session", async () => {
        await createIndividualSession(mockReqCreateSession,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(409);
        expect(mockRes.json).toHaveBeenCalled();
    })
    

    afterAll(async () => {
        await mongoose.disconnect();
    });
});

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

        // Optionally clear Redis cache if necessary
        await client.flushall();
    });

    it('Successfully gets all sessions', async () => {
        await getAllIndividualSessions(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();        
    })

    it('Succesfully gets active sessions', async () => {
        await getActiveIndividualSessions(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
    })

    afterAll(async () => {
        await mongoose.disconnect();
    })
})

describe('get sessions for specific tutor or student', () => {
    beforeAll(async () => {
        try {
            await mongoose.connect(process.env.MONGO_TEST_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB database');

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

            const student = await Student.findOne({});   
            const tutor = await Tutor.findOne({});

            tutor.studentsInQueue = [];

            mockReq.body.studentId = student._id;

        } catch (err) {
            console.log('Error connecting to database:', err);
        }
    });

    it("Fails to queue student to already free tutor", async () => {
        const tutor = await Tutor.findOne({});
        tutor.isAvailable = true;
        await tutor.save();

        await addStudentToQueue(mockReqCreateSession,mockRes);
        expect(mockRes.status).toHaveBeenLastCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled

        tutor.isAvailable = false;
        await tutor.save();
    })
    
    it('Succesfully adds a student to the queue', async () => {
        await addStudentToQueue(mockReqCreateSession,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        
        // Verify the student was added to the queue
        const tutor = await Tutor.findById(mockReqCreateSession.body.tutorId);

        expect(tutor.studentsInQueue).toHaveLength(1);
        expect(tutor.studentsInQueue[0].studentFirstName).toBe(mockReqCreateSession.body.students[0].firstName);
    })

    it('Fails to students to queue past 3 students', async () => {
        await addStudentToQueue(mockReqCreateSession,mockRes);
        await addStudentToQueue(mockReqCreateSession,mockRes);
        await addStudentToQueue(mockReqCreateSession,mockRes);
        expect(mockRes.status).toHaveBeenLastCalledWith(500);
        expect(mockRes.json).toHaveBeenCalled

        //Verify length
        const tutor = await Tutor.findById(mockReqCreateSession.body.tutorId);
        expect(tutor.studentsInQueue).toHaveLength(3);
    })

    afterAll(async () => {

        await mongoose.disconnect();
    });
})

describe('End session', () => {
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

    it('Successfully ends session', async () => {
        await endIndividualSession(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
    })

    afterAll(async () => {
        await Tutor.deleteMany({});
        await Student.deleteMany({});
        await Language.deleteMany({});
        await IndividualSession.deleteMany({});

        await mongoose.disconnect();
    });
}
)