const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hoursSchema = new Schema({
    startTime: {
        type: Number,
        required: true
    },
    endTime: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Hours', hoursSchema);