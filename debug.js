const Mahjong = require('./mahjong')
let mj = new Mahjong(25000);
mj.setGame();

module.exports = function (app, _io) {
    let io = _io.of('/debug');

    app.get('/debug', function(req, res) {
        res.render('debugview.html')
    })

    io.on('connection', function(socket) {
        console.log('debug start');
        io.emit('mj', makePacket(mj));

        socket.on('action', function(a) {
            if (mj.doAction(a)) {
                io.emit('mj', makePacket(mj));
            }
        });

        socket.on('newgame', function(socket) {
            console.log('new game');
            mj.setGame();
            // mj.players[1].sonPai = [11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 41];  // 
            // mj.players[1].sonPai = [11, 11, 11, 12, 13, 14, 15, 16, 17, 18, 19, 19, 19];  // 구련보등
            // mj.players[1].sonPai = [11, 19, 21, 29, 31, 39, 41, 42, 43, 44, 45, 46, 47];  // 국사무쌍
            // mj.players[1].sonPai = [32, 32, 32, 32, 33, 34, 36, 36, 36, 46, 38, 38, 38];  // 녹일색
            // mj.players[1].sonPai = [41, 41, 41, 42, 42, 42, 43, 43, 43, 44, 44, 45, 45];  // 자일색
            mj.players[1].sonPai = [45, 45, 45, 46, 46, 46, 47, 47, 47, 41, 41, 41, 42];  // 대삼원
            // mj.players[1].sonPai = [41, 41, 41, 42, 42, 42, 43, 43, 43, 44, 44, 45, 45];  // 소사희
            // mj.players[1].sonPai = [41, 41, 41, 42, 42, 42, 43, 43, 43, 44, 44, 44, 45];  // 대사희
            // mj.players[1].sonPai = [12, 14, 22, 22, 22, 25, 25, 25, 32, 33, 27, 27, 34];  // 탕야오
            // mj.players[1].sonPai = [42, 42, 42, 42, 41, 41, 31, 31, 32, 32, 32, 33, 33];  // 자풍, 장풍
            // mj.players[1].sonPai = [12, 12, 32, 32, 41, 41, 22, 22, 13, 13, 45, 45, 46];  // 칠대자
            // mj.players[1].sonPai = [11, 11, 11, 23, 23, 23, 34, 34, 36, 37, 38, 46, 46];  // 삼안커

            // mj.king[mj.king.length-1] = 47;
            // mj.paiSan[mj.paiSan.length-4] = 46;

            //mj.info.lastPai = 0;
            
            io.emit('mj', makePacket(mj));
        });
    })

    function makePacket(mj) {
        let ret = {
            players: mj.players,
            info: mj.info,
            king: mj.king,
            dora: mj.dora,
            paiSan: mj.paiSan,
            king: mj.king
        };
        return ret
    }
}