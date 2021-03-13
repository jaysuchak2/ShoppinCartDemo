const jwt = require("jsonwebtoken");
// Auth function middleware
const authenticateToken = function (req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.cookies['authorization'] || req.headers['authorization']
    const token = authHeader;

    if (token == null) {
        // res.redirect("/users/login");
        // return res.sendStatus(401);
        return res.status(401).send({
            success: false,
            message: "Unauthorized request."
        });
    } // if there isn't any token

    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(403).send({
                success: false,
                message: "Invalid token or token get expired"
            });
        }
        req.user = user;
        next(); // pass the execution off to whatever request the client intended
    })
}

module.exports = authenticateToken;