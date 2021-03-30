const mongoose = require("mongoose")
const slugify = require("slugify")
const replySchema = new mongoose.Schema({
   
    replyBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"comment"
    },
    reply:{
        type:String
    },
    replyTo:{
        type:String
    },
    replyAt:{
        type:Date,
        default:Date.now
    },
    commentSlug:{
        type:String

    },
    commentId:{
        type:String

    }
})

module.exports = mongoose.model("reply", replySchema)