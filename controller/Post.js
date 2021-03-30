const express = require("express");
const mongoose = require("mongoose");
const postSchema = require("../model/Post");
const multer = require("multer")
const commentSchema = require("../model/Comment")
const replySchema = require("../model/reply")
const auth = require("../auth/auth")
const postRouter = express.Router()



const storage = multer.diskStorage({
    filename:function(req, file, cb){
        cb(null, file.originalname)
    },
    destination:function(req, file, cb){
        cb(null, "public/img")
    }
})
const upload = multer({storage:storage})


postRouter.get("/new", (req, res)=>{
    res.render("new", {
        title:"New post",
        user:req.user
    })
})

postRouter.post("/new", upload.single("postImg"),auth, async(req, res)=>{
    let error = [];
    let title, description, categories, postImg
    if(!title){
        error.push(error, "Title field is required")
    }
    if(!description){
        error.push(error, "description field is required")
    }
    if(categories == "none"){
        error.push(error, "please choose category")
       
    }
    let post = new postSchema({
        title:req.body.title,
        content:req.body.content,
        categories:req.body.categories,
        postImg:req.file.filename,
        postedBy:req.user.id
    })
    try {
       await  post.save()
       res.redirect("/")
    } catch (error) {
        console.log(error)
    }

})


postRouter.get("/:slug", async(req, res)=>{
    let post = await postSchema.findOne({slug:req.params.slug}).populate("postedBy")
    let comments = await commentSchema.find({postSlug:post.slug}).populate("commentBy replyComment.replyBy replyComment.commentId").exec()
    res.render("blog",{
        title:post.title,
        user:req.user,
        post:post,
        layout:false,
        comments

    })
    
   
  
})

// comment
postRouter.post("/:slug/comment",  async(req, res) =>{
let error = [];
    let message = req.body.message
    let postSlug = req.params.slug
    if(!message){
        error.push(error, "Enter your comment")
    }else{

        let comment = new commentSchema({
            
            message :message,
            postSlug :postSlug,
            commentBy : req.user
        })
        try {
            
            await comment.save((err, data)=>{
                if(err)throw err
                
                if(data){
                    res.redirect(`/post/${postSlug}`)
                }
            }) 
        } catch (error) {
            console.log(error);
        }
        }
})

// reply comment
postRouter.post("/:id", async (req, res) => {
    let error = []
   let replySystem = {
    myreply:req.body.reply,
    commentId: req.params.id,
    replyBy: req.user._id,
   
   }

   
   try {
       
  

   if(!replySystem.myreply){
       error.push(error, "reply field cannot be empty")
       
        // res.redirect(`/post/${data.postSlug}`)

   }

   if(error.length > 0){
      error.push(error, "something went round")
      res.redirect("/")
   }else{
        await commentSchema.findOne({"_id":req.params.id}).exec((err, data) =>{
        if(err){
            console.log(err);
        }
        if(data){
            commentSchema.findOneAndUpdate({_id:req.params.id}, {
               "$push":{
                   "replyComment":replySystem
            }
            
            
            }).populate("replyComment.replyBy commentId").exec(async(err, existingReply)=>{
              
              if(err)console.log(err);
              if(existingReply){
                  res.redirect(`/post/${data.postSlug}`)
              }
          })
          console.log(data);
        }

    })
   }

    } catch (error) {
       console.log(error);
   }

    })
     

// like user comment

postRouter.post("/dislike/:id", async(req, res) =>{

let likedUserPost = {
    likePost:req.user.id
}
    try {
        await commentSchema.findOne({"_id":req.params.id}).exec(async(err, data) =>{
            if(err)console.log(err);
            if(data){
               await commentSchema.findOneAndUpdate({_id:req.params.id}, {$pull:{
                   "like":likedUserPost
               }
               
               }).exec((err, _liked)=>{
                   if(err)console.log(err);
                   if(_liked){
                       res.redirect(`/post/${data.postSlug}`)
                   }
               })
            }
        })
    } catch (error) {
        console.log(error);
    }
})
// like user comment

postRouter.post("/like/:id", async(req, res) =>{

let error = []
let likedUserPost = {
    likePost:req.user._id
}
    try {

        await commentSchema.findOne({"_id":req.params.id}).exec(async(err, data) =>{
            if(err)console.log(err);
            if(data){
               let exxist = data.like.find(c => c.likePost == req.user.id) 
                    if(exxist){
                        error.push(error, "Enter your comment")

                       res.redirect(`/post/${data.postSlug}`)

                    }else{
                    
                    await commentSchema.findOneAndUpdate({_id:req.params.id}, {$push:{
                   "like":likedUserPost
               }
               
               }).exec((err, _liked)=>{
                   if(err)console.log(err);
                   if(_liked){
                       res.redirect(`/post/${data.postSlug}`)
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

    // // update Edited post
    
    postRouter.put("/mypost/edit/:id", upload.single("postImg"), async(req, res)=>{
        let post = await postSchema.findByIdAndUpdate({_id:req.params.id}, 
        {$set:{
            title:req.body.title,
            content:req.body.content,
            categories:req.body.categories,
            postImg:req.file.filename
            }
            }, (err)=>{
            if(err){
                req.flash("update_err", "unable to update post")
                console.log(err)
            }else{
                req.flash("update_success", "updated successfully")
                res.redirect("/users/dashboard/:id")

                
            }
        })
        
    })
    postRouter.delete("/mypost/delete/:id", async(req, res)=>{
        await postSchema.findByIdAndDelete(req.params.id)
        res.redirect("/users/dashboard/:id")
    })

    // upvote post
    postRouter.put("/v/:id", async (req, res)=>{
        await postSchema.findByIdAndUpdate({_id:req.params.id}, {$inc: {scores:0.5}},  {new: true}, (err, result)=>{
            if(err){
                console.log(err)
            }else{
                res.redirect("/")
            }
        })
     
    })

    

module.exports = postRouter