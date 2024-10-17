const GroupTable = require("../models/GroupTable")
const Tutor = require("../models/Tutor")
const Subject = require("../models/Subject")
const client = require('../config/redisClient');

const getGroupTables = async (req,res) => {
    try{
        let groupTables = await client.get('groupTables');

        if(groupTables){
            // console.log("Cache hit")
            return res.json(JSON.parse(groupTables));}
        else{
            // console.log("Cache miss")
            groupTables = await GroupTable.find({}).populate('tutors');
            if(!groupTables) return res.status(404).json({message:"No Group Tables Found"});
            await client.setEx('groupTables',120,JSON.stringify(groupTables))
            return res.status(200).json(groupTables);
        }
    }
    catch(Err){
        console.log(Err)
        return res.status(500).json({message:Err})
    }
}

const createGroupTable = async (req,res) => {
    if(!req.body.name || !req.body.subjects) return res.status(400).json({message: "Bad Request"})
    try{
        const {name,subjects} = req.body;

        const groupTable = await GroupTable.create({
            name,
            subjects
        })

        if(!groupTable) return res.status(500).json({message: "Something went wrong"});

        await groupTable.save();

        //clear cache
        await client.del("groupTables");

        return res.status(200).json(groupTable)
    }
    catch(err){
        return res.status(500).json({message:err})
    }
}

const findGroupTable = async (req,res) => {
    console.log("hit")
    if(!req.body.subject) return res.status(400).json({message: "No subject specified"})

    try{
        
        const {subject} = req.body;

        const groupTable = await GroupTable.findOne({subjects:{
            $in:[subject]
        }})

        if(!groupTable) return res.stats(404).json({message: "No Group Table Found"});

        return res.status(200).json(groupTable)
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message:err})
    }
}

const clockTutorInOrOut = async (req, res) => {
    if (!req.body.tutorId || !req.body.option) return res.status(400).json({message: "Bad Request"})

    try {
        // console.log("Hit")
        const {option, tutorId} = req.body;

        const tutor = await Tutor.findById(tutorId);
        if (!tutor) return res.status(404).json({message:"Tutor not found"})
        // console.log("Hit")

        if (!tutor.clockedIn) return res.status(404).json({message: "Tutor is not clocked in"})
        
        await client.del("grouptables",() => console.log("Cache Deleted"));
        
        if (option === '0') {

            const {groupTableId} = req.body;

            const groupTable = await GroupTable.findById(groupTableId);

            if (!groupTable) return res.status(404).json({message:"Group table not found"});

            if (tutor.atGroup) return res.status(404).json({message: "Tutor is already checked in"});

            groupTable.tutors.push(tutor._id);
            await groupTable.save();

            tutor.atGroup = true;
            tutor.isAvailable = false;

            await tutor.save();

        } 
        else if (option === '1') {

            const groupTable = await GroupTable.findOne({
                tutors: {$in:[tutor._id]}
            });

            if (!tutor.atGroup) return res.status(404).json({message: "Tutor already checked out"})
            
            const newArr = groupTable.tutors.filter(elem => {
                if(JSON.stringify(elem) !== JSON.stringify(tutor._id))
                    return elem
            })

            groupTable.tutors = newArr;

            await groupTable.save();

            tutor.atGroup = false;
            tutor.isAvailable = true;
            await tutor.save();
        }
        
        //clear cache
        await client.del("groupTables");
        
        return res.status(200).json({message: "Success"})
    } catch (err) {
        return res.status(500).json(err);
    }
}

const addSubjectsToTable = async (req,res) => {
    if(!req.body.groupTableId || !req.body.subjectId) return res.status(400).json({message: "Bad Request"})

    try{
        const {groupTableId,subjectId} = req.body;

        const groupTable = await GroupTable.findById(groupTableId);

        const subject = await Subject.findById(subjectId);

        if(!subject)
            throw new Error();

        groupTable.subjects.push(subject._id)

        await groupTable.save();

        //clear cache
        await client.del("groupTables");
        
        return res.status(200).json({message: "success"})
    }
    catch(err){
        return res.status(500).json({message: "Something went Wrong"})
    }
}

module.exports = {getGroupTables, findGroupTable, createGroupTable,addSubjectsToTable, clockTutorInOrOut};