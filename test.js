const Mahjong = require('./mahjong');
let mj = new Mahjong();

mj.init(25000);
mj.setGame();
mj.showState();

mj.nextGame();
mj.setGame()
mj.showState();

mj.nextGame(true);
mj.setGame();
mj.showState();