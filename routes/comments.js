var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../Models/campgrounnds");
var Comment = require("../Models/comment");
var middlewareObj = require("../middleware");
var isLoggedIn = middlewareObj.isLoggedIn;
var checkCommentOwnership = middlewareObj.checkCommentOwnership;

router.get("/new", isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new.ejs", { campground: campground });
        }
    })
});

router.post("/", isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    req.flash("err", "Something went wrong");
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

router.get("/:comment_id/edit", checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, comment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit.ejs", { campground_id: req.params.id, comment: comment });
        }
    });
});

router.put("/:comment_id", checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

router.delete("/:comment_id", checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        req.flash("success", "Comment deleted successfully");
        res.redirect("/campgrounds/" + req.params.id);
    });
});

module.exports = router;