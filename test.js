console.log('====================================DEBUG===================================');

const Mahjong = require('./mahjong');
let mj = new Mahjong(30000);

mj.setGame();
mj.players[2].sonPai[0] = {num:12};
mj.players[2].sonPai[1] = {num:12};
mj.players[2].sonPai[2] = {num:12};
mj.showState();

if (mj.doAction({
    player: 0,
    action: 'giri',
    pai: {num:12, tsumo:true},
})) mj.showState();

if(mj.doAction({
    player: 1,
    action: 'chi',
    hasPais: [{num:11, tsumo:false}, {num:13, tsumo:false}]
})) mj.showState();

if (mj.doAction({
    player: 2,
    action: 'kang',
})) mj.showState();

if(mj.doAction({
    player: 2,
    action: 'giri',
    pai: {num:27, tsumo:false},
})) mj.showState();

if(mj.doAction({
    player: 3,
    action: 'chi',
    hasPais: [{num:26, tsumo:false}, {num:25, tsumo:false}]
})) mj.showState();

if(mj.doAction({
    player: 3,
    action: 'giri',
    pai: {num:23, tsumo:false}
})) mj.showState();

if (mj.doAction({
    player: 0,
    action: 'cancel',
})) mj.showState();

/*mj.doAction({
    player: 2,
    action: 'giri',
    pai: 39,
    tsumo: false
});
mj.showState();
mj.doAction({
    player: 3,
    action: 'giri',
    pai: 46,
    tsumo: true
});
mj.showState();*/
/*
mj.nextGame();
mj.setGame()
mj.showState();

mj.nextGame(true);
mj.setGame();
mj.showState();*/