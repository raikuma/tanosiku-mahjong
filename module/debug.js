/**
 * 디버그용 출력 함수
 */
showState = function (mj) {
    let players = mj.players;
    let info = mj.info;
    let paiSan = mj.paiSan;
    let king = mj.king;
    let dora = mj.dora;
    let queue = mj.queue;

    function paiStr(arr) {
        return arr.map(function (pai) {
            return pai;
        })
    }

    function expaiStr(arr) {
        return arr.map(function (expai) {
            let ret = '' + expai.pai;
            if (expai.tsumo) ret += '*';
            if (expai.take) ret += '/';
            return ret;
        })
    }

    console.log('플레이어:');
    console.log(players.map(function (player) {
        let ret = '';
        ret += GA(player.ga) + ' : ';
        ret += '점수 < ' + player.score + ' > ';
        ret += '[ ' + paiStr(player.sonPai);
        if (player.tsumoPai != null) {
            ret += '/' + player.tsumoPai;
        }
        ret += ' ] ';
        ret += '운패 [ ' + player.cry.map(function (cry) {
            let ret = '' + paiStr(cry.pais);
            if (cry.from) ret += '-' + cry.from
            return ret;
        }) + ' ] ';
        ret += '상태 [ ' + player.state + ' ] ';
        ret += '버림패 [ ' + expaiStr(player.river) + ' ] ';
        return ret
    }));
    console.log(GA(parseInt(info.guk / 4)), info.guk % 4 + 1, '국',
        info.bon, '본장');
    console.log('오야:', info.oya, '차례:', info.turn);
    console.log('남은패:', paiSan.length + '장',
        paiStr(paiSan).join());
    console.log('왕패: [', paiStr(king).join(), ']',
        '도라: [', paiStr(dora).join(), ']');
    console.log('큐:', queue.map(function (action) {
        return action;
    }));
    console.log();
}

GA = function(ga) {
    switch (ga) {
        case 'DONG': return 0;
        case 'NAM': return 1;
        case 'SEO': return 2;
        case 'BUK': return 3;
        case 0: return '동';
        case 1: return '남';
        case 2: return '서';
        case 3: return '북';
        default: return undefined;
    }
}

PAI = function(pai) {
    /* 11 -> 1통 */
    if (typeof pai == 'number') {
        switch (parseInt(pai / 10)) {
            case 1: return '' + (pai % 4) + '만';
            case 2: return '' + (pai % 4) + '통';
            case 3: return '' + (pai % 4) + '삭';
            case 4:
                switch (pai % 10) {
                    case 1: return '동';
                    case 2: return '남';
                    case 3: return '서';
                    case 4: return '북';
                    case 5: return '백';
                    case 6: return '발';
                    case 7: return '중';
                }
        }

        /* 1통 -> 11 */
    } else {
    }
}