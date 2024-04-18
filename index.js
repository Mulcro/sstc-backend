require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDb = require('./config/connectDb');

//connect to database
connectDb();

//middleware for urlencoded data
app.use(express.urlencoded({ extended: true }));

//middleware for json data
app.use(express.json());

//middleware for cookie
app.use(cookieParser());


mongoose.connection.once(
    'open',
    () => {
        console.log('Connected to mongoDB database');
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }
)