exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{
            title: 'First Title',
            contents: 'First Contents'
        }]
    });
}