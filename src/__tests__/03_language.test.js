const mongoose = require("mongoose");
require('dotenv').config();
const Tutor = require('../models/Tutor');
const {createLanguage, getLanguages} = require('../controllers/languageController');

const mockReq = {
    body: {
        name: "Japanese"
    }
}

const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
};

describe('Create & Get Language', () => {
    beforeAll(async () => {
        try {
            await mongoose.connect(process.env.MONGO_TEST_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            // console.log('Connected to MongoDB database');
        } catch (err) {
            console.log('Error connecting to database:', err);
        }
    });

    it('Successfully creates a language', async () => {
        await createLanguage(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenLastCalledWith(201);
        expect(mockRes.json).toHaveBeenCalled();
    })

    it('Get all languages', async () => {
        await getLanguages(mockReq,mockRes);
        expect(mockRes.json).toHaveBeenCalled();
    })

    afterAll(async () => {
        await mongoose.disconnect();
    });
})