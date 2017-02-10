checkChi = function (sonPai, pai) {
    let chiPais = [];

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

checkPong = function (sonPai, pai) {
    let count = 0;
    sonPai.forEach(function (p) {
        if (p == pai) count++;
    });
    // 2개 이상
    if (count >= 2) return true;

    return false;
}

checkKang = function (sonPai, pai) {
    let count = 0;
    sonPai.forEach(function (p) {
        if (p == pai) count++;
    });
    // 3개 이상
    if (count >= 3) return true;

    return false;
}

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

// 리치 가능 여부
checkRich = function (player) {
    let sonPai = player.sonPai.concat(player.tsumoPai);

    if (!player.menjen) {
        return false;
    }

    let richPai = [];
    let skip = [];
    for (let i = 0; i < sonPai.length; i++) {
        if (skip.includes(sonPai[i])) {
            continue;
        }
        skip.push(sonPai[i]);
        let pais = sonPai.deepCopy();
        pais.remove(sonPai[i]);
        let waitPai = getWaitPai(pais);
        if (waitPai.length != 0) {
            richPai.singlePush(sonPai[i]);
        }
    }

    return richPai;
}

// 텐파이
getWaitPai = function (sonPai) {
    let pais = ALLPAI;
    let waitPai = [];
    pais.forEach(function (pai) {
        let winPais = sonPai.concat(pai);
        let dragons = getDragon(winPais);
        if (dragons.length != 0) {
            waitPai.push(pai);
        }
    });
    return waitPai;
}

getDragon = function (pais) {
    let dragon = [];
    checkChunk(pais.deepCopy(), false, [], dragon);
    checkChiToi(pais.deepCopy(), [], dragon);
    checkGuksa(pais.deepCopy(), dragon);
    return dragon;
}

/** 3-3-3-2 재귀용
 * @param {Array} pais 검사 패 배열
 * @param {Bool} cantHead true: 머리검사 안함
 * @param {Array} chunk 현재까지 모은 형태
 * @param {Array} out 리턴용
 */
checkChunk = function (pais, cantHead, chunk, out) {
    // 남은 패가 없으면 기록 후 종료
    if (pais.length == 0) {
        if (!out.deepInclude(chunk)) {
            out.push(chunk);
        }
        return;
    }

    let skip = [];      // 이미 검사한 패
    let skipChi = [];   // 이미 검사한 슌츠

    for (let i = 0; i < pais.length; i++) {
        if (skip.includes(pais[i])) continue;
        skip.push(pais[i]);

        let pai = pais[i];
        let leftPai = pais.deepCopy();
        let flag = false;
        leftPai.remove(pai);

        // 1번 머리
        if (!cantHead && leftPai.includes(pai)) {
            let lp = leftPai.deepCopy();
            let pc = chunk.deepCopy();
            lp.remove(pai);
            pc.push([pai, pai]);
            checkChunk(lp, true, pc, out);
            flag = true;
        }
        // 2번 커츠
        if (checkPong(leftPai, pai)) {
            let lp = leftPai.deepCopy();
            let pc = chunk.deepCopy();
            lp.removes([pai, pai]);
            pc.push([pai, pai, pai]);
            checkChunk(lp, cantHead, pc, out);
            flag = true;
        }
        // 3번 슌츠
        let chiPais = checkChi(leftPai, pai);
        if (chiPais.length != 0) {
            for (let j = 0; j < chiPais.length; j++) {
                let chiPai = chiPais[j];
                let chiChunk = chiPai.concat(pai); chiChunk.sort();

                if (skipChi.deepInclude(chiChunk)) continue;
                skipChi.push(chiChunk);

                let lp = leftPai.deepCopy();
                let pc = chunk.deepCopy();
                lp.removes(chiPai);
                pc.push(chiChunk);
                checkChunk(lp, cantHead, pc, out);
            }
            flag = true;
        }
        // 아무 쓸모 없는 패가 있음,
        if (flag == false) return;
    }
}

/** 칠대자
 * @param {Array} pais 검사 패 배열 (파괴됨)
 * @param {Array} chunk 현재까지 모은 형태
 * @param {Array} out 리턴용
 */
checkChiToi = function (pais, chunk, out) {
    // 남은 패가 없으면 기록 후 종료
    if (pais.length == 0) {
        out.push(chunk);
        return;
    }

    let pai = pais.pop();
    // 중복되면 치또이 아님
    if (chunk.deepInclude([pai, pai])) {
        return;
    }
    if (pais.includes(pai)) {
        pais.remove(pai);
        chunk.push([pai, pai]);
        checkChiToi(pais, chunk, out);
    }

    return;
}

/** 국사무쌍
 * @param {Array} pais
 * @param {Array} out 리턴용
 */
checkGuksa = function (pais, out) {
    let gukPai = [11, 19, 21, 29, 31, 39, 41, 42, 43, 44, 45, 46, 47];
    gukPai.forEach(function (pai) {
        if (deepEqual(pais, gukPai.concat(pai))) {
            out.push(pais);
            return
        }
    });
}

ALLPAI = [11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 23, 24, 25, 26, 27, 28, 29,
    31, 32, 33, 34, 35, 36, 37, 38, 39,
    41, 42, 43, 44, 45, 46, 47];