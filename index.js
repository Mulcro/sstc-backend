require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDb = require('./src/config/connectDb');
const cors = require('cors');
const corsOptions = require('./src/config/corsOptions');

//connect to database
connectDb();

//use cors
app.use(cors(corsOptions));

//middleware for urlencoded data
app.use(express.urlencoded({ extended: true }));

//middleware for json data
app.use(express.json());

//middleware for cookie
app.use(cookieParser());

// app.use((req, res, next) => {
//     if(req.url === '/sessions/active')
//         next();
//     else if(req.url === '/grouptables'){
//         next();
//     }
//     else{
//         console.log(`${req.method} request for '${req.url} from ${req.get('origin')}'`);
//         next();
//     }
// });


app.use('/subjects',require('./src/routes/api/subject'));
app.use('/tutors',require('./src/routes/api/tutor'));
app.use('/sessions',require('./src/routes/api/session'));
app.use('/grouptables',require('./src/routes/api/groupTable'));
app.use('/hours', require('./src/routes/api/hours'));
app.use('/languages',require('./src/routes/api/language'));



mongoose.connection.once(
    'open',
    () => {
        console.log('Connected to mongoDB database');
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }
)