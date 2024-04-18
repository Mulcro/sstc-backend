const User = require('../models/User');
const bcrypt = require('bcryptjs');

//Create User function
const createUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    //check if user already exists
    if (await User.findOne({email})) {
        return res.status(400).json({ message: 'User already exists' });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    try {
        const user = await User.create({ firstName, lastName , email, password: hashedPassword});
        res.status(201).json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

//Update function


//Delete fucntion

