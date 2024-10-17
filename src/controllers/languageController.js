const Languages = require('../models/Language');
const client = require("../config/redisClient")


const getLanguages = async (req,res) => {

    try{
        let languages = await client.get("languages");

        if(languages){
            return res.json(JSON.parse(languages));
        }
        else{
            languages = await Languages.find({});
            //This should expire when user logs out
            client.set("languages",JSON.stringify(languages));
            return res.json(languages);
        }
    }
    catch(err){
        return res.status(500).json({message: err.message})
    }
}


module.exports = {getLanguages};
