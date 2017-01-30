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
        switch (parseInt(pai/10)) {
            case 1: return '' + (pai % 4) + 'man';
            case 2: return '' + (pai % 4) + 'ton';
            case 3: return '' + (pai % 4) + 'sak';
            case 4:
                switch (pai%10) {
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
    for (let i = 0; i < 4; i++) {
        this.player[(this.oya + i) % 4].ga = i;
    }
    this.turn = this.oya;

    /* 패산 쌓기 */
    this.paiSan = [];
    // 패가 4개
    for (let k = 0; k < 4; k++) {
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
    }

    /* 왕패 떼기 */
    this.king = [];
    for (let i = 0; i < 14; i++) {
        this.king.push(this.Tsumo());
    }

    /* 손패 초기화 */
    for (let i = 0; i < 4; i++) {
        this.player[i].sonPai = [];
    }
    
    /* 손패 떼기 */
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 13; j++) {
            this.player[i].sonPai.push(this.Tsumo());
        }
    }
    this.player[this.oya].sonPai.push(this.Tsumo());

    /* 도라 까기 */
    this.dora = [];
    this.dora.push(this.king.pop());
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
    console.log('플레이어:\n', this.player);
    console.log(GA(parseInt(this.guk / 4)), this.guk % 4 + 1, '국',
        this.bon, '본장');
    console.log('오야:', this.oya, '차례:', this.turn);
    console.log('남은패:', this.paiSan.length,
                '패산:', this.paiSan.join());
    console.log('왕패:', this.king,
                '도라:', this.dora);
    console.log();
}

Mahjong.prototype.Tsumo = function () {
    this.lastPai--;
    return this.paiSan.pop();
}