const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupTableSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    tutors: {
        type: [Schema.Types.ObjectId],
        ref: 'Tutor',
    },
    subjects: {
        type: [Schema.Types.ObjectId],
        ref: 'Subject',
        required: true
    }
})


module.exports = mongoose.model('GroupTable', groupTableSchema);
