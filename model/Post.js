const mongoose = require("mongoose")
const slugify = require("slugify")
const postSchema = new mongoose.Schema({
    title:{
        type:String,
        require:true
    },

    content:{
        type:String,
        require:true
    },

    categories:{
        type:String,
        require:true
    },
    postImg:{
        type:String
    },

    createdAt:{
        type:Date,
        default:Date.now()
    },
    scores:{
        type:Number,
        default:"0",
        
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
    approve:{
        type:Boolean,
        default:false
    },

    postedBy:{
       type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
   
})
postSchema.pre("validate", function(next){
    this.slug = slugify(this.title, {
        lower:true,
        // strict:true
    })

    next()
})

module.exports = mongoose.model("post", postSchema)