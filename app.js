var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: './config.env' });
require('./connections/index');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var uploadRouter = require('./routes/upload');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/upload', uploadRouter);

app.use(function (req, res, next) {
    res.status(404)
        .json({
            status: 'error',
            message: '無此路由資訊',
        })
})

const resErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode)
            .json({
                message: err.message
            })
    } else {
        console.log('出現重大錯誤', err);
        res.status(500)
            .json({
                status: 'error',
                message: '系統錯誤，請洽系統管理員'
            })
    }
}

const resErrorDev = (err, res) => {
    res.status(err.statusCode)
        .json({
            message: err.message,
            error: err,
            stack: err.stack
        })
}

app.use(function (err, req, res, next) {
    // dev
    err.statusCode = err.statusCode || 500;
    if (process.env.NODE_ENV === 'dev') {
        return resErrorDev(err, res)
    }

    if (err.name === 'ValidationError') {
        err.message = '資料欄位未填寫正確，請重新輸入';
        err.isOperational = true;
        return resErrorProd(err, res);
    }
    return resErrorProd(err, res);
})

process.on('uncaughtException', err => {
    console.error('uncaugh Exception!');
    console.error(err.name);
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
})

process.on('unhandledRejection', (err, promise) => {
    console.log('為捕捉到的 rejection', promise, '原因', err);
})

module.exports = app;
