const {
    validationResult
} = require('express-validator');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const User = require('../models/user');



exports.login = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        thenError('Validation Failed. Login failed.', 422, errors.array());
    }

    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;

    User.findOne({
            email: email
        })
        .then(user => {
            if (!user) {
                thenError('User not Found !', 401, errors.array());
            }

            loadedUser = user;

            return bcrypt.compare(password, user.password)
        })
        .then(match => {
            if (!match) {
                thenError('Wrong Password', 401, []);
            }

            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, 'secret_key', {
                expiresIn: '1h'
            })

            res.status(200).json({
                token: token,
                userId: loadedUser._id.toString()
            })
        })
        .catch(err => {
            catchError(err);
        });
}

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        thenError('Validation Failed. SignUp failed.', 422, errors.array());
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt.hash(password, 12)
        .then(hashPwd => {
            const user = new User({
                email: email,
                password: hashPwd,
                name: name
            })
            return user.save()
        })
        .then(result => {
            if (!result) {
                thenError('User creation failed.', 422, [])
            }
            res.status(201).json({
                message: 'User created !',
                userId: result._id
            })
        })
        .catch(err => {
            catchError(err);
        });
}



const catchError = error => {
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    next(error);
}

const thenError = (message, statusCode, data) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.data = data;
    throw error;
}