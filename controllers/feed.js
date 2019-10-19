const fs = require('fs')
const path = require('path')

const {
    validationResult
} = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Post
        .find()
        .countDocuments()
        .then(docs => {
            if (!docs) {
                thenError('No Posts.', 422, []);
            }

            totalItems = docs;

            return Post
                .find()
                .populate({
                    path: 'creator',
                    select: 'name'
                })
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(posts => {
            if (!posts) {
                thenError('No Posts.', 422, []);
            }
            res
                .status(200)
                .json({
                    message: 'Fetched posts successfully.',
                    posts: posts,
                    totalItems: totalItems
                });
        })
        .catch(err => {
            catchError(err);
        })

        .catch(err => {
            catchError(err);
        });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        thenError('Validation failed, data incorrect.', 422, errors.array());
    }
    if (!req.file) {
        thenError('No image provided.', 422, errors.array());
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    const userId = req.userId;

    let creator;

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: userId
    });

    post.save()
        .then(result => {
            if (!result) {
                thenError('Post Save Failed.', 500, []);
            }
            return User.findById(userId);
        })
        .then(user => {
            if (!user) {
                thenError('User not found.', 500, []);
            }

            creator = user;

            user.posts.push(post)

            return user.save()
        })
        .then(result => {
            if (!result) {
                thenError('User post not saved.', 500, []);
            }
            res.status(201).json({
                message: 'Post created successfully!',
                post: post,
                creator: {
                    _id: creator._id,
                    name: creator.name
                }
            });
        })
        .catch(err => {
            catchError(err);
        });
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                thenError('Could not find post.', 404, errors.array());
            }
            res.status(200).json({
                message: 'Post fetched.',
                post: post
            });
        })
        .catch(err => {
            catchError(err);
        });
};

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        thenError('Validation failed, entered data is incorrect.', 422, errors.array());
    }

    const postId = req.params.postId;
    const userId = req.userId;

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
        imageUrl = req.file.path;
    }

    // if (!imageUrl) {
    //     const error = new Error('No File Picked.');
    //     error.statusCode = 422;
    //     throw error;
    // }


    Post.findById(postId)
        .then(post => {
            if (!post) {
                thenError('Could not find post.', 422, errors.array());
            }

            if (post.creator.toString() !== userId) {
                thenError('Could not find post', 403, []);
            }

            post.title = title;
            post.content = content;
            if (imageUrl && imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
                post.imageUrl = imageUrl;
            }
            return post.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Post created successfully!',
                post: result
            });
        })
        .catch(err => {
            catchError(err);
        });
}


exports.postDelete = (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.userId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                thenError('Could not find post.', 422, errors.array());
            }
            if (post.creator.toString() !== userId) {
                thenError('Not Authorized', 403, []);
            }

            clearImage(post.imageUrl);
            return Post.findByIdAndDelete(postId);
        })
        .then(result => {
            return User.findById(userId);
        })
        .then(user => {
            user.posts.pull((postId));
            return user.save()
        })
        .then(result => {
            res.status(200).json({
                message: 'Post Deleted'
            })
        })
        .catch((err) => {
            catchError(err);
        });
}


const clearImage = (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => {
        if (err) {
            console.log(err);
        }
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