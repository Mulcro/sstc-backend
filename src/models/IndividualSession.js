const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    type:{
        type:Number,
        // 0 for inperson, 1 for online, 2 for EOPS
        required: true
    },
    tutorId: {
        type: Schema.Types.ObjectId,
        ref: 'Tutor',
        required: true
    },
    student: {
        type: [Schema.Types.ObjectId],
        ref: 'Student',
        required: true
    },
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    language:{
        type:Schema.Types.ObjectId,
        ref:'Language',
        required:true
    },
    //TO-DO: The time isn't returning to the frontend in the proper format. 
    startTime: {
        type: Date,
        default: null
    },

    //TO-DO: I need to figure out how to make sure that even though the sessions are timed it possible to have the actual end be the time that the student actually checks in with another student.

    expectedEnd: {
        type: Date,
        default:null
    },
    actualEnd:{
        type: Date,
        default: null
    },
    active:{
        type: Boolean,
        default: true
    },
    extended:{
        type:Boolean,
        default: false
    },
    paused:{
        type:Boolean,
        default:false
    },
    timePaused:{
        type:Date,
        default:null
    },
    timeResumed:{
        type:Date,
        default:null
    }
});

// sessionSchema.pre('save',function (next) {
    
//     if(this.startTime && (this.expectedEnd === null) ){        
//         const startTime = new Date(this.startTime);
//         //Change this to 30 minutes when in prod
//         const expectedEnd = new Date(startTime.getTime() + (2*60*1000));

//         this.expectedEnd = expectedEnd;
//     }

//     next();
// })

module.exports = mongoose.model('IndividualSession', sessionSchema);
