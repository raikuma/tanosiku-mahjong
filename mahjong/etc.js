cutof = function (pai) {
    return [
        [pai, pai, pai],
        [pai, pai, pai, pai]
    ];
}

getDora = function(pai) {
    let t = parseInt(pai/10);
    if (t == 4) {
        if (pai >= 45) {
            pai--;
            if (pai == 44) {
                pai = 47;
            }
        } else {
            pai--;
            if (pai == 40) {
                pai = 44;
            }
        }
    } else {
        pai--;
        if (pai % 10 == 0) {
            pai += 9;
        }
    }
    return pai;
}

ALLPAI = [11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 23, 24, 25, 26, 27, 28, 29,
    31, 32, 33, 34, 35, 36, 37, 38, 39,
    41, 42, 43, 44, 45, 46, 47];

GA = function (ga) {
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

PAI = function (pai) {
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