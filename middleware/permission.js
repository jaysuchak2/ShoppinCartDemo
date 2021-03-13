"use strict";
// middleware for doing role-based permissions
module.exports.permission = function (...allowed) {
    const isAllowed = role => allowed.indexOf(role) > -1;

    // return a middleware
    return (request, response, next) => {
        if (request.user && isAllowed(request.user.role))
            next(); // role is allowed, so continue on the next middleware
        else {
            response.status(403).json({
                success: false,
                message: "Unauthorized Access"
            }); // user is forbidden
        }
    }
}