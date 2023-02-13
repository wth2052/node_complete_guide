exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: '페이지를 찾을 수 없습니다.',
    path: '/404',
    isAuthenticated: req.session.isLoggedIn
     });
};

exports.get500 = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: '에러 발생!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
};
