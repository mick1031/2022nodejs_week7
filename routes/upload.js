var express = require('express');
const { default: ImgurClient } = require('imgur');
const sizeOf = require('image-size');

const isAuth = require('../middlewares/isAuth');
const upload = require('../middlewares/upload');
const appError = require('../services/appError');
const handleErrorAsync = require('../services/handleErrorAsync');



var router = express.Router();

router.post('/', isAuth, upload, handleErrorAsync(async (req, res, next) => {
    
    if (!req.files.length) {
        return next(appError(400, '尚未上傳檔案', next));
    }

    const {buffer} = req.files[0];

    const dimension = sizeOf(buffer);
    if (dimension.width !== dimension.height) {
        return next(appError(400, '圖片長寬不符合 1:1 尺寸', next));
    }

    const client = new ImgurClient({
        clientId: process.env.IMGUR_CLIENTID,
        clientSecret: process.env.IMGUR_CLIENT_SECRET,
        refreshToken: process.env.IMGUR_REFRESH_TOKEN
    })

    const response = await client.upload({
        image: buffer.toString('base64'),
        type: 'base64',
        album: process.env.IMGUR_ALBUM_ID
    });
    
    res.status(200).json({
        status: 'success',
        imgUrl: response.data.link
    });

}));

module.exports = router;



