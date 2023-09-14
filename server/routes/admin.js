const express= require('express');
const {Admin, Course}= require('../db');
const jwt= require('jsonwebtoken');
const {SECRET, authenticateJwt}= require('../middleware/auth');

const router= express.Router();

//get the details(username) of logged-in user
router.get('/me', authenticateJwt, async (req,res)=> {
    const admin= await Admin.findOne({username: req.user.username});
    if(!admin){
        res.status(403).json({message: "Admin doesn't exist :/"});
        return
    } else{
        res.json({
            username: admin.username
        })
    }
})

//create a new admin
router.post('/signup',async (req,res)=>{
    const {username, password}= req.body;

    const admin= await Admin.findOne({username});

    if(admin){
        res.status(403).json({message: 'admin already exists XD'})
    } else{
        const newAdmin= new Admin({username: username, password: password});
        await newAdmin.save();

        //generate jwt for newly created admin
        const token= jwt.sign({username, role: 'admin'}, SECRET, {expiresIn: '1h'});
        res.json({message: 'admin created sucksexfully :)', token})
    }
})

//route to log in an admin
router.post('/login',async (req,res)=>{
    const {username, password}= req.headers;
    const admin= await Admin.findOne({username, password});

    if(admin){
        const token= jwt.sign({username, role: 'admin'}, SECRET, {expiresIn: '1h'})
        res.json({message: 'Logged in successfully :)', token})
    } else{
        res.status(403).json({message: ' Invalid username or password'})
    }
})

//route to add new course
router.post('/courses', authenticateJwt, async (req,res)=> {
    const course= new Course(req.body);
    await course.save();
    res.json({message: 'Course created successfully', courseId: course._id});
})

//update a particular course
router.put('/courses/:courseId', authenticateJwt, async (req, res)=> {
    const course= await Course.findByIdAndUpdate(req.params.courseId, req.body, {new: true});
    if(course){
        res.json({message: 'Course Updated successfully'})
    }else{
        res.status(404),json({message:'course not found'})
    }
})

//get all the courses
router.get('/courses', authenticateJwt, async (req, res)=> {
    const courses = await Course.find({});
    res.json({courses});
});

//get a particular course
router.get('/courses/:courseId', authenticateJwt, async (req, res)=> {
    const courseId= req.params.courseId;
    const course= Course.findById({courseId});
    res.json({course});
})


module.exports= router;