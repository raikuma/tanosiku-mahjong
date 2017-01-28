module.exports = function(lobby, room, io) {
    let gameio = io.of('/game'+room.info.id);

    gameio.on('connection', function(socket) {
        console.log('gamer enter');
        room.info.people++;
        gameio.emit('user', room.info.people);
        lobby.sendRoomInfo(lobby.lobbyio);

        socket.on('disconnect', function() {
            console.log('gamer quit');
            room.info.people--;
            if (room.info.people == 0) {
                gameio.removeListener('connection');
            }
            gameio.emit('user', room.info.people);
            lobby.sendRoomInfo(lobby.lobbyio);
        })
    });
}