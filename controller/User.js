const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocal = require("passport-local");
const passportLocalMongose = require("passport-local-mongoose");
const userSchema = require("../model/Users");
const postSchema = require("../model/Post");
// const contactSchema = require("../model/contact");
const auth = require("../auth/auth");
const Layout = require("express-layouts");
const multer = require("multer");
const GoogleStrategy = require( 'passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const mail = require("nodemailer")

const userRouter = express.Router()

userRouter.get("/register",  (req, res)=>{
    res.render("register", {
        title:"Register user",
        user:req.user,
        success:req.flash("success_msg"),
        fail:req.flash("empty"),
        err_user:req.flash("err_username"),
        password:req.flash("match"),
        shortPassword:req.flash("weak_pass"),
        usernameExist:req.flash("user_exist"),
        layout:false
        

    })
})

userRouter.get("/login", (req, res)=>{
    res.render("login", {
        title: "Login user",
        user:req.user,
        layout:false,
        fail:req.flash("empty"),
        incorrect:req.flash("incorrect"),


    })
})

// register New User
userRouter.get("/welcome", (req, res)=>{
    res.render("welcome", {
        title: "welcome", 
        user:req.user,
        layout:false
    })
})

userRouter.post("/register",  async(req, res)=>{
    let  username = req.body.username
    let email = req.body.email
    let password = req.body.password
    let confirm = req.body.confirm
   
        let error = [];
         if(!username || !email || !password || !confirm){
                error.push({text: "all field are required"})
                req.flash("empty", "Fill all field before submitting")
         }
            if(password !== confirm){
                error.push({match: "password not match"})
                req.flash("match", "password not match")
            }
            if(password.length > 0 && password.length < 5){
                error.push({password: "password too weak"})
                req.flash("weak_pass", "password too weak")

            }
            if(username.length < 5){
                error.push({text: "choose a username"})
                req.flash("username", "username too short")

                console.log("choose a username")
                
            }

            userSchema.findOne({ username: username }, function (err, user) {
                if (err) { 
                    console.log("username not found")
                 }else{
                    error.push({usernameExist: "choose a username"})
                    req.flash("user_exist", "username already exist")
    
                 }
               
                
            })
                if(error.length > 0){
                    res.render("register", {
                        title:"Register user",
                        error,
                        username,
                        email,
                        password,
                        user:req.user,
                        // empty field
                        fail:req.flash("empty"),
                        shortPassword:req.flash("weak_pass"),
                        password:req.flash("match"),
                        usernameExist:req.flash("user_exist"),
                        layout:false


                      
                    })
                }else{

                    try {
                        await userSchema.register({username, email}, password, (err, data)=>{
                            if(err){
                                console.log(err)
                        error.push({text: "unable to authenticate user"})
                        res.redirect("/users/register")
                    }else{
                        passport.authenticate("local")(req, res, function(){
                            req.flash("success_msg", `${username} your registration is successful`)
                            
                            res.redirect(`/users/welcome`)

                        })
                        
                    }
                    // console.log(req.user);
                    
                    // console.log(username, password, email)     
                    
                })
            } catch (error) {
                console.log(error)
            }
        }

})

// login authentication.

userRouter.post("/login", (req, res)=>{
    let error = [];
    let username = req.body.username
    let password = req.body.password

    if(!username || !password ){
        error.push({text: "all field are required"})
        req.flash("empty", "Fill all field before submitting")
 }
 userSchema.findOne({ username: username }, function (err, user) {
    if (err) { 
        console.log("username not found")
     }
    if (!user) { 
        error.push({error: "Incorrect username or password"})
        req.flash("incorrect", "Incorrect username or password")
        console.log("new err")
        res.render("login", {
            title:"Login users",
            user:req.user,
            error,
            fail:req.flash("empty"),
            incorrect:req.flash("incorrect"),
            layout:false

        })
    }
    
    
  });
 if(error.length > 0){
            res.render("login", {
                title:"Login users",
                user:req.user,
                error,
                fail:req.flash("empty"),
                incorrect:req.flash("incorrect"),
                layout:false


            })
        }else{
            try {
                
            const log =  new userSchema ({
                username:req.body.username,
                password:req.body.password
            })

        
        
    
  

        req.login(log, function(err){
            
            if(err){
                console.log(err)
                res.render("login",{
                    title: "Login users"
                })
            }else{
                passport.authenticate("local")(req, res, function(){
                    res.redirect(`/`)
                })
            }
        })
        
        
            } catch (error) {
                console.log(error)
            }

        console.log(username, password)
        
    }
        
    })

    // logout users
    userRouter.get("/logout", auth, (req, res)=>{
        req.logout()
        req.flash("logout", "you have successfully logout")
        res.redirect("/users/login")
    })


    // user dashboard

    userRouter.get("/dashboard/:id", auth, async (req, res)=>{
        let getUserPost = await postSchema.find({id:req.params.id})
        res.render("dashboard",{
            title:"Dashboard",
            user:req.user,
            username:req.user.username,
            layout:Layout,
            layout: true,
            success:req.flash("profile_update_success"),
            // success:req.flash("success"),
            getUserPost
        })
        console.log(getUserPost.length)
       
    })

    userRouter.get("/dashboard/:id/edit", auth, (req, res)=>{
        res.render("edit", {
            title:"Edit Profile",
            user:req.user,
            success:req.flash("profile_update_success"),
        
            layout:true
        })
    })



    // update profile
    const storage = multer.diskStorage({
        filename:function(req, file, cb){
            cb(null, file.originalname)
        },
        destination:function(req, file, cb){
            cb(null, "public/img/upload")
        }
    })
    const upload = multer({storage:storage})

    userRouter.put("/dashboard/:id/edit/", auth, upload.single("profileImg"),  async(req, res)=>{
        const _id = req.params.id

        const update =  await userSchema.findByIdAndUpdate(_id, {$set:{firstname:req.body.firstname,lastname:req.body.lastname, gender:req.body.gender, phone:req.body.phone, dob:req.body.dob, country:req.body.country, state:req.body.state,lg:req.body.lg,address:req.body.address, profileImg:req.file.originalname}}, (err, result)=>{
            if(err){
                console.log(err)
            }else{
                req.flash("profile_update_success", "Profile Updated successfully")
                res.redirect(`/users/dashboard/:${req.user.id}`)
            }
        }) 
        console.log(req.body) 
    })


    // user uploaded post
    userRouter.get("/mypost/:id", auth, async(req, res)=>{
        let post = await postSchema.find({postedBy:req.params.id})
        res.render("mypost", {
            title:"mypost",
            user:req.user,
            post
        })
        console.log(post)
    })


    // chaenge users password
    userRouter.get("/cp/:id", auth, async(req, res)=>{
    let getPass = await userSchema.findById(req.params.id, (err)=>{
        if(err){
            console.log(err);
        }
    })
        res.render("changePassword", {
            title:"Change Password",
            user:req.user,
            getPass
        })
        console.log(getPass.password)
    })

    // userSchema.changePassword(req.body.oldpassword, req.body.newpassword, function(err){

    
    userRouter.put("/cp/:id", auth, async(req, res)=>{
        let change = await userSchema.findByIdAndUpdate(req.params.id)(err =>{
            if(err){
                console.log(err);
            }else{
                console.log(change);
            }
        })
    })



    // google Authentication

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:  process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/users/auth/google/callback",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  
  function(request, accessToken, refreshToken, profile, cb) {
    userSchema.findOrCreate({ googleId: profile.id , username:profile.name.givenName, email:profile.email}, function (err, user) {
        // console.log(profile);
       
      return cb(err, user);

    });
  }
));


userRouter.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

userRouter.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/auth/google/failure'
}));

  



// facebook authentication

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRETE,
    callbackURL: "http://localhost:8080/users/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'name', 'gender', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
    
      userSchema.findOrCreate({ facebookId: profile.id , username:profile.name.givenName, email:profile.emails[0].value}, function (err, user) {
        // console.log(profile);
      return cb(err, user);
    });
  
  }
));


userRouter.get('/auth/facebook',
passport.authenticate('facebook', { scope: ['email'] }));

userRouter.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });





//   contact admin

userRouter.get('/contact/:id',  auth, (req, res) =>{
    res.render("contact", {
        title: "Contact Admin",
        user:req.user
    })
})

userRouter.post('/contact/:id', auth, async (req, res)=>{
    const msg = req.body.msg;
    const email = req.body.email;
    const subject = req.body.subject;
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPass =  process.env.ADMIN_PASS
    
    
    let error = [];


    try {
        if(!msg || !subject){
            error.push(error, "this field is important")
            res.redirect('/users/contact/:id')
        }else{
            var transporter = mail.createTransport({
                service: 'gmail',
                auth: {
                  user: adminEmail,
                  pass: adminPass
                }
              });
              
              var mailOptions = {
                from: email,
                to: adminEmail,
                subject: subject,
                text:msg,
                html:`<b>Hey ${req.user.username}! </b><br> ${msg}`
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                  res.redirect(`/users/dashboard/:id`)
                }
              });
        }
    } catch (error) {
        console.log(error);
    }
    console.log(username);

})
module.exports = userRouter
