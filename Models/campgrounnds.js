var mongoose=require("mongoose");
var campgroundSchema=new mongoose.Schema({
    name: String,
    price: Number,
    imageId: String,
    image: String,
    description: String,
    author:{
       id:{
          type: mongoose.Schema.Types.ObjectId,
          ref:"User"
       },
       username: String
    },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
     ],
     createdAt:{
        type: Date, default: Date.now
     }
});
module.exports=mongoose.model("Campground",campgroundSchema);
