const mongoose = require("mongoose")
const slugify = require("slugify")
const commentSchema = new mongoose.Schema({
    
    postSlug:{
        type: String
    },
    message:{
        type:String,
    },
    commentBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    
    commentAt:{
        type:Date,
        default:Date.now
    },
    
like:[
        {
     likePost:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"User"
    }
        }
    ],

    replyComment:[
        {
     replyBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    commentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"comment"
    },

    myreply:{
        type:String
    },

    replyTo:{
        type:String
    },
    replyAt:{
        type:Date,
        default:Date.now
    },
   
   
        }
    ],

    

    
})

module.exports = mongoose.model("comment", commentSchema)