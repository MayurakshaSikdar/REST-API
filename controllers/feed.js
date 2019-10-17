const {
    validationResult
} = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    Post
        .find()
        .then(posts => {
            // if (!posts) {
            //     res.status(200).json({
            //         posts: [],
            //         message: 'No Posts'
            //     });
            // }
            Post.countDocuments()
                .then(docs => {
                    return res.status(200).json({
                        posts: posts,
                        totalPosts: docs
                    });
                })
        })
        .catch(err => console.log(err))

    // res.status(200).json({
    //     posts: [{
    //         _id: '1',
    //         title: 'First Title',
    //         contents: 'First Contents',
    //         imageUrl: 'images/POLICY.png',
    //         creator: {
    //             name: 'Mayuraksha Sikdar'
    //         },
    //         createdAt: new Date()
    //     }]
    // });
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed. Please enter correct data.');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: 'images/POLICY.png',
        creator: {
            name: 'Mayuraksha Sikdar'
        }
    })
    post.save()
        .then(result => {
            res.status(201).json({
                message: 'Post Create Success',
                post: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}


exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                message: 'Post Fetch',
                post: post
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}