const GameManager = require('./game-manager');

module.exports = function (app, io) {
    this.lobbyio = io.of('/lobby');
    let rooms = [];
    let roomNum = 0;

    let debugroom = null;

    app.get('/lobby', function (req, res) {
        // 로그인 확인
        if (!req.session.name) {
            res.redirect('/');
            return
        }

        res.render('lobby', {
            title: "Lobby Page",
            name: req.session.name,
            char: req.session.char,
        });
    });
    /* 방 만들기 */
    app.post('/makeroom', function (req, res) {
        // 로그인 확인
        if (!req.session.name) {
            res.redirect('/');
            return
        }

        // 방 제목 자동 완성
        res.cookie('room_title', req.body.title);

        // 방 객체 생성 후 배열에 추가
        // info는 공개 가능한 정보
        let room = {
            info: {
                id: roomNum,
                title: req.body.title,
                people: 0,
                pass: false
            },
            pass: req.body.pass,
            serial: ''
        };
        // 비밀번호가 있으면 방에 표시
        if (room.pass != '') {
            room.info.pass = true;
            room.serial = room.info.id; // 방에 입장하기 위한 증명,
            // 나중에 해쉬함수로 변경한다.
        }
        // 게임매니저 초기화
        room.gm = new GameManager(this, room, io)
        rooms.push(room);
        roomNum += 1;
        console.log('make room #', room.info.id);
        console.log(rooms);

        // 방만든 사람에게 인증 부여
        req.session.serial = room.serial;

        // 게임 방으로 리다이렉트
        res.redirect('/game/' + room.info.id);
    });
    /* 방 입장 가능 여부를 여기서 판단 */
    app.post('/roomEnter', function (req, res) {
        console.log(req.body.id, req.body.pass);
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].info.id == req.body.id && rooms[i].pass == req.body.pass) {
                console.log('send serial')
                req.session.serial = rooms[i].serial;
                res.send('sucess');
                return
            }
        }
        res.send('fail');
    });
    app.get('/game/:id', function (req, res) {
        // 로그인 확인
        if (!req.session.name) {
            res.redirect('/');
            return
        }

        // 인증 정보 확인
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].info.id == req.params.id) {                // 주어진 아이디 방에서
                if (rooms[i].info.pass == true) {                   // 비밀번호 있는 방인데
                    if (rooms[i].serial != req.session.serial) {     // 인증 안되면
                        res.redirect('/lobby');                     // 로비로 빠꾸
                        return
                    }
                }
                res.render('gameview', {                                // 인증 되면 게임 방으로
                    id: req.params.id
                });
                return
            }
        }
        // 방이 없으면 로비로 빠꾸
        res.redirect('/lobby');
    });
    //-실험용-----------------------------------
    app.get('/game/:id/:pass', function (req, res) {
        // 로그인 확인
        if (!req.session.name) {
            req.session.refer = '/game/' + req.params.id + '/' + req.params.pass;
            res.redirect('/');
            return
        }

        // 인증 정보 확인
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].info.id == req.params.id) {                // 주어진 아이디 방에서
                if (rooms[i].info.pass == true) {                   // 비밀번호 있는 방인데
                    if (rooms[i].pass != req.params.pass) {          // 인증 안되면
                        res.redirect('/lobby');                     // 로비로 빠꾸
                        return
                    }
                }
                res.render('gameview', {                                // 인증 되면 게임 방으로
                    id: req.params.id
                });
                return
            }
        }
        // 방이 없으면 로비로 빠꾸
        res.redirect('/lobby');
    });
    app.get('/debug/game', function (req, res) {
        // info는 공개 가능한 정보
        if (debugroom == null) {
            debugroom = {
                info: {
                    id: 255,
                    title: 'DebugRoom',
                    people: 0,
                    pass: false
                },
                pass: req.body.pass,
                serial: ''
            };
            // 게임매니저 초기화
            debugroom.gm = new GameManager(this, debugroom, io)
            console.log('make room #', 255);
        }

        res.render('gameview', {
            id: 255
        });
    });
    //-------------------------------------------

    /* 소켓 통신 */
    this.lobbyio.on('connection', function (socket) {
        console.log('user connected');

        // 접속 시 방 정보 보냄
        refreshRoomInfo(socket)
    });

    /* 방 정보 갱신 */
    this.refreshRoomInfo = function (socket) {
        if (socket == undefined) socket = this.lobbyio;

        let roomInfo = rooms.filter(function (obj) {
            // 방 인원이 0명이면 삭제
            if (obj.info.people == 0) {
                rooms.splice(rooms.indexOf(obj), 1);
                console.log('delete room #', obj.info.id);
                console.log(rooms)
                return false
            }
            return true
        }).map(function (obj) {
            // 공개 가능한 정보만 모아 보낸다
            return obj.info;
        });
        socket.emit('room info', roomInfo);
    };
};