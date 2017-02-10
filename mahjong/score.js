calcPan = function (jocbo) {
    let pan = 0;
    jocbo.forEach(function (j) {
        switch (j) {
            case 'mjtsumo':
            case 'rich':
            case 'ilbal':
            case 'pinghu':
            case 'ipeco':
            case 'dongsun_':
            case 'ilgi_':
            case 'chanta_':
            case 'bak':
            case 'bal':
            case 'chu':
            case 'japung':
            case 'jangpung':
            case 'tang':
            case 'youngsang':
            case 'rowall':
            case 'rower':
                pan += 1;
                break;

            case 'dbrich':
            case 'chitoi':
            case 'dongsun':
            case 'ilgi':
            case 'chanta':
            case 'jchanta_':
            case 'hon_':
            case 'yunpung':
            case 'toitoi':
            case 'saman':
            case 'donggak':
            case 'sosam':
            case 'honnodu':
            case 'samkang':
                pan += 2;
                break;

            case 'rypeco':
            case 'jchanta':
            case 'hon':
                pan += 3;
                break;

            case 'chung':
                pan += 6;
                break;

            case 'chunhwa':
            case 'jihwa':
            case 'sanan':
            case 'guksa':
            case 'guryun':
            case 'nok':
            case 'ja':
            case 'deasam':
            case 'sosa':
            case 'deasa':
            case 'sakang':
                pan += 13;
                break;

            case '13guksa':
            case 'sunguryun':
                pan += 26;
                break;
        }
    });
    return pan;
}

calcScore = function (ga, pan, bu, type) {
    /* 부수 계산 */
    if (pan < 3 ||
        (pan == 3 && bu <= 60) ||
        (pan == 4 && bu <= 30)) {
        bu = oneCeil(bu);
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
    }
    /* 판수 계산 */
    else {
        let a;
        if (pan >= 26) {
            // 더블 역만
            a = 16000;
        } else if (pan >= 13) {
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
        let c = [a * 2, a * b, a * b];
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

oneCeil = function (a) {
    return parseInt(Math.ceil(a / 10)) * 10;
}