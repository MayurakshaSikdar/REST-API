const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        error.data = [];
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'secret_key');
    } catch (err) {
        const error = new Error('Not Authorized');
        error.statusCode = 500;
        error.data = [];
        throw error;
    }

    if (!decodedToken) {
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        error.data = [];
        throw error;
    }

    req.userId = decodedToken.userId;
    next();
}