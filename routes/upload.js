var express = require('express');
const { default: ImgurClient } = require('imgur');
const isAuth = require('../services/auth');
const upload = require('../services/upload');

var router = express.Router();

router.post('/', isAuth, upload, function (req, res, next) {
    if (!req.files.length) {
        // return next(appError(400, '尚未上傳檔案', next));
    }

    const dimension = sizeOf(req.files[0].buffer);
    if (dimension.width !== dimension.height) {
        // return next(appError(400, '圖片長寬不符合 1:1 尺寸', next));
    }

    const client = new ImgurClient({
        clientId: process.env.IMGUR_CLIENTID,
        clientSecret: process.env.IMGUR_CLIENT_SECRET,
        refreshToken: process.env.IMGUR_REFRESH_TOKEN
    })

    const response = await client.upload({
        image: req.file[0].buffer.toString('base64'),
        type: 'base64',
        album: process.env.IMGUR_ALBUM_ID
    });
    
    res.status(200).json({
        status: 'success',
        imgUrl: response.data.link
    });
});

module.exports = router;



