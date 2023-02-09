
exports.getLogin = (req, res, next) => {
  //trim 공백제거
  //split 기호를 기점으로 나눔
  const isLoggedIn = req
      .get('Cookie')
      .trim()
      .split('=')[1];
  res.render('auth/login', {
    path: '/login',
    pageTitle: '로그인',
    isAuthenticated: isLoggedIn
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
  //쿠키를 설정시 만료기한에 대한건 HTTP 날짜 형식을 준수해야한다.
  //Max-Age도 가능, 이때 단위는 초, 쿠키가 얼마나 오래 지속될지를 나타냄, 온라인 은행, 일정 시간 경과 후 시간초과되는 경우 등.. 에 사용가능
  //Domain -> 쿠키 추적
  //Secure -> HTTPS를 통해 페이지가 제공될 경우에만 설정됨
  //HttpOnly = HTTP에서만 동작
  //클라이언트 측, JavaScript 브라우저에서 구동중인 스크립트를 통해 쿠키 값에 더 이상 접근할수 없음을 나타냄.
  //-> 이는 중요한 보안 메커니즘, Cross-Site-Scripting(CSS) 공격으로부터 보호가능
  //누군가가 악성코드를 심어놓았을 수 있는 클라이언트가
  //더이상 쿠키 값을 읽어올수 없게되기 때문이다.
  res.setHeader('Set-Cookie', 'loggedIn=true; Expires=');
  //여기서 저장된 데이터는
  //같은 요청을 다루는 동안만 유효하며
  //app.js에서 사용자를 검색할 때 요청에 저장한 것도 그 때문임
  res.redirect('/')
};