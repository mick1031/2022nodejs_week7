const jwt = require('jsonwebtoken');
const User = require("../models/UserSchema");
const appError = require("../services/appError");

const isAuth = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(appError(400, '未登入', next))
    }

    const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                reject(err);
            } else {
                resolve(payload);
            }
        })
    })

    const currentUser = await User.findById(decoded.id);
    
    if(currentUser == null) {
        return next(appError(400, '未登入', next))
    }

    req.user = currentUser;

    next();
}

module.exports = isAuth;