module.exports = function (app) {
    /* 메인 페이지 (로그인) */
    app.get('/', function (req, res) {
        // 세션이 있으면 로비로 이동
        if (req.session.name) {
            res.redirect('/lobby');
            return
        }

        res.render('index.html');
    });
    /* 로그인 요청 */
    app.post('/login', function (req, res) {
        console.log('refer:', req.session.refer);

        // 세션 설정
        req.session.name = req.body.name;
        req.session.char = req.body.char;

        // 자동 로그인을 위해 쿠키에 저장
        res.cookie('name', req.body.name);
        res.cookie('char', req.body.char);

        if (req.session.refer) {
            res.redirect(req.session.refer);
            return
        };
        res.redirect('/lobby');
    });
    /* 로그아웃 요청 */
    app.get('/logout', function (req, res) {
        if (req.session.name) {
            req.session.destroy(function (err) {
                if (err) console.log(err);
            });
        }
        res.redirect('/');
    });
};