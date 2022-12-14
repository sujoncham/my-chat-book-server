const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors')
var jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const fs = require('fs');
const path = require('path')
const passport = require('passport')
const moment = require("moment")
const multer = require('multer');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const UserRegister = require('./models/register');
const UserPost = require('./models/posts');
const connectDB = require('./connectBD/connectDB');
const bcrypt = require('bcrypt');
const saltRounds = 10;

require('./connectBD/passport')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());






// chatBook
// 8Z1ualXayAogwkqV

const imgconfig = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,"./uploads/")
    },
    filename:(req,file,callback)=>{
        callback(null,`imgae-${Date.now()}.${file.originalname}`)
    }
})

// img filter
const isImage = (req,file,callback)=>{
    if(file.mimetype.startsWith("image")){
        callback(null,true)
    }else{
        callback(new Error("only images is allowd"))
    }
}

const upload = multer({
    storage:imgconfig,
    fileFilter:isImage
});



connectDB()


    app.post('/login', async(req, res)=>{
        const user = await UserRegister.findOne({ email:req.body.email});

        if(!user){
           return res.status(401).json({
                status: "failed",
                message: "user not found",
            })
        }
        if(!bcrypt.compareSync(req.body.password, user.password)){
           return res.status(401).json({
                status: "failed",
                message: "incorrect password",
            })
        }

        const payload = {
            id: user._id,
            email: user.email,
            username: user.username,
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: "2d",
        });
       return res.status(200).json({
            status: "success",
            message: "user logged in successfully",
            token: ("Bearer " + token).split(' ')[1],
            user: user,
        })

    });

    app.post('/register', async(req, res)=>{
        try {
        const user = await UserRegister.findOne({ email:req.body.email})

        if(user){
            res.status(400).json({
                message: "user already exists",
            })
        }

        bcrypt.hash(req.body.password, saltRounds, async (err, hash)=> {
            const userData= new UserRegister({
                username: req.body.username,
                email: req.body.email,
                password: hash,
                confirmPass: hash,
            });
            await userData.save()
                .then(user =>{
                  return res.status(200).json({
                        status: "success",
                        message: "successfully registered",
                        user: {
                            id: user._id,
                            email: user.email,
                            username: user.username,
                        },
                    });
                })
                .catch(error=>{
                    res.status(400).json({
                        status: "failed",
                        message: "not register",
                        error: error.message,
                    });
                })

        }); 
        } catch (error) {
            res.status(400).json({
                status: "failed",
                error: error.message,
            });
        }
        
    });

    app.get('/logout', function (req, res, next) {
        console.log("logout")
        if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
            return next(err);
            } else {
            return res.redirect('/login');
            }
        });
    }
    });



    app.get('/chatPost', async(req, res)=>{
        const result = await UserPost.find();
        // console.log(result);
        res.send(result);
    });
    app.get('/image/:img', async(req, res)=>{
        const { img } = req.params;
        res.sendFile(path.join(__dirname, `./uploads/${img}`));
    });


    app.post('/chatPost', upload.single('image'), async (req, res)=>{
        
        try {
            const chatData= new UserPost({
                userText: req.body.userText,
                category : req.body.category,
                date: req.body.timePost,
                time: req.body.datePost,
                image: req.file.filename,
            })
            const result = await chatData.save();
            res.status(200).json({
                status:"success",
                message:"fill all the data",
                data: result
            });
        } catch (error) {
            res.status(400).json({
                status:"failed",
                message:"not inserted data",
                error: error.message,
            });
        }
        
        });

    app.post('/chatPost/userLike/', async(req, res)=>{ //verifyJWT, verifyAdmin,

        const id = req.params.id;
        const updated = req.body;
        const filterId = {_id: id};
        const options = {upsert: true};
        const updateDoc = {
            $set : {
                like: updated.like,
            }
        };
        const result = await UserPost.updateOne(filterId, updateDoc, options);
        res.send(result);
    })

    app.get('/chatPost/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: id};
        const result = await UserPost.findOne(query);
        res.status(200).json({
            status: 'update',
            message: "updated request successfully",
            data: result
        })
    })
    
    app.patch('chatPost/comment/:id', async(req, res)=>{
        const id = req.params.id;
        const upated = req.body;
        const filterId = {_id: id};
        const options = {upsert: true};
        const updateDoc = {
            $set : {
                comment: upated.comment,
            }
        };
        const result = await UserPost.updateOne(filterId, updateDoc, options);
        res.send(result);
    });
    
    // app.delete('/:id', async(req, res)=>{
    //     const id = req.params.id;
    //     const query = {_id: ObjectId(id)};
    //     const result = await collectionPost.deleteOne(query);
    //     res.send(result)
    // });

    app.get('/', passport.authenticate('jwt', { session: false }),
    (req, res)=> {
       return res.status(200).json({
            status:"success",
            user: {
                id: req.user.id,
                email: req.user.email,
                username: req.user.username,
            }
        });
    }
);

// app.get('/', (req, res)=>{
//     res.send('This is server running');
// });


app.listen(port, ()=>{
    console.log("server is ok", port)
})