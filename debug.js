const Mahjong = require('./mahjong')
let mj = new Mahjong(25000);

module.exports = function (app, _io) {
    let io = _io.of('/debug');

    app.get('/debug', function(req, res) {
        res.render('debugview.html')
    })

    io.on('connection', function(socket) {
        console.log('debug start');
        mj.setGame();
        mj.showState();
        console.log(mj.players[1].sonPai.length);
        io.emit('mj', makePacket(mj));

        socket.on('action', function(a) {
            if (mj.doAction(a)) {
                io.emit('mj', makePacket(mj));
            }
        });
    });

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