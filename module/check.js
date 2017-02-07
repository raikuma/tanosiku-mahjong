/** 치가 가능한 패 배열을 리턴
 * @param {Array} sonPai 손패
 * @param {Pai} pai 가져올 패
 * @returns {Array}
 */
checkChi = function (sonPai, pai) {
    let chiPais = [];

    // 자패면 패스
    if (parseInt(pai / 10) == 4) {
        return chiPais;
    }
    // 1번 케이스
    if (sonPai.includes(pai - 2) && sonPai.includes(pai - 1)) {
        chiPais.push([pai - 2, pai - 1]);
    }
    // 2번 케이스
    if (sonPai.includes(pai - 1) && sonPai.includes(pai + 1)) {
        chiPais.push([pai - 1, pai + 1]);
    }
    // 3번 케이스
    if (sonPai.includes(pai + 1) && sonPai.includes(pai + 2)) {
        chiPais.push([pai + 1, pai + 2]);
    }

    return chiPais;
}

/** 퐁 가능 여부
 * @param {Array} sonPai 손패
 * @param {Pai} pai 가져올 패
 * @returns {Bool}
 */
checkPong = function (sonPai, pai) {
    let count = 0;
    sonPai.forEach(function (p) {
        if (p == pai) count++;
    });
    // 2개 이상
    if (count >= 2) return true;

    return false;
}

/** 깡 가능 여부
 * @param {Array} sonPai 손패
 * @param {Pai} pai 가져올 패
 * @returns {Bool}
 */
checkKang = function (sonPai, pai) {
    let count = 0;
    sonPai.forEach(function (p) {
        if (p == pai) count++;
    });
    // 3개 이상
    if (count >= 3) return true;

    return false;
}

/** 안깡 가능한 패를 리턴
 * @param {Array} sonPai 손패
 * @return {Pai}
 */
checkAnkang = function (player, pais) {
    kangPais = [];
    while (pais.length != 0) {
        let pai = pais.pop();
        let cnt = 1;
        while (pais.indexOf(pai) != -1) {
            pais.splice(pais.indexOf(pai), 1)
            cnt++;
        }
        if (player.rich) {
            let waitPai = getWaitPai(player.sonPai);
            let pais = player.sonPai.concat(player.tsumoPai);
            pais.allRemove(pai);
            let waitPai2 = getWaitPai(pais);
            if (!deepEqual(waitPai, waitPai2)) {
                // 대기패 바뀜
                continue;
            }
        }
        if (cnt == 4) kangPais.push(pai);
    }
    return kangPais;
}

/** 가깡 가능한 패를 리턴
 * @param {Array} crys 운패
 * @param {Array} pais 손패
 */
checkGakang = function (crys, pais) {
    let ret = [];
    pais.forEach(function (pai) {
        crys.forEach(function (cry) {
            if (cry.pais[0] == cry.pais[1] && cry.pais[0] == pai) {
                ret.push(pai);
            }
        });
    });

    return ret;
}

/** 요구패 검사
 * @param {Pai} pai
 */
isYogu = function (pai) {
    // 자패
    if (parseInt(pai / 10) == 4) {
        return true;
    }
    // 1 9
    if (pai % 10 == 1 || pai % 10 == 9) {
        return true;
    }
    // 중장패
    return false;
}

/** 노두패 (1, 9) 검사 
 * @param {Pai} pai
 */
isNodu = function (pai) {
    // 1 9
    if (pai % 10 == 1 || pai % 10 == 9) {
        return true;
    }
    // 자패, 중장패
    return false;
}

/** 유효패 검사
 * @param {Pai} pai1
 * @param {Pai} pai2
 */
isClose = function (pai1, pai2) {
    // 둘이 같으면 커츠
    if (pai1 == pai2) {
        return true;
    }
    // 둘이 가까이 있으면 슌츠
    if (parseInt(pai1 / 10) == 4 ||
        parseInt(pai2 / 10) == 4 ||
        parseInt(pai1 / 10) != parseInt(pai2 / 10)) {
        return false;
    }
    // 차를 보고 대기패를 안다
    let dif = Math.abs(parseInt(pai1 % 10) - parseInt(pai2 % 10));
    if (dif == 2 || dif == 1) {
        return true;
    }
    return false;
}