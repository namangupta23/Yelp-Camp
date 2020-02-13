require('dotenv').config();
var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var flash=require("connect-flash");
var Campground=require("./Models/campgrounnds");
var Comment=require("./Models/comment");
var User =require("./Models/user");
var methodOveride=require("method-override");

var commentRoutes=require("./routes/comments.js"),
    campgroundRoutes=require("./routes/campgrounds.js"),
    indexRoutes=require("./routes/index");


var seedDb=require("./seeds.js");
// seedDb();
mongoose.connect("mongodb://localhost:27017/yelp_camp",{useNewUrlParser:true});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));




// Passport Configurations
app.use(flash());
app.use(require("express-session")({
    secret: "This is key used for hashing",
    resave: false,
    saveUninitialized: false
}));
app.locals.moment=require("moment");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req,res,next){
    res.locals.currUser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    next();
});
app.set("view engine","ejs");
app.use(methodOveride("_method"));
app.use("/",indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
;

app.listen("3000",function(){
    console.log("Yelp Camp Server has Started on the Local Machine");
});