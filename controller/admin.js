const express = require("express")
const userSchema = require("../model/Users")
const postSchema = require("../model/Post")
const multer = require("multer")
const auth = require("../auth/auth")
const mail = require("nodemailer")
const adminRouter = express.Router()




// file uploading
const storage = multer.diskStorage({
    filename:function(req, file, cb){
        cb(null, file.originalname)
    },
    destination:function(req, file, cb){
        cb(null, "public/img/upload")
    }
    
})
const upload = multer({storage:storage})


// get all posts
adminRouter.get("/allPost/", auth, async(req, res)=>{
    let getPost = await (await postSchema.find().populate("postedBy, User"))
       
    res.render("getUserPost", {
            title: "get all post",
            user:req.user,
            getPost,
            deletePost:req.flash("delete")
                    
    })
   
})

// delete post
adminRouter.delete("/allPost/:id", auth, async(req, res)=>{
    await postSchema.findByIdAndDelete(req.params.id, (err, data)=>{
        if(err){
            console.log(err)
        }else{
            req.flash("delete", "post deleted successfully");
            res.redirect("/admin/allPost")
        }
    })
})

// get single post for editing
adminRouter.get("/:id/edit/", auth, async(req, res)=>{
    let getPost = await postSchema.findById(req.params.id)
        
    res.render("edit_post", {
        title: "edit",
        user:req.user,
        getPost,
        edited:req.flash("edited")
    })
    console.log(getPost)
})


adminRouter.put("/:id/edit", upload.single("postImg"), auth, async(req, res)=>{
    let post = await postSchema.findByIdAndUpdate({_id:req.params.id}, {$set:{title:req.body.title, content:req.body.content,categories:req.body.categories, postImg:req.file.filename}},{new:true}, (err, data)=>{
        if(err){
            req.flash("update_err", "unable to update post")
            console.log(err)
        }  else{
            console.log(data.filename)
            req.flash("edited", "post edited successfully")
            res.redirect("/admin/allPost")
        }
    })

})

// approve user post
adminRouter.put("/allpost/approve/:id", auth, (req, res)=>{
    let approvePost = postSchema.findByIdAndUpdate({_id:req.params.id}, {$set:{approve:true}}, (err, data)=>{
        if(err){
            console.log(err)
        }else{
            res.redirect("/admin/allPost")
        }
    })
})


// get all registed users
adminRouter.get("/users/", auth, async(req, res)=>{
    let  getUsers = await userSchema.find().exec()
    res.render("regUser", {
        title:"All users",
        user:req.user,
        getUsers,
        deleteUser:req.flash("delete_user"),
        updateUser: req.flash("users")
    })
    console.log(getUsers);
    
})
// get user details(more infomation about the registered users)
adminRouter.get("/users/details/:id", auth, async(req, res)=>{

    let details = await userSchema.findById(req.params.id, (err, data)=>{
        if(err){
            console.log(err);
        }
    })
    res.render("userDetails", {
        title: "user Details",
        user:req.user,
        details
    })
    console.log(details)
})

// remove or delete users
adminRouter.delete("/users/delete/:id", auth, async(req, res)=>{
    await userSchema.findByIdAndDelete(req.params.id, (err)=>{
        if(err){
            console.log(err);
        }else{
            req.flash("delete_user", "User deleted successfully")
            res.redirect("/admin/users")
        }
    })
})

// edit users info
adminRouter.get("/users/edit/:id", auth, async(req, res)=>{
   const edit = await userSchema.findById(req.params.id) 
    res.render("editUsers", {

        title:"edit users info",
        user:req.user,
        edit
    })
})
// update users information
adminRouter.put("/users/edit/:id", auth, upload.single("profileImg"), async(req, res)=>{
   try {
    await userSchema.findByIdAndUpdate({_id:req.params.id}, {$set:{firstname:req.body.firstname, lastname:req.body.lastname, username:req.body.username, email:req.body.email, phone:req.body.phone, dob:req.body.dob, roles:req.body.roles, country:req.body.country, state:req.body.state, lg:req.body.lg, address:req.body.address, gender:req.body.gender, profileImg:req.file.filename}},{new: true}, (err)=>{

        if(err){
            console.log(err);
        }else{
            req.flash("users", "users updated successfully")
            res.redirect("/admin/users")
        }
    }),exec() 
   } catch (error) {
       console.log(error);
   }

   
})
 
adminRouter.get("/users/contact/:id", auth, async(req, res)=>{
    const getInfo = await userSchema.findById(req.params.id)

    res.render("contactSingle", {
        title: "contact single user",
        user:req.user,
        getInfo
    })


})
 

adminRouter.post('/users/contact/:id', auth, async (req, res)=>{
    
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

})

module.exports = adminRouter