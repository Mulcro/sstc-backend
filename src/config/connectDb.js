const mongoose = require('mongoose');

const connectDb = async () => {

    try{
        // Set prod and testing mongo uri in heroku app config vars
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    }
    catch(err){
        console.log(`Error connecting to mongoDB: ${err}`);
    }
}

module.exports = connectDb;