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
const app = express()




app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

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



passport.use(userSchema.createStrategy());
passport.serializeUser(userSchema.serializeUser());
passport.deserializeUser(userSchema.deserializeUser());


// db connection
mongoose.connect(process.env.db_Url,{
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
        res.render("index", {
            title : "Homepage",
            user:req.user,
            post,
            format: moment(req.user).fromNow(),
            layout:false

            
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
    
// my route
app.use("/post", postRouter)
app.use("/users", require("./controller/User"))
app.use("/admin", admin)

// connection
const PORT = process.env.PORT || 8080
app.listen(PORT, () =>{
    console.log(`server started at port ${PORT}`.blue)
})