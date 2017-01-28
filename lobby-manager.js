const GameManager = require('./game-manager');

module.exports = function(app, io) {
    this.rooms = [];
    this.lobbyio = io.of('/lobby');
    let roomNum = 0;

    app.get('/lobby', function(req, res) {
        let sess = req.session;

        if (!req.session.name) {
            res.redirect('/');
            return
        }

        res.render('lobby', {
            title: "Lobby Page",
            name: sess.name,
            char: sess.char,
        });
    });
    app.post('/makeroom', function(req, res) {
        let sess = req.session;

        // 로그인 확인
        if (!req.session.name) {
            res.redirect('/');
            return
        }

        res.cookie('room_title', req.body.title);

        // 방 객체 생성 후 배열에 추가
        // info는 공개 가능한 정보
        let room = {
            info: {
                id: roomNum,
                title: req.body.title,
                people: 0,
            }
        };
        room.gm = new GameManager(this, room, io)
        rooms.push(room);
        roomNum += 1;

        // 갱신
        console.log('make room #', room.info.id);
        console.log(rooms)
        res.redirect('/game/'+room.info.id);
    });
    app.get('/game/:id', function(req, res) {
        let sess = req.session;

        // 로그인 확인
        if (!req.session.name) {
            res.redirect('/');
            return
        }

        res.render('game', {
            id: req.params.id
        });
    });

    lobbyio.on('connection', function(socket) {
        console.log('user connected');
        sendRoomInfo(socket)
    });

    this.sendRoomInfo = function (socket) {
        let roomInfo = rooms.filter(function(obj) {
            if (obj.info.people == 0) {
                rooms.splice(rooms.indexOf(obj), 1);
                console.log('delete room #', obj.info.id);
                console.log(rooms)
                return false
            }
            return true
        }).map(function(obj) {
            return obj.info;
        });
        socket.emit('room info', roomInfo);
    }
};