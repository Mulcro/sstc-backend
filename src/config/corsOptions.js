const allowedOrigins = require('./allowedOrigins');

const corsOptions ={
    origin: (origin,callback) => {
        if(!allowedOrigins.includes(origin)){
            return callback(new Error("Not allowed by CORS"));
        }
        else{
            return callback(null,true);
        }
    },
    credentials: true,
};

module.exports = corsOptions;