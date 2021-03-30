const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")
const findOrCreate = require("mongoose-findorcreate")
const userSchema = new mongoose.Schema({
  
    googleId:{
        type:String,
    },

    facebookId:{
        type:String,
    },

    firstname:{
    type:String,
    trim:true,
        
  }, 

  lastname:{
    type:String,
    trim:true,
  },
    
  username:{
        type:String,
        trim:true,
        require: true,
        unique:true
    },

    email:{
        type:String,
        // require: true,  
        trim:true,
    },
    phone:{
        type:Number,
        trim:true,

    },
    lg:{
        type:String,
    },
    country:{
        type:String,
    },
    state:{
        type:String,
    },
    dob:{
        type:String,
    },
    gender:{
        type:String,
    },

    password:{
        type:String,
        trim:true,
        require: true
    },
    joinAt:{
        type:Date,
        default:Date.now
    },
    profileImg:{
        type:String,
        default : "default.png"
    },
    address:{
        type:String,
        trim:true,
    }, 
    roles:{
        type:String,
        default:"member"
    }
    
    
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate)
 
module.exports = mongoose.model('User', userSchema);