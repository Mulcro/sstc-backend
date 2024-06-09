const mongoose = require('mongoose');

const connectDb = async () => {

    try{
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    }
    catch{
        console.log('Error connecting to database');
    }
}

module.exports = connectDb;