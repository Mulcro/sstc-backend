const Hours = require('../models/Hours');

const getAllHours = async (req, res) => {
    try{
        const hours = await Hours.find();

        return res.status(200).json({ hours });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {getAllHours}