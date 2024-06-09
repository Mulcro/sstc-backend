const mongoose = require("mongoose");
require('dotenv').config();
const { createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject } = require("../controllers/subjectController");
const Subject = require('../models/Subject');

const mockReq = {
    body: {
        name: "Chemistry 1A"
    }
};

const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
};

describe('Tests subject functionality', () => {
    beforeAll(async () => {
        try {
            await mongoose.connect(process.env.MONGO_TEST_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB database');

            await Subject.deleteMany({});

        } catch (err) {
            console.error('Error connecting to database:', err);
            process.exit(1); // Exit the process if connection fails
        }
    });

    it('successfully creates subject', async () => {
        await createSubject(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalled();
    });

    afterAll(async () => {
        try {
            // Ensure all operations are completed before disconnecting
            // await new Promise(resolve => setTimeout(resolve, 1000));
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB database');

            const activeHandles = process._getActiveHandles();
            const activeRequests = process._getActiveRequests();

            // console.log('Active Handles:', activeHandles);
            console.log('Active Requests:', activeRequests);
        } catch (err) {
            console.error('Error disconnecting from database:', err);
        }
    });
});
