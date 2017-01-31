let Mahjong = function () { };
module.exports = Mahjong;

Mahjong.prototype.init = function (initScore) {
    this.guk = 0;   // 동 1 국
    this.bon = 0;   // 0 본장

    if (!initScore) initScore = 25000;
    this.player = [];
    for (let i = 0; i < 4; i++) {
        this.player.push({ score: initScore });
    }
    this.oya = 0;
}

Mahjong.prototype.setGame = function () {
    /* 패산 쌓기 */
    this.paiSan = [];
    // 각 패가 4개
    /*for (let k = 0; k < 4; k++) {
        // 만 통 삭
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 9; j++) {
                this.paiSan.splice(Math.random() * this.paiSan.length, 0, i * 10 + j);
            }
        }
        // 동 남 서 북 백 발 중
        for (let i = 4, j = 1; j <= 7; j++) {
            this.paiSan.splice(Math.random() * this.paiSan.length, 0, i * 10 + j);
        }
    }*/
    for (let k = 0; k < 4; k++) {
        // 만 통 삭
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 9; j++) {
                this.paiSan.push(i * 10 + j);
            }
        }
        // 동 남 서 북 백 발 중
        for (let i = 4, j = 1; j <= 7; j++) {
            this.paiSan.push(i * 10 + j);
        }
    }

    /* 왕패 떼기 */
    this.king = [];
    for (let i = 0; i < 14; i++) {
        tsumo(this.paiSan, this.king);
    }

    /* 플레이어 설정 */
    for (let i = 0; i < 4; i++) {
        // 가 설정
        this.player[(this.oya + i) % 4].ga = i;

        // 손패 떼기
        this.player[i].sonPai = [];
        for (let j = 0; j < 13; j++) {
            tsumo(this.paiSan, this.player[i].sonPai);
        }

        // 버림패 초기화
        this.player[i].river = [];

        // 운 패 초기화
        this.player[i].cry = [];

        // 초기 상태
        this.player[i].state = [];
    }
    this.turn = this.oya;
    tsumo(this.paiSan, this.player[this.oya].sonPai, this.player[this.oya]);

    /* 도라 까기 */
    this.dora = [];
    tsumo(this.king, this.dora);

    this.queue = [];
}

Mahjong.prototype.nextGame = function (yon) {
    if (yon) {
        this.bon++;
    } else {
        this.guk++;
        this.oya = (this.oya + 1) % 4;
    }
}

Mahjong.prototype.showState = function () {
    console.log('플레이어:');
    console.log(this.player.map(function (obj) {
        let ret = '';
        ret += GA(obj.ga) + ' : ';
        ret += '점수 < ' + obj.score + ' > ';
        ret += '[ ' + obj.sonPai + ' ] ';
        ret += '운패 [ ' + obj.cry.map(function (obj) {
            return '' + obj.pai + '-' + obj.from;
        }) + ' ] ';
        ret += '상태 [ ' + obj.state + ' ] ';
        ret += '버림패 [ ' + obj.river.map(function (obj) {
            let pai = '' + obj.pai;
            if (obj.tsumo) pai += '*';
            if (obj.take) pai += '/';
            return pai;
        }) + ' ] ';
        return ret
    }));
    console.log(GA(parseInt(this.guk / 4)), this.guk % 4 + 1, '국',
        this.bon, '본장');
    console.log('오야:', this.oya, '차례:', this.turn);
    console.log('남은패:', this.paiSan.length,
        '패산:', this.paiSan.join());
    console.log('왕패:', this.king,
        '도라:', this.dora);
    console.log('큐:', this.queue.map(function (obj) {
        return obj;
    }));
    console.log();
}

Mahjong.prototype.doAction = function (a) {
    console.log(a);

    switch (a.action) {
        case 'giri': {
            let player = this.player[a.player];

            // 기리 가능한 상태인지
            if (!(player.state.includes('tsumo') ||
                player.state.includes('cry'))) {
                console.log('**기리 불가능 상태**');
                return false;
            }

            // 방금 운 패는 못 버림
            if (player.state.includes('cry') &&
                a.pai == player.cry[player.cry.length - 1].pai[2]) {
                console.log('**방금 운 패는 못 버림**');
                return false;
            }

            // 기리 성공 여부 확인
            if (!giri(player, a.pai, a.tsumo)) {
                return false;
            }

            this.player[this.turn].state = [];

            // 특수 행동 가능한 사람이 있는지 체크
            let flag = false;
            for (let i = 1; i < 4; i++) {
                let j = (this.turn + i) % 4

                this.player[j].state = [];

                if (i == 1 && checkChi(this.player[j].sonPai, a.pai)) {
                    this.player[j].state.push('chi');
                    flag = true;
                }

                if (checkPong(this.player[j].sonPai, a.pai)) {
                    this.player[j].state.push('pong');
                    flag = true;
                }

                if (checkKang(this.player[j].sonPai, a.pai)) {
                    this.player[j].state.push('kang');
                    flag = true;
                }

                if (checkRon(this.player[j], a.pai)) {
                    this.player[j].state.push('ron');
                    flag = true;
                }
            }
            this.queue = [];
            // 없으면 다음 턴으로
            if (!flag) {
                this.turn = (this.turn + 1) % 4
                tsumo(this.paiSan, this.player[this.turn].sonPai, this.player[this.turn]);
            }

            return true;
        }
        case 'chi': {
            let player = this.player[a.player];
            let sonPai = player.sonPai;
            let river = this.player[this.turn].river;
            let wantPai = river[river.length - 1];
            let cry = player.cry;

            // 유효성 체크
            if (!player.state.includes('chi')) {
                console.log('**치 가능한 상태 아님**');
                return false;
            }
            if (a.pai.length != 2) {
                console.log('**치는 2개의 패가 전달되야 함**');
                return false;
            }
            if (!(sonPai.includes(a.pai[0]) && sonPai.includes(a.pai[1]))) {
                console.log('**손패에 없음**');
                return false;
            }
            if (wantPai == undefined) {
                console.log('**가져갈 버림패 없음**');
                return false;
            }
            if (!checkChi(a.pai, wantPai.pai)) {
                console.log('**치 불가능**');
                return false;
            }

            player.state = [];
            a.wantPai = wantPai;
            this.queue.push(a);

            // 퐁 깡 론이 있으면 큐에 넣고 대기
            if (hasToWait(this.player, ['pong', 'kang', 'ron'])) {
                return true;
            }

            // 아니면 진행
            this.processQueue();
            return true;
        }
        case 'pong': {
            let player = this.player[a.player];
            let river = this.player[this.turn].river;
            let wantPai = river[river.length - 1];

            // 유효성 체크
            if (!player.state.includes('pong')) {
                console.log('**퐁 가능한 상태 아님**');
                return false;
            }
            if (wantPai == undefined) {
                console.log('**가져갈 버림패 없음**');
                return false;
            }
            if (!checkPong(player.sonPai, wantPai.pai)) {
                console.log('**퐁 불가능**');
                return false;
            }

            player.state = [];
            a.wantPai = wantPai;
            a.pai = [];
            a.pai.push(wantPai.pai);
            a.pai.push(wantPai.pai);
            this.queue.push(a);

            // 론이 있으면 큐에 넣고 대기
            if (hasToWait(this.player, ['ron'])) {
                return true;
            }

            // 아니면 진행
            this.processQueue();
            return true;
        }
        case 'kang': {
            let player = this.player[a.player];
            let river = this.player[this.turn].river;
            let wantPai = river[river.length - 1];

            // 유효성 체크
            if (!player.state.includes('kang')) {
                console.log('**깡 가능한 상태 아님**');
                return false;
            }
            if (wantPai == undefined) {
                console.log('**가져갈 버림패 없음**');
                return false;
            }
            if (!checkKang(player.sonPai, wantPai.pai)) {
                console.log('**깡 불가능**');
                return false;
            }

            // 사깡즈
            if (this.dora.length == 4) {
                console.log('**사깡즈**');
                return false;
            }

            player.state = [];
            a.wantPai = wantPai;
            a.pai = [];
            a.pai.push(wantPai.pai);
            a.pai.push(wantPai.pai);
            a.pai.push(wantPai.pai);
            this.queue.push(a);

            // 론이 있으면 큐에 넣고 대기
            if (hasToWait(this.player, ['ron'])) {
                return true;
            }

            // 아니면 진행
            this.processQueue();
            return true;
        }
        case 'ron':
            return true;

        case 'tsumo':
            return true;

        case 'rich':
            return true;

        case 'cancel': {
            this.player[a.player].state = [];
            if (hasToWait(this.player, ['chi', 'pong', 'kang', 'ron'])) {
                return true;
            }
            this.processQueue();
            return true;
        }
    }
}

Mahjong.prototype.processQueue = function () {
    this.player.forEach(function(obj) {
        obj.state = [];
    });

    /* 아무 행동도 없음 */
    if (this.queue.length == 0) {
        this.turn = (this.turn + 1) % 4
        tsumo(this.paiSan, this.player[this.turn].sonPai, this.player[this.turn]);
        this.queue = [];
        return;
    }

    let kang = this.queue.filter(function (obj) {
        if (obj.action == 'kang') return true;
        return false;
    });
    let pong = this.queue.filter(function (obj) {
        if (obj.action == 'pong') return true;
        return false;
    });
    let chi = this.queue.filter(function (obj) {
        if (obj.action == 'chi') return true;
        return false;
    });

    let sonPai;
    let wantPai;

    /* 깡 */
    if (kang.length != 0) {
        kang = kang[0];

        sonPai = this.player[kang.player].sonPai;
        wantPai = kang.wantPai;

        cry(this.player[kang.player], kang.pai, wantPai, this.turn);
        this.turn = kang.player;

        // 영상패 쯔모
        tsumo(this.paiSan, this.player[kang.player].sonPai, this.player[kang.player]);
        // 도라 추가
        tsumo(this.king, this.dora);

    /* 퐁 */
    } else if (pong.length != 0) {
        pong = pong[0];

        sonPai = this.player[pong.player].sonPai;
        wantPai = pong.wantPai;

        cry(this.player[pong.player], pong.pai, wantPai, this.turn);
        this.turn = pong.player;

    /* 치 */
    } else if (chi.length != 0) {
        chi = chi[0];

        sonPai = this.player[chi.player].sonPai;
        wantPai = chi.wantPai;

        cry(this.player[chi.player], chi.pai, chi.wantPai, this.turn);
        this.turn = chi.player;
    }

    this.queue = [];
    return;
}

let cry = function (player, pai, wantPai, from) {
    let sonPai = player.sonPai;

    // 버림패에 표시
    wantPai.take = true;

    // 손패에서 제거
    pai.forEach(function(p) {
        sonPai.splice(sonPai.indexOf(p), 1);
    });

    // 운패에 추가
    let tmp = {}
    tmp.pai = pai;
    tmp.pai.push(wantPai.pai);
    tmp.from = from;
    player.cry.push(tmp);

    // 상태 갱신
    player.state.push('cry');
}

let tsumo = function (from, to, player) {
    to.push(from.pop());
    if (player) player.state.push('tsumo');
}

let giri = function (player, pai, tsumo) {
    let sonPai = player.sonPai;
    let river = player.river;

    // 패 유효성 검사
    if (tsumo && (sonPai[sonPai.length - 1] != pai)) {
        console.log('**쯔모 패가 아님 1**');
        return false;
    }
    if ((sonPai.indexOf(pai) == sonPai.length - 1) && !tsumo &&
    player.state.includes('tsumo')) {
        console.log('**쯔모 패가 아님 2**');
        return false;
    }

    if (sonPai.indexOf(pai) != -1) {
        sonPai.splice(sonPai.indexOf(pai), 1);
        river.push({ pai: pai, tsumo: tsumo });
        return true;
    }
    console.log('**손패에 없음**');
    return false;
}

let checkChi = function (sonPai, pai) {
    // 자패면 패스
    if (parseInt(pai / 10) == 4) {
        return false;
    }

    // 1번 케이스
    if (sonPai.includes(pai - 2) && sonPai.includes(pai - 1)) {
        return true;
    }
    // 2번 케이스
    if (sonPai.includes(pai - 1) && sonPai.includes(pai + 1)) {
        return true;
    }
    // 3번 케이스
    if (sonPai.includes(pai + 1) && sonPai.includes(pai + 2)) {
        return true;
    }

    return false;
}

let checkPong = function (sonPai, pai) {
    let count = 0;
    sonPai.forEach(function (p) {
        if (p == pai) count++;
    });
    // 2개 이상
    if (count >= 2) return true;

    return false;
}

let checkKang = function (sonPai, pai) {
    let count = 0;
    sonPai.forEach(function (p) {
        if (p == pai) count++;
    });
    // 3개 이상
    if (count >= 3) return true;

    return false;
}

let checkRon = function (player, pai) {
    return false;
}

let hasToWait = function (players, states) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < states.length; j++) {
            if (players[i].state.includes(states[j])) {
                return true;
            }
        }
    }
    return false;
}

function GA(ga) {
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

function PAI(pai) {
    /* 11 -> 1통 */
    if (typeof pai == 'number') {
        switch (parseInt(pai / 10)) {
            case 1: return '' + (pai % 4) + 'man';
            case 2: return '' + (pai % 4) + 'ton';
            case 3: return '' + (pai % 4) + 'sak';
            case 4:
                switch (pai % 10) {
                    case 1: return 'dong';
                    case 2: return 'nam';
                    case 3: return 'seo';
                    case 4: return 'buk';
                    case 5: return 'bak';
                    case 6: return 'val';
                    case 7: return 'chu';
                }
        }

        /* 1통 -> 11 */
    } else {
    }
}