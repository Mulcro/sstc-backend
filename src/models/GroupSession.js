const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Might need to add tutor Ids in here
const groupSessionSchema = new Schema({
    studentId:{
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    groupTableId:{
        type: Schema.Types.ObjectId,
        ref:'GroupTable',
        required: true
    },
    subjectId:{
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    startTime:{
        type: Date,
        required: true,
        default: null
    },
    endTime:{
        type:Date,
        default: null
    },
    active:{
        type: Boolean,
        default: true
    },
    type:{
        type:Number,
        // 0 for regular, 1 for EOPS
        required: true
    },
    language:{
        type:Schema.Types.ObjectId,
        ref:'Langague',
        required:true
    }
})

module.exports = mongoose.model('GroupSession',groupSessionSchema)