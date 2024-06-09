const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    
    //Hash this in db storage to prevent leaking sensitive information
    //TO-DO: Need to set of digit length requirement for a student Id

    studentId: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Student', studentSchema);