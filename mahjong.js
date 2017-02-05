require('./module/util');
require('./module/action');
require('./module/check');
require('./module/rich');

require('./module/debug');

/** Mahjong Class
 * @author RaiKuma
 * @class
 * @classdesc 마작 게임 클래스
 * @param {int} initScore 초기 점수
 */
let Mahjong = function (initScore) {
    // 초기 게임 정보
    this.info = { guk: 0, bon: 0, oya: 0 };
    this.paiSan = [];   // 패산
    this.king = [];     // 왕패
    this.players = [];  // 플레이어 정보
    this.queue = [];    // 액션 큐

    /* 점수 초기화 */
    if (!initScore) initScore = 25000;
    for (let i = 0; i < 4; i++) {
        this.players.push({ score: initScore });
    }
};

// 상수
const KINGPAINUM = 14;
const INITSONPAINUM = 13;

/* 판의 초기화 */
Mahjong.prototype.setGame = function () {
    // 세팅 초기화
    this.paiSan = [];
    this.king = [];
    this.dora = [];
    // 편의용 변수 선언
    let info = this.info;
    let paiSan = this.paiSan;
    let oya = this.info.oya;
    let king = this.king;
    let dora = this.dora;
    let players = this.players;

    /* 패산 쌓기 */
    // 각 패가 4개
    for (let k = 0; k < 4; k++) {
        // 만 통 삭
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 9; j++) {
                let pai = i * 10 + j;
                paiSan.splice(Math.random() * paiSan.length, 0, pai);
            }
        }
        // 동 남 서 북 백 발 중
        for (let i = 4, j = 1; j <= 7; j++) {
            let pai = i * 10 + j;
            paiSan.splice(Math.random() * paiSan.length, 0, pai);
        }
    }

    /* 왕패 떼기 */
    for (let i = 0; i < KINGPAINUM; i++) {
        paiSan.popPush(king);
    }
    /* 도라 까기 */
    king.popPush(dora);
    
    /* 플레이어 설정 */
    for (let i = 0; i < 4; i++) {
        let player = players[i];

        player.ga = (i - oya + 4) % 4;
        player.sonPai = [];
        player.tsumoPai = null;
        player.river = [];
        player.cry = [];
        player.state = [];
        player.first = true;
        player.rich = false;
        player.ilbal = false;

        for (let j = 0; j < INITSONPAINUM; j++) {
            paiSan.popPush(player.sonPai);
        }
    }
    info.turn = oya;
    tsumo(paiSan, players[oya].sonPai, true, players[oya], info);
}

/** 
 * 다음 판으로 진행
 * @param {Bool} yon 연장 여부
 */
Mahjong.prototype.nextGame = function (yon) {
    if (yon) {
        this.info.bon++;
    } else {
        this.info.guk++;
        this.info.oya = (this.info.oya + 1) % 4;
    }
}

Mahjong.prototype.doAction = function (a) {
    console.log(a);

    let players = this.players;
    let info = this.info;
    let paiSan = this.paiSan;
    let queue = this.queue;

    // 액션을 실행한 플레이어 위주로 변수를 이용한다
    let player = players[a.player];
    let state = player.state;
    let sonPai = player.sonPai;
    let cry = player.cry

    // 방금 버린 패가 있는 강
    let river = players[info.turn].river;
    // 가져올 패
    let wantPai = river[river.length - 1];

    switch (a.action) {
        /**
         * 패 버리기
         * @param {Action} action giri
         * @param {int} player 버리는 플레이어 넘버
         * @param {Pai} pai 버릴패
         * @param {Bool} tsumo 쯔모패를 버리는지
         * @param {Bool} rich 리치인지
         */
        case 'giri': {
            //let player = this.player[a.player];

            // 기리 가능한 상태인지
            if (!(state.includes('tsumo') ||
                state.includes('cry'))) {
                console.log('**기리 불가능 상태**');
                return false;
            }
            // 방금 운 패는 못 버림
            if (state.includes('cry') &&
                a.pai == cry[cry.length - 1].pais[2]) {
                console.log('**방금 운 패는 못 버림**');
                return false;
            }
            // 가지고 있는지
            if ((!a.tsumo) && (!sonPai.includes(a.pai))) {
                console.log('**손패에 없음**');
                return false;
            }
            if ((a.tsumo) && (player.tsumoPai != a.pai)) {
                console.log('**쯔모패 아님**');
                return false;
            }
            // 리치면 쯔모패만 가능
            if (player.rich && !a.tsumo) {
                console.log('**리치에서 패 변경 불가능**');
                return false;
            }

            // 리치 처리
            if (a.rich) {
                let richPai = checkRich(player);
                //checkRichChunk(player.sonPai.concat(player.tsumoPai), false, [], richPai);
                //console.log(richPai);
                if (richPai.length == 0) {
                    console.log('**리치 불가능**');
                    return false;
                }
                if (!(richPai.includes(a.pai) || richPai.includes(null))) {
                    console.log('**리치 버림패 아님**');
                    return false;
                }
                player.rich = true;
            }

            // 기리
            giri(player, a.pai, a.tsumo, a.rich);

            // 후처리
            player.state = [];

            // 특수 행동 가능한 사람이 있는지 갱신
            let flag = false;
            for (let i = 1; i < 4; i++) {
                // 자신으로 부터 오른쪽으로 돌며 검사
                let j = (info.turn + i) % 4
                let player = players[j];

                player.state = [];

                if (checkWin(info, player, a.pai)) {
                    player.state.push('ron');
                    flag = true;
                }

                // 리치면 치퐁깡 불가능
                if (!player.rich) {
                    if (i == 1 && checkChi(player.sonPai, a.pai).length != 0) {
                        player.state.push('chi');
                        flag = true;
                    }

                    if (checkPong(player.sonPai, a.pai)) {
                        player.state.push('pong');
                        flag = true;
                    }

                    if (checkKang(player.sonPai, a.pai)) {
                        player.state.push('kang');
                        flag = true;
                    }
                }
            }
            // 없으면 다음 턴으로
            if (!flag) {
                this.nextTurn();
                tsumo(paiSan, players[info.turn].sonPai, true, players[info.turn], this.info);
            }
            return true;
        }
        /**
         * 치
         * @param {Action} action chi
         * @param {int} player 치 하는 플레이어 넘버
         * @param {Array} hasPais 가지고 있는 패
         */
        case 'chi': {
            let hasPais = a.hasPais;

            // 유효성 체크
            if (!state.includes('chi')) {
                console.log('**치 가능한 상태 아님**');
                return false;
            }
            if (hasPais.length != 2) {
                console.log('**치는 2개의 패가 전달되야 함**');
                return false;
            }
            if (!(sonPai.includes(a.hasPais[0]) && sonPai.includes(a.hasPais[1]))) {
                console.log('**손패에 없음**');
                return false;
            }
            if (wantPai == undefined) {
                console.log('**가져갈 버림패 없음**');
                return false;
            }
            if (checkChi(hasPais, wantPai.pai).length == 0) {
                console.log('**치 불가능**');
                return false;
            }

            player.state = [];

            // 큐에 넣는다
            a.wantPai = wantPai;
            queue.push(a);

            // 퐁 깡 론이 있으면 대기
            if (hasToWait(players, ['pong', 'kang', 'ron'])) {
                return true;
            }

            // 아니면 진행
            this.processQueue();
            return true;
        }
        /**
         * 퐁
         * @param {Action} action pong
         * @param {int} player 퐁 하는 플레이어 넘버
         */
        case 'pong': {
            // 유효성 체크
            if (!state.includes('pong')) {
                console.log('**퐁 가능한 상태 아님**');
                return false;
            }
            if (wantPai == undefined) {
                console.log('**가져갈 버림패 없음**');
                return false;
            }
            if (!checkPong(sonPai, wantPai.pai)) {
                console.log('**퐁 불가능**');
                return false;
            }

            player.state = [];

            // 큐에 넣는다
            a.hasPais = [wantPai.pai, wantPai.pai];
            a.wantPai = wantPai;
            this.queue.push(a);

            // 론이 있으면 대기
            if (hasToWait(players, ['ron'])) {
                return true;
            }

            // 아니면 진행
            this.processQueue();
            return true;
        }
        /**
         * 깡
         * @param {Action} action kang
         * @param {int} player 깡 하는 플레이어 넘버
         * @param {Array} hasPais 가지고 있는 패
         */
        case 'kang': {
            // 유효성 체크
            if (!state.includes('kang')) {
                console.log('**깡 가능한 상태 아님**');
                return false;
            }
            if (wantPai == undefined) {
                console.log('**가져갈 버림패 없음**');
                return false;
            }
            if (!checkKang(sonPai, wantPai.pai)) {
                console.log('**깡 불가능**');
                return false;
            }

            // 사깡즈
            if (this.dora.length >= 4) {
                console.log('**사깡즈**');
                return false;
            }

            player.state = [];

            // 큐에 넣는다
            a.hasPais = [wantPai.pai, wantPai.pai, wantPai.pai];
            a.wantPai = wantPai;
            queue.push(a);

            // 론이 있으면 대기
            if (hasToWait(players, ['ron'])) {
                return true;
            }

            // 아니면 진행
            this.processQueue();
            return true;
        }
        /**
         * 안깡
         * @param {Action} action ankang
         * @param {int} player 안깡 하는 플레이어 넘버
         */
        case 'ankang': {
            let pai = a.pai;

            // 유효성 체크
            if (!state.includes('tsumo')) {
                console.log('**안깡 가능한 상태 아님**');
                return false;
            }
            let kangPais = checkAnkang(sonPai.concat(player.tsumoPai))
            if (!kangPais.includes(pai)) {
                console.log('**안깡 불가능**');
                return false;
            }

            // 사깡즈
            if (this.dora.length >= 4) {
                console.log('**사깡즈**');
                return false;
            }

            player.state = ['kingtsumo'];
            sonPai.push(player.tsumoPai);

            // 손패에서 제거
            while (sonPai.indexOf(pai) != -1) {
                sonPai.splice(sonPai.indexOf(pai), 1)
            }

            // 운패에 추가
            let hasPais = [pai, pai, pai, pai];
            cry.push({ pais: hasPais });

            // 영상패 쯔모
            tsumo(paiSan, player.sonPai, true, player, this.info);
            // 도라 추가
            tsumo(this.king, this.dora, false);
        }
        case 'ron':
            return true;

        case 'tsumo':
            return true;

        /**
         * 캔슬
         */
        case 'cancel': {
            player.state = [];
            if (hasToWait(players, ['chi', 'pong', 'kang', 'ron'])) {
                return true;
            }
            this.processQueue();
            return true;
        }
    }

    console.log('**없는 명령입니다**');
    return false;
}

/**
 * 큐에서 우선순위가 높은 일부터 처리한다
 */
Mahjong.prototype.processQueue = function () {
    let info = this.info
    let paiSan = this.paiSan
    let players = this.players;
    let queue = this.queue;

    players.forEach(function (player) {
        player.state = [];
    });

    /* 아무 행동도 없음 다음 차례로 */
    if (queue.length == 0) {
        this.nextTurn();
        tsumo(paiSan, players[info.turn].sonPai, true, players[info.turn], this.info);
        return;
    }

    let kang = queue.filter(function (a) {
        if (a.action == 'kang') return true;
        return false;
    });
    let pong = queue.filter(function (a) {
        if (a.action == 'pong') return true;
        return false;
    });
    let chi = queue.filter(function (a) {
        if (a.action == 'chi') return true;
        return false;
    });

    // 이하 필요에 따라 달라지는 변수
    let sonPai;
    let wantPai;
    let player;

    /* 깡 */
    if (kang.length != 0) {
        kang = kang[0];

        player = players[kang.player];
        sonPai = player.sonPai;
        wantPai = kang.wantPai;

        cry(player, info.turn, kang.hasPais, wantPai);
        info.turn = kang.player;

        // 영상패 쯔모
        tsumo(paiSan, player.sonPai, true, player, this.info);
        player.state.push('kingtsumo');
        // 도라 추가
        this.king.popPush(this.dora);

        /* 퐁 */
    } else if (pong.length != 0) {
        pong = pong[0];

        sonPai = players[pong.player].sonPai;
        wantPai = pong.wantPai;

        cry(players[pong.player], info.turn, pong.hasPais, wantPai);
        info.turn = pong.player;

        /* 치 */
    } else if (chi.length != 0) {
        console.log('치')
        chi = chi[0];

        sonPai = players[chi.player].sonPai;
        wantPai = chi.wantPai;

        cry(players[chi.player], info.turn, chi.hasPais, wantPai);
        info.turn = chi.player;
    }

    this.queue = [];
    return;
}

/**
 * 다음 턴으로
 */
Mahjong.prototype.nextTurn = function () {
    let info = this.info;
    let players = this.players;

    info.turn = (info.turn + 1) % 4;
    this.queue = [];
}

module.exports = Mahjong;

/**
 * 다른 플레이어가 해당하는 상태를 가지고 있는지 판단
 * @param {Array} players 플레이어 배열
 * @param {Array} states 기다릴 상태
 */
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

calcScore = function (ga, pan, bu, type) {
    /* 부수 계산 */
    if (pan < 3 ||
        (pan == 3 && bu <= 60) ||
        (pan == 4 && bu <= 30)) {
        let a = bu * Math.pow(2, (pan + 2));
        let b;
        if (ga == GA('DONG')) {
            b = 2;
        } else {
            b = 1;
        }
        let c = [a * 2, a * b, a * b];
        if (type == 'tsumo') {
            return [tenCeil(c[0]), tenCeil(c[1])];
        } else if (type == 'ron') {
            return tenCeil(c[0] + c[1] + c[2])
        }
        /* 판수 계산 */
    } else {
        let a;
        if (pan >= 13) {
            // 역만
            a = 8000;
        } else if (pan >= 11) {
            // 삼배만
            a = 6000;
        } else if (pan >= 8) {
            // 배만
            a = 4000;
        } else if (pan >= 6) {
            // 하네만
            a = 3000;
        } else {
            // 만관
            a = 2000;
        }
        let b;
        if (ga == GA('DONG')) {
            b = 2;
        } else {
            b = 1;
        }
        let c = [a*2, a*b, a*b];
        if (type == 'tsumo') {
            return [c[0], c[1]];
        } else if (type == 'ron') {
            return c[0] + c[1] + c[2];
        }
    }
}

tenCeil = function (a) {
    return parseInt(Math.ceil(a / 100)) * 100;
}