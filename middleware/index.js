var Campground=require("../Models/campgrounnds");
var Comment=require("../Models/comment");
var middlewareObj = {};
middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, foundCampground) {
            if (err) {
                req.flash("error","Campground not found");
                res.redirec("/campgrounds");
            }
            else {
                if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }
                else {
                    req.flash("error","You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }
    else {
        req.flash("error","You need to be logged in to that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirec("back");
            }
            else {
                if (foundComment.author.id.equals(req.user._id)|| req.user.isAdmin) {
                    next();
                }
                else {
                    req.flash("error","You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }
    else {
        req.flash("error","You need to be logged in to that");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error","You need to be logged in to that");
    res.redirect("/login");
}

module.exports = middlewareObj;