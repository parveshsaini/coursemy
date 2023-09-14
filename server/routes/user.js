const express= require('express');
const jwt= require('jsonwebtoken')
const {authenticateJwt, SECRET}= require('../middleware/auth');
const {User, Course}= require('../db');

const router= express.Router();

//add a new user
router.post('/signup', async (req, res)=> {
    const {username, password}= req.body;
    const user= await User.findOne({username});

    if(user){
        res.status(403).json({message: 'User alreasy exists'})
    }else{
        const newUser= new User({username, password});

        await newUser.save();
        const token= jwt.sign({username, role: 'user'}, SECRET, {expiresIn: '1h'});
        res.json({message: 'User created successfully', token});
    }
})

//login user
router.post('/login', (req, res)=> {
    const {username, password}= req.headers;
    const user= User.findOne({username, password});

    if(user){
        const token= jwt.sign({username, role: 'user'}, SECRET, {expiresIn: '1h'});
        res.json({messgae: 'Logged in succesfully', token});
    }else{
        res.status(403).json({message: 'Invalid username or password'});
    }
})

//see all the published courses
router.get('/courses', authenticateJwt, async (req, res)=> {
    const courses= await Course.find({published: true});

    res.json({courses});
})

//purchase a course
router.post('/courses/:courseId', authenticateJwt, async (req, res)=>{
    const course= await Course.findById(req.params.courseId);

    if(course){
        const user= await User.findOne({username: req.user.username})

        if(user){
            user.purchasedCourses.push(course);
            await user.save();
            res.json({message: 'Course purchased'})
        }else{
            res.status(403).json({message: 'user not found'})
        }
    }else{
        res.status(403).json({message: 'Course  not found'})
    }
})

//view all purchased course
router.get('/purchasedCourses', authenticateJwt, async (req, res)=>{
    const user= await User.findOne({username: req.user.username});
    if(user){
        res.json({purchasedCourses: user.purchasedCourses || []})
    }else{
        res.status(403).json({message: 'User not found'})
    }
})

module.exports= router;