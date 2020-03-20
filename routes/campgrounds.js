var express = require("express");
var router = express.Router();
var Campground = require("../Models/campgrounnds");
var middlewareObj = require("../middleware/index.js");
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get("/", function(req, res) {
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({ name: regex }, function(err, allCampgrounds) {
            if (err) {
                console.log(err);
                res.redirect("/campgrounds");
            } else {
                if (allCampgrounds.length < 1) {
                    noMatch = "No Campgrounds match that query. Please try again";
                }
                res.render("campgrounds/index.ejs", { campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch });
            }
        })
    } else {
        Campground.find({}, function(err, allCampgrounds) {
            if (err) {
                res.redirect("/campgrounds");
            } else {
                res.render("campgrounds/index.ejs", { campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch });
            }
        });
    }

});
var isLoggedIn = middlewareObj.isLoggedIn;
var checkCampgroundOwnership = middlewareObj.checkCampgroundOwnership;
router.post("/", isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        req.body.campground.image = result.secure_url;
        req.body.campground.imageId = result.public_id;
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        }

        Campground.create(req.body.campground, function(err, campground) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground.id);
        });
    });
});
router.get("/new", isLoggedIn, function(req, res) {
    res.render("campgrounds/new.ejs");
});

router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
            console.log("SOMETHING WENT WRONG");
        } else {
            console.log(foundCampground);
            res.render("campgrounds/show.ejs", { campground: foundCampground });
        }
    });
});

router.get("/:id/edit", checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        res.render("campgrounds/edit.ejs", { campground: foundCampground });
    });
});

router.put("/:id", checkCampgroundOwnership, upload.single('image'), function(req, res) {
    Campground.findById(req.params.id, async function(err, campground) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(campground.imageId)
                    var result = await cloudinary.v2.uploader.upload(req.file.path)
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
                } catch (err) {
                    req.flash("error", err.message);
                    res.redirect("/campgrounds");
                }
            }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.save();
            req.flash("success", "Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});

router.delete("/:id", checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, async function(err, campground) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            try {
                await cloudinary.v2.uploader.destroy(campground.imageId)
                campground.remove();
                req.flash("success", "Campground Deleted Successfully!");
                res.redirect("/campgrounds");
            } catch (err) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("/campgrounds");
                }
            }
        }
    });
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



module.exports = router;