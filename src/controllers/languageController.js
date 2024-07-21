const Languages = require('../models/Language');

const getLanguages = async (req,res) => {
    try{
        const languages = await Languages.find();

        return res.status(200).json({languages})
    }
    catch(err){
        return res.status(err.status).json({message: err.message})
    }
}


module.exports = {getLanguages};
