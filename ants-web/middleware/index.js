var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Sorry, that comment does not exist!");
                res.redirect("/services");
            } else {
                // does user own the comment?
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("/services");
                }
            }
        });
    } else {
        req.flash("error", "You must be signed in to do that!");
        res.redirect("/services");
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        // req.flash("error", "You must be signed in to do that!");
        // res.redirect("/services");
        // Flash an error and redirect to the login page if not logged in
        req.flash("error", "You must log in first to book a service!");
        res.redirect("/customer/login"); // Redirect to the login page
    }
}

module.exports = middlewareObj;