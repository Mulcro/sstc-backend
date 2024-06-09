const mongoose = require("mongoose");
require('dotenv').config();
const Tutor = require('../models/Tutor');
const {
    createTutor,
    getAvailableTutors,
    getAllTutors,
    checkInOrOut,
    updateTutor,
    deleteTutor
} = require('../controllers/tutorController');

const mockReq = {
    body: {
        firstName : "John",
        lastName: "Doe",
        subjects: "665ff60c7e905fd56200c00f",
        studentId: "00000", 
        shifts: []
    }
}

const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
};

describe('test tutor functionalities', () => {
    beforeAll(async () => {
        try {
            await mongoose.connect(process.env.MONGO_TEST_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB database');
            await Tutor.deleteMany({})
        } catch (err) {
            console.log('Error connecting to database:', err);
        }
    });

    it('Successfully creates a tutor', async () => {
        await createTutor(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenLastCalledWith(201);
        expect(mockRes.json).toHaveBeenCalled();
    })

    afterAll(async () => {
        await mongoose.disconnect();
    });
})