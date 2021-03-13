var express = require('express');
var router = express.Router();
var userModel = require("../models/users");
const jwt = require("jsonwebtoken");
var md5 = require('md5');
const createMailTransport = require("../utils/mailer");

// Load input validation
const {
    validateRegisterInput,
    validateLoginInput
} = require("../middleware/validator");


//  Token generator
function generateAccessToken(user) {
    // expires after half and hour (1800 seconds = 30 minutes)
    return jwt.sign(user, process.env.JWT_KEY, {
        expiresIn: '1800s'
    });
}
// view login page
router.get("/login", function (req, res) {
    try {
        res.render("login");
    } catch (error) {
        res.send(error);
    }
});
//  Login api
router.post('/login', async function (req, res, next) {
    try {
        console.log(req.body);
        const {
            errors,
            isValid
        } = validateLoginInput(req.body);
        // Check validation
        if (!isValid) {
            console.log(isValid);
            return res.status(400).json({
                success: false,
                errors
            });
        };

        const {
            body
        } = req;
        const {
            username
        } = body;
        const {
            password
        } = body;
        let user = await userModel.findOne({
            username: username,
            password: md5(password)
        });
        //checking to make sure the user entered the correct username/password combo
        if (user) {
            //if user log in success, generate a JWT token for the user with a secret key
            jwt.sign({
                _id: user._id,
                role: user.role
            }, process.env.JWT_KEY, {
                expiresIn: '2h'
            }, (err, token) => {
                if (err) {
                    console.log(err)
                }
                // res.send(token);
                return res.cookie("authorization", token).send({
                    success: true,
                    token: token,
                    role: user.role,
                    message: "Login Successfully"
                });
                // res.redirect("/products");
            });
        } else {
            return res.send({
                success: false,
                error: 'ERROR: Could not log in'
            });
        }
    } catch (error) {
        console.log(error);
        return res.send({
            success: false,
            error: error
        });
    }
});
//  Logout API
router.post("/logout", (req, res) => {
    res.clearCookie("authorization");
    res.json({
        success: true,
        message: "Logout successfully"
    });
});
// Home page route.
router.post('/register', async function (req, res) {
    try {

        const {
            errors,
            isValid
        } = validateRegisterInput(req.body);
        console.log(req.body);
        // Check validation
        if (!isValid) {
            return res.status(400).json({
                success: false,
                errors
            });
        };

        let userCount = await userModel.countDocuments({
            $or: [{
                email: req.body.email
            }, {
                username: req.body.username
            }]
        });
        if (userCount > 0) {
            return res.status(409).send({
                success: false,
                error: "Username / Email already exist. Please try another user name / email."
            });
        }
        let user = await userModel.create({
            username: req.body.username,
            password: md5(req.body.password),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        });
        if (user) {
            const token = generateAccessToken({
                user: user
            });
            // res.json(token);
            // const mailer = createMailTransport();
            // await mailer.sendMail({
            //     from: process.env.SMTP_FROMEMAIL,
            //     to: `${user.userEmail}`,
            //     subject: `Account Verification`,
            //     html: `<a href="${process.env.HOSTNAME}/api/v1/auth/verify-email/${token}" target="_blank">Verify Email</a>`
            // });

            return res.status(200).send({
                success: true,
                message: "Registration Successfully.",
                data: user,
                token
            })
        }
    } catch (error) {
        return res.send({
            success: false,
            error: error
        });
    }
});
//  API for Auth check
router.post("/checkToken", function (req, res) {
    if (req.cookies["authorization"] || req.headers["authorization"]) {
        const token = req.cookies["authorization"] || req.headers["authorization"];
        jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
            if (err) {
                res.json({
                    success: false,
                    message: err.name + ": Please login again!"
                });
            } else if (decoded) {
                let _user = null;
                _user = await userModel.findOne({
                    _id: decoded._id
                }, "-password", async function (err, admin) {
                    if (err) {
                        return res.json({
                            error: "database error!"
                        });
                    }
                    if (admin) {
                        _user = admin;
                    } else {
                        _user = await userModel.findOne({
                            _id: decoded._id
                        }, "-password", async function (err, agent) {
                            if (err) {
                                return res.json({
                                    error: "database error!"
                                });
                            }
                        });
                    }
                    if (!res.headersSent) return res.json({
                        success: true,
                        _user,
                        token
                    });
                });
            }
        });
    } else {
        res.json({
            success: false,
            message: "Please login again!"
        });
    }
});

module.exports = router;