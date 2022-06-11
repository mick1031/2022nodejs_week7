var express = require('express');
var router = express.Router();
const validator = require('validator');
const bcrypt = require('bcryptjs/dist/bcrypt');

const User = require('../models/UserSchema');
const isAuth = require('../middlewares/isAuth');
const generateSendJWT = require('../services/generateSendJWT');
const handleErrorAsync = require('../services/handleErrorAsync');
const appError = require('../services/appError');

router.get('/', async function (req, res, next) {
  const data = await User.find();

  res.status(200)
    .json({
      status: "success",
      data: data,
    });
});

router.post('/sign_up', handleErrorAsync(async function (req, res, next) {
  let { email, password, confirmPassword, name } = req.body;

  if (!email || !password || !confirmPassword || !name) {
    return next(appError(400, '欄位未填寫正確(內容不可為空)', next));
  }

  if (password !== confirmPassword) {
    return next(appError(400, '密碼不一致', next));
  }

  if (!validator.isLength(password, { min: 8 })) {
    return next(appError(400, '密碼字數低於 8 碼', next));
  }

  if (!validator.isEmail(email)) {
    return next(appError(400, 'Email 格式不正確', next));
  }

  password = await bcrypt.hash(req.body.password, 12);

  const newUser = {
    email,
    password,
    name
  };
  const user = await User.create(newUser);
  const token = generateSendJWT(newUser);

  user.password = undefined;
  res.status(200).json({
    status: 'success',
    user: {
      token,
      name: user.name
    },
  })

}))

router.post('/sign_in', handleErrorAsync(async (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return next(appError(400, '欄位未填寫正確(內容不可為空)', next));
  }

  if (!validator.isLength(password, { min: 8 })) {
    return next(appError(400, '密碼字數低於 8 碼', next));
  }

  const user = await User.findOne({ email: email }, 'name +password');

  if (!user) {
    return next(appError(400, '帳號或密碼錯誤', next));
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return next(appError(400, '帳號或密碼錯誤', next));
  }

  const token = generateSendJWT(user);

  res.status(200).json({
    token,
    name: user.name,
  })
}))

router.patch('/updatePassword', isAuth, handleErrorAsync(async (req, res, next) => {
  let { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(appError(400, '欄位未填寫正確(內容不可為空)', next));
  }

  if (!validator.isLength(password, { min: 8 })) {
    return next(appError(400, '密碼字數低於 8 碼', next));
  }

  if (password !== confirmPassword) {
    return next(appError(400, '密碼不一致', next));
  }

  const model = {
    password: await bcrypt.hash(password, 12)
  };

  const result = await User.findByIdAndUpdate(req.user.id, model);

  if (result) {
    res.status(200).json({
      status: 'success'
    })
  } else {
    appError(400, '資料庫更新失敗')
  }

}))

router.get('/profile', isAuth, handleErrorAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    user
  })
}))

router.patch('/profile', isAuth, handleErrorAsync(async (req, res, next) => {

  const {image, name, gender} = req.body;

  if (!name || !gender) {
    return next(appError(400, '欄位未填寫正確(內容不可為空)', next));
  }

  if(gender !== '男' && gender !== '女'){
    return next(appError(400, '性別輸入不正確', next));
  }

  const model = {
    image, 
    name,
    gender
  };
  const result = await User.findByIdAndUpdate(req.user.id, model);

  if (result) {
    res.status(200).json({
      status: 'success'
    })
  } else {
    appError(400, '資料庫更新失敗')
  }

}))

router.get('/check_login', isAuth, handleErrorAsync(async (req, res, next) => {

  res.json({
    status: 'success',
    user: req.user
  })
}))

module.exports = router;
