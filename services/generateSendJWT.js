const jwt = require('jsonwebtoken');

const generateSendJWT = (user) => {
    const token = jwt.sign(
        {
            id: user._id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRESS_DAY
        }
    );
    return token;
}

module.exports = generateSendJWT;