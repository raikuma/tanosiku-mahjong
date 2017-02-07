/** 울기
 * @param {Player} player 우는 플레이어
 * @param {int} from 가져오는 패의 주인 넘버
 * @param {Array} hasPais 우는데 사용하는 패
 * @param {Pai} wantPai 가져올 패
 */
cry = function (player, from, hasPais, wantPai) {
    let sonPai = player.sonPai;

    // 버림패에 표시
    wantPai.take = true;

    // 손패에서 제거
    hasPais.forEach(function (pai) {
        sonPai.remove(pai);
    });

    // 운패에 추가
    let cry = {}
    cry.pais = hasPais.concat(wantPai.pai);
    cry.from = from;
    player.cry.push(cry);

    // 상태 갱신
    player.state.push('cry');
    player.menjen = false;
}

/** 패 버리기
 * @param {Player} player 버리는 플레이어
 * @param {Pai} pai 버리는 패
 * @param {Bool} tsumo 쯔모패인지 여부
 */
giri = function (player, pai, tsumo, rich) {
    let expai = { pai: pai }

    if (rich) expai.rich = true;

    if (tsumo) {
        expai.tsumo = true;
    } else {
        let sonPai = player.sonPai;
        sonPai.remove(pai);
        // 울었을 경우 쯔모패가 없으므로
        if (player.tsumoPai != null) {
            sonPai.push(player.tsumoPai);
        }
    }

    player.tsumoPai = null;
    player.river.push(expai);
}

/** 패 받기
 * @param {Array} src 패를 가져올 곳
 * @param {Player} player
 */
tsumo = function (src, player) {
    // 남은 패가 없으면 유국
    if (this.info.lastPai == 0) {
        this.uguk();
        return;
    }

    this.info.lastPai--;
    pai = src.pop();
    player.tsumoPai = pai;
    player.state.push('tsumo');

    if (src == this.king) {
        player.state.push('kingtsumo');
        this.king.popPush(this.dora);
    }

    // 후리텐 풀림
    if (!player.rich) {
        player.freeten = false;
    }

    if (this.info.lastPai > 0) {
        // 안깡 체크
        if (checkAnkang(player, player.sonPai.concat(pai)).length != 0) {
            player.state.push('ankang');
        }

        // 가깡 체크
        if (checkGakang(player.cry, player.sonPai.concat(pai)) != 0) {
            player.state.push('gakang');
        }
    }

    // 리치 체크
    if (player.menjen && !player.rich) {
        let richPai = checkRich(player);
        if (richPai.length != 0) {
            player.state.push('rich');
        }
    }

    // 쯔모 체크
    if (checkWin(this.info, player, pai)) {
        player.state.push('tsumo!');
    }
}

/** 화료
 * @param {Object} info 게임 정보
 * @param {Player} player 플레이어
 * @param {Pai} pai 화료패
 */
win = function (player, winPai) {
    let info = this.info;
    let players = this.players;
    let sonPai = player.sonPai;

    // 화료 가능 모양인가
    let dragons = getDragon(player.sonPai.concat(winPai));
    if (dragons.length == 0) {
        return false;
    }

    // 족보가 있는 모양이 있는가
    let jocbo = [];
    let winInfo = {
        jocbo: [],
        pan: 0,
        bu: 0,
        score: undefined,
        type: ''
    }
    for (let i = 0; i < dragons.length; i++) {
        let paiInfo = getPaiInfo(info, player, dragons[i], winPai);
        jocbo = getJocbo(info, player, paiInfo);
        console.log('paiInfo: ', paiInfo);
        console.log('jocbo: ', jocbo);
        if (jocbo.length != 0) {
            flag = true;
        }
        let pan = calcPan(jocbo);
        let bu = paiInfo.bu;
        if ('pinghu' in jocbo && 'mjtsumo' in jocbo) {
            bu = 20;
        } else if ('chitoi' in jocbo) {
            bu = 25;
        }
        if (pan > winInfo.pan ||
            (pan == winInfo.pan && bu > winInfo.bu)) {
            winInfo.jocbo = jocbo;
            winInfo.pan = pan;
            winInfo.bu = bu;
        }
    }
    if (player.state.includes('tsumo')) {
        winInfo.type = 'tsumo';
    } else {
        winInfo.type = 'ron';
    }
    winInfo.score = calcScore(player.ga, winInfo.pan, winInfo.bu, winInfo.type);
    console.log('pan: ', winInfo.pan);
    console.log('bu: ', winInfo.bu);
    console.log('score: ', winInfo.score);

    let bonus = this.bon*300;
    if (winInfo.type == 'tsumo') {
        for (let i = 0; i < players.length; i++) {
            if (players[i] == player) {
                players[i].score += winInfo.score[0] + winInfo.score[1] * 2 + bonus;
            } else if (i == info.oya) {
                players[i].score -= winInfo.score[0] + bonus/3;
            } else {
                players[i].score -= winInfo.score[1] + bonus/3;
            }
        }
    } else {
        player.score += winInfo.score + bonus;
        players[info.turn].score -= winInfo.score + bonus;
    }
    if (players.indexOf(player) == info.oya) {
        this.yon = true;
    }

    this.players.forEach(function (player) {
        player.state = [];
    });

    console.log('**화료**');
    return true;
}

/** 유국 */
uguk = function () {
    console.log('**유국**');

    let players = this.players;
    let winPlayers = [];
    let losePlayers = [];

    players.forEach(function (player) {
        let waitPai = getWaitPai(player.sonPai);
        if (waitPai.length != 0) {
            winPlayers.push(player);
        } else {
            losePlayers.push(player);
        }
        player.state = [];
    });

    if (winPlayers.length > 0) {
        winPlayers.forEach(function (player) {
            player.score += 3000 / winPlayers.length;
        });
        losePlayers.forEach(function (player) {
            player.score -= 3000 / losePlayers.length;
        });
    }

    if (winPlayers.length == 1 &&
        winPlayers[0] == players[this.info.oya]) {
        console.log('**연장**');
        this.info.yon = true;
    }
}