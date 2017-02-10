let Mahjong = require('./mahjong/mahjong');
require('./mahjong/util');

module.exports = function (lobby, room, io) {
    let gameio = io.of('/game' + room.info.id);
    let players = [];
    let readycnt = 0;
    let mj;

    gameio.on('connection', function (socket) {
        console.log('gamer enter');
        players.push(socket);
        room.info.people++;

        // 4명이 차면 게임 시작
        if (room.info.people == 4) {
            gameio.removeAllListeners('connection', function () { });
            setGame();
        }

        // 인원 정보 갱신
        gameio.emit('user', room.info.people);
        lobby.refreshRoomInfo();

        socket.on('disconnect', function () {
            console.log('gamer quit');
            room.info.people--;
            players.remove(socket);

            // 방에 사람이 없으면 리스너 제거
            if (room.info.people <= 0) {
                gameio.removeAllListeners('connection', function () { });
                // 아직 있으면 방에 인원 정보 갱신
            } else {
                gameio.emit('user', room.info.people);
            }

            // 로비에 갱신 요청
            lobby.refreshRoomInfo();
        });

        socket.on('ready', function () {
            readycnt++;
            if (readycnt == 4) {
                startGame();
                readycnt = 0;
            }
        });

        socket.on('action', function (a) {
            a.player = players.indexOf(socket);
            let result = mj.doAction(a);
            if (result) {
                for (let i = 0; i < 4; i++) {
                    players[i].emit('mj', makePacket(mj, i));
                }
                if (a.action == 'ron' || a.action == 'tsumo') {
                    console.log('pan end');
                    gameio.emit('pan end', result);
                }
                if (mj.info.uguk.uguk == true) {
                    console.log('uguk');
                    gameio.emit('uguk', mj.info.uguk);
                }
            }
        });

        socket.on('next', function () {
            readycnt++;
            if (readycnt == 4) {
                readycnt = 0;
                mj.nextGame();
                mj.setGame();
                for (let i = 0; i < 4; i++) {
                    players[i].emit('mj', makePacket(mj, i));
                }
            }
        })
    });

    function setGame() {
        console.log('game set');
        mj = new Mahjong(25000);
        mj.setGame();

        // mj.players[1].sonPai = [32, 32, 32, 32, 33, 34, 36, 36, 36, 46, 38, 38, 38];  // 녹일색
        // mj.paiSan[mj.paiSan.length - 1] = 46;
        // mj.info.lastPai = 0;

        gameio.emit('game start');
    }

    function startGame() {
        console.log('game start');
        for (let i = 0; i < 4; i++) {
            players[i].emit('mj', makePacket(mj, i));
        }
    }

    function makePacket(mj, player) {
        let ret = {
            info: mj.info,
            dora: mj.dora,
            score: [],
            river: [],
            cry: [],
            player: mj.players[player],
        }
        for (let i = 0; i < 4; i++) {
            ret.score.push(mj.players[i].score);
            ret.river.push(mj.players[i].river);
            ret.cry.push(mj.players[i].cry);
        }
        return ret;
    }
};