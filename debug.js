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
            //mj.players[0].sonPai[0] = 41;
            //mj.players[1].sonPai = [11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 41];
            mj.players[1].sonPai = [11, 11, 11, 12, 13, 14, 15, 16, 17, 18, 19, 19, 19];
            io.emit('mj', makePacket(mj));
        });
    })

    function makePacket(mj) {
        let ret = {
            players: mj.players,
            info: mj.info,
            lastPai: mj.paiSan.length,
            king: mj.king,
            dora: mj.dora
        };
        return ret
    }
}