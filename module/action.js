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
    hasPais.forEach(function(pai) {
        sonPai.remove(pai);
    });

    // 운패에 추가
    let cry = {}
    cry.pais = hasPais;
    cry.pais.push(wantPai.pai);
    cry.from = from;
    player.cry.push(cry);

    // 상태 갱신
    player.state.push('cry');
}

/** 패 받기
 * @param {Array} src Source
 * @param {Array} des Destination
 * @param {Bool} tsumo 쯔모 패 여부
 * @param {Player} player [상태 표시 용]
 */
tsumo = function (src, des, tsumo, player, info) {
    if (src.length == 0) {
        return;
    }

    let pai = src.pop();

    player.tsumoPai = pai;
    player.state.push('tsumo');

    // 안깡 체크
    if (checkAnkang(player.sonPai.concat(pai)).length != 0) {
        player.state.push('ankang');
    }

    // 리치 체크
    //console.log(getPlayerInfo(player).menjen);
    if (getPlayerInfo(player).menjen && !player.rich) {
        let richPai = checkRich(player);
        if (richPai.length != 0) {
            player.state.push('rich');
        }
    }

    // 쯔모 체크
    if (checkWin(info, player, pai)) {
        player.state.push('tsumo!');
    }
}

/** 패 버리기
 * @param {Player} player 버리는 플레이어
 * @param {Pai} pai 버리는 패
 * @param {Bool} tsumo 쯔모패인지 여부
 */
giri = function (player, pai, tsumo, rich) {
    let expai = {
        pai: pai,
    }

    if (rich) expai.rich = true;

    if (tsumo) {
        expai.tsumo = true;
    } else {
        let sonPai = player.sonPai;
        sonPai.remove(pai);
        if (player.tsumoPai != null) {
            sonPai.push(player.tsumoPai);
        }
    }

    player.tsumoPai = null;
    player.river.push(expai);
}