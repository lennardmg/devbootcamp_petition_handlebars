module.exports.requireLoggedInUser = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("/registration");
    } else {
        next();
    }
}
