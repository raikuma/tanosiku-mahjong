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