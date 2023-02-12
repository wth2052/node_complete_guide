const bcrypt = require("bcryptjs")
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
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
    errorMessage: message
  });
};


//isLoggedIn에 정보를 저장하고 있어도
//Login 버튼을 클릭하면 요청에 저장됨
//이 정보를 다른 라우트에 대한 요청으로 사용하여
//네비게이션에 쓰이는 프론트엔드 필드인 isAuthenticated에 전달함
//민감한데이터는 쿠키에 저장하면 안됨

//응답을 보낼때 리디렉션을 통해 응답을 보내니
//해당 요청이 끝남.
//요청을 받고 -> 응답을 보내면 그대로 끝
//데이터가 존재하지 않음
//요청이 가면 응답을 보낸후 데이터가 손실되기에
//다른 페이지를 방문하면 (로그인 후 redirect getIndex에 도달)
//=> redirect되면 새로운 요청을 만든다, = 완전히 다른 요청을 다룬다
//많은 사용자의 요청간 연관되지 않는것이 맞다.
//(보면 안되는 데이터까지 보여줄 수도 있기때문.)
//따라서 요청이 한 사용자로부터 비롯되었다 해도 요청이 따로 처리된다.

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', '이메일이나 패스워드가 일치하지 않습니다.');
        return res.redirect('/login');
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
          req.flash('error', '이메일이나 패스워드가 일치하지 않습니다.');
          //이 줄은 다른 함수의 콜백에 속해있으므로 이 줄 이후에는 이줄에 도달할 수 없어
          // 여기에서 then을 반환할 필요가 없다
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
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
    errorMessage: message
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
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

  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash(
          'error',
          '이메일주소가 이미 사용중입니다 다른 이메일주소를 입력해주세요.'
        );
        return res.redirect('/signup');
      }
      return bcrypt
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
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
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
          console.log(err)
        })
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
    console.log(err);
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
      console.log(err);
    });
};