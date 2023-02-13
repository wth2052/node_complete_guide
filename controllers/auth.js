const bcrypt = require("bcryptjs")
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const { validationResult } = require('express-validator/check')
const User = require("../models/user");
const dotenv = require('dotenv');
dotenv.config();
const env = process.env
const transporter = nodemailer.createTransport({
  service: "gmail",  // 이메일
  auth: {
    user: env.MAIL_ID,  // 발송자 이메일
    pass: env.MAIL_PASSWORD,  // 발송자 비밀번호
  },
});


//trim 공백제거
//split 기호를 기점으로 나눔
// const isLoggedIn = req
//     .get('Cookie')
//     .trim()
//     .split('=')[1];
//사용자를 식별하기위해 쿠키가 필요하지만, 민감한 정보는 서버에 저장이된다.
//==세션의 이점

//오류 알림을 세션에 담음,
//세션에 잠깐 띄웠다가 보내고 사라지게

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: '로그인',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: '회원가입',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: '비밀번호 혹은 아이디가 일치하지 않습니다.',
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }
      //이 두 값이랑 확인해서
      bcrypt
        .compare(password, user.password)
        // 맞으면 세션을 설정해줌
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            //리턴시켜서 아래 redirect login이 실행되지 않도록한다
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          //이 줄은 다른 함수의 콜백에 속해있으므로 이 줄 이후에는 이줄에 도달할 수 없어
          // 여기에서 then을 반환할 필요가 없다
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: '이메일 혹은 비밀번호가 일치하지 않습니다.',
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  //뭐가 문제였는지 배열로 나옴
  console.log(errors.array());
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: '회원가입',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    });

  }
  const mailOptions = {
    from: process.env.MAIL_ID,
    to: email,
    subject: "이메일 인증",
    html: `<h1>이메일 인증</h1>
          <div>
            가입을 환영합니다. 가입처리에 앞서 이메일 인증을 부탁드립니다.
            <a href='http://127.0.0.1:3000/auth/verification/'>이메일 인증하기</a>
          </div>`,
    text: "인증메일입니다.",
  };
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      const info = transporter.sendMail(mailOptions);
      console.log(info)
      return info
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
}
exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: '패스워드 찾기',
    errorMessage: message
  });
}
exports.postReset = (req, res, next) => {
  //비교적 안전한 임의의 값이 필요 -> crypto
  //이걸 통과하면 버퍼를 가지게 되는데, 이 버퍼는 16진법을 저장함
  //이걸 데이터베이스에 저장해야함, models/user (토큰 이름, 토큰 유효기간)
  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email}).then(user => {
      if (!user) {
        req.flash('error', '계정과 일치하는 이메일 주소를 찾지 못했습니다.');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      user.save();
    })
      .then(result => {

        const mailOptions = {
          from: process.env.MAIL_ID,
          to: req.body.email,
          subject: "비밀번호 찾기",
          html: `<h1>비밀번호 찾기</h1>
          <div>
            비밀번호 찾기 안내 메일입니다. 아래의 링크를 클릭하여 비밀번호를 초기화할 수 있습니다.
            <a href='http://127.0.0.1:3000/reset/${token}'>비밀번호 초기화 하기</a>
          </div>`,
          text: "인증메일입니다.",
        };
        res.redirect('/')
        transporter.sendMail(mailOptions);

      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  //$gt = 보다 크다
  //토큰 시점이 만료보다 미래일때
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: '비밀번호 초기화',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};