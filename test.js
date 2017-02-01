console.log('====================================DEBUG===================================');

const Mahjong = require('./mahjong');
let mj = new Mahjong(25000);

mj.setGame();
mj.players[2].sonPai[0] = 12;
mj.players[2].sonPai[1] = 12;
mj.players[2].sonPai[2] = 12;
mj.showState();

if (mj.doAction({
    player: 0,
    action: 'giri',
    pai: 12,
    tsumo: true
})) mj.showState();

if(mj.doAction({
    player: 1,
    action: 'chi',
    hasPais: [11, 13]
})) mj.showState();

if (mj.doAction({
    player: 2,
    action: 'kang',
})) mj.showState();

if(mj.doAction({
    player: 2,
    action: 'giri',
    pai: 27,
})) mj.showState();

if(mj.doAction({
    player: 3,
    action: 'chi',
    hasPais: [26, 25]
})) mj.showState();

if(mj.doAction({
    player: 3,
    action: 'giri',
    pai: 23,
})) mj.showState();

if (mj.doAction({
    player: 0,
    action: 'cancel',
})) mj.showState();

mj.nextGame();
mj.setGame()
mj.showState();

mj.nextGame(false);
mj.setGame();
mj.showState();/**/