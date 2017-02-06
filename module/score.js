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