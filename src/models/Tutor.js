const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class tutorStatus {

}

//TO-DO: need to be able to mark a tutor as sick maybe
const tutorSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    //TO-DO: Need to set of digit length requirement for a student Id
    studentId:{
        type: Number,
        required: true
    },
    subjects:{
        type: [mongoose.Types.ObjectId],
        ref: 'Subject',
        required: true
    },
    session: {
        type: mongoose.Types.ObjectId,
        ref: 'IndividualSession'
    },
    shifts:{
            monday:{
                type:[],
                default: []
            },
            tuesday:{
                type:[],
                default: []

            },
            wednesday:{
                type:[],
                default: []

            },
            thursday:{
                type:[],
                default: []

            },
            friday:{
                type:[],
                default: []

            }
    },
    atGroup:{
        type: Boolean,
        default:false
    },
    onBreak: {
        type: Boolean,
        default: false
    },
    clockedIn:{
        type:Boolean,
        default:false
    },
    isAvailable: {
        type: Boolean,
        default: false  
    },
    studentsInQueue: {
        type: [Object],
        ref: 'Student'
    }
},{
    timestamps: true
});

module.exports = mongoose.model('Tutor', tutorSchema);