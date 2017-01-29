module.exports = function(lobby, room, io) {
    let gameio = io.of('/game'+room.info.id);

    gameio.on('connection', function(socket) {
        console.log('gamer enter');
        room.info.people++;

        // 인원 정보 갱신
        gameio.emit('user', room.info.people);
        lobby.refreshRoomInfo();

        socket.on('disconnect', function() {
            console.log('gamer quit');
            room.info.people--;

            // 방에 사람이 없으면 리스너 제거
            if (room.info.people <= 0) {
                gameio.removeAllListeners('connection', function() {});
            // 아직 있으면 방에 인원 정보 갱신
            } else {
                gameio.emit('user', room.info.people);
            }

            // 로비에 갱신 요청
            lobby.refreshRoomInfo();
        })
    });

    let removeListener = function() {
        console.log('try to removeListener')
        gameio.removeAllListeners('connection', function() {
            console.log('removeListener')
        });
    }
}