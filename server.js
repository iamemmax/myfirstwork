const express = require("express")
const path = require("path")
// const axios = require("axios").default
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const color = require("colors")
const dotenv = require("dotenv")
require("dotenv").config()
const flash = require("connect-flash")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const passport = require("passport")
const passportLocal = require("passport-local")
const passportLocalMongoose = require("passport-local-mongoose")
const moment = require("moment")
const Layout = require("express-layouts")
const methodOverride = require("method-override")
const multer = require("multer")
// routes
const postRouter = require("./controller/Post")
// const userRouter = require("./controller/User")
const admin = require("./controller/admin")

const userSchema = require("./model/Users")
const postSchema = require("./model/Post")
const commentSchema = require("./model/Comment")
const auth = require("./auth/auth")
const app = express()




app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use(Layout)
app.use(methodOverride("_method"))
app.use(session({
    secret:"emmalex",
    cookie:{maxAge: 600000000000000},
    resave:true,
    saveUninitialized:true
}))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    userSchema.findById(id, function(err, user) {
        done(err, user);
       });
   });
   

// db connection
mongoose.connect("mongodb+srv://project:project111@clheruster0.5zxuc.mongodb.net/project?retryWrites=true&w=majority",{
    useNewUrlParser:true, useCreateIndex:true, useUnifiedTopology:true, useFindAndModify:false
}, (err, data)=>{
    if(err)throw err
  if(data){
        console.log("DB connected Successfully".red)
    }
})

// home route
app.get("/", async(req, res)=>{

let post =  await postSchema.find({approve:true}).sort({createdAt: "-1"}).populate('postedBy').exec()
let findComment = await commentSchema.find(post.slug)



        res.render("index", {
            title : "Homepage",
            user:req.user,
            post,
            format: moment().fromNow(),
            layout:false,
            findComment
          
        })

     
  
        
    })
     
    // delete post on homepage by admin
   app.delete("/:id", async(req, res)=>{
    await postSchema.findByIdAndDelete(req.params.id , (err, result)=>{
        if(err){
            console.log(err)
        }else{
            req.flash("deletePost", "post deleted successfully")
            res.redirect("/")
        }
    })
   })
    
    // like post on homepage
    app.post("/like/:id", auth, async(req, res) =>{
        let error = []
let likedUserPost = {
    likePost:req.user._id
}
    try {

        await postSchema.findOne({"_id":req.params.id}).exec(async(err, data) =>{
            if(err)console.log(err);
            if(data){
               let exxist = data.like.find(c => c.likePost == req.user.id) 
                    if(exxist){
                        error.push(error, "error")

                       res.redirect("/")

                    }else{
                    
                    await postSchema.findOneAndUpdate({_id:req.params.id}, {$push:{
                   "like":likedUserPost
               }
               
               }).exec((err, _liked)=>{
                   if(err)console.log(err);
                   if(_liked){
                       res.redirect("/")
                   }
               })
                    }
                   
                
            }
            console.log(likedUserPost.likePost);
        })
    } catch (error) {
        console.log(error);
    }
    })
    // dislike post
    app.post("/dislike/:id", async(req, res) =>{

let likedUserPost = {
    likePost:req.user.id
}
    try {
        await postSchema.findOne({"_id":req.params.id}).exec(async(err, data) =>{
            if(err)console.log(err);
            if(data){
               await postSchema.findOneAndUpdate({_id:req.params.id}, {$pull:{
                   "like":likedUserPost
               }
               
               }).exec((err, _liked)=>{
                   if(err)console.log(err);
                   if(_liked){
                       res.redirect("/")
                   }
               })
            }
        })
    } catch (error) {
        console.log(error);
    }
})




// upvote post
 app.post("/v/:id", auth, async(req, res) =>{
        let error = []
let upvotePost = {
    vote:req.user._id
}
    try {

        await postSchema.findOne({"_id":req.params.id}).exec(async(err, data) =>{
            if(err)console.log(err);
            if(data){
               let exxist = data.score.find(c => c.vote == req.user.id) 
                    if(exxist){
                        error.push(error, "voting error")

                       res.redirect("/")

                    }else{
                    
                    await postSchema.findOneAndUpdate({_id:req.params.id}, {$push:{
                   "score":upvotePost
               }
               
               }).exec((err, _votes)=>{
                   if(err)console.log(err);
                   if(_votes){
                       res.redirect("/")
                   }
               })
                    }
                   
                
            }
            // console.log(upvotePost.vote);
        })
    } catch (error) {
        console.log(error);
    }
    })






     app.post("/dv/:id", auth, async(req, res) =>{


let upvotePost = {
    vote:req.user._id
}
    try {
        await postSchema.findOne({"_id":req.params.id}).exec(async(err, data) =>{
            if(err)console.log(err);
            if(data){
               await postSchema.findOneAndUpdate({_id:req.params.id}, {$pull:{
                   "score":upvotePost
               }
               
               }).exec((err, downvote)=>{
                   if(err)console.log(err);
                   if(downvote){
                       res.redirect("/")
                   }
               })
            }
        })
    } catch (error) {
        console.log(error);
    }
})


// search bar


app.get("/:q", async (req, res) =>{
   
   let query = req.query.q
       const regex =  new RegExp(query, "i")
    let search =  await postSchema.find({title:regex})
    
    res.render("search",{
        title: `search result for ${query} | wakeup9ja`,
        user:req.user,
        layout:false,
        search,
        format: moment(req.user).fromNow(),
        query

    })

  
})

// my route
app.use("/post", postRouter)
app.use("/users", require("./controller/User"))
app.use("/admin", admin)

// connection
const PORT = process.env.PORT || 8080
app.listen(PORT, () =>{
    console.log(`server started at port ${PORT}`.blue)
})