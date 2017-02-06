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
checkAnkang = function (pais) {
    kangPais = [];
    while (pais.length != 0) {
        let pai = pais.pop();
        let cnt = 1;
        while (pais.indexOf(pai) != -1) {
            pais.splice(pais.indexOf(pai), 1)
            cnt++;
        }
        if (cnt == 4) kangPais.push(pai);
    }
    return kangPais;
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

/** 족보체크 */
checkJocbo = function (info, player, pai, dragon) {
    let jocbo = [];
    let flag;       // 다목적 플래그

    let sonPai = player.sonPai;                 // 손패
    let pais = sonPai.concat(pai);              // 완성된 손패
    let chunk = dragon.deepCopy();              // 완성된 모양
    player.cry.forEach(function (cry) {
        pais = pais.concat(cry.pais);
        chunk.push(cry.pais);
    });

    let paiColor = getPaiColor(pais);
    let paiInfo = getPaiInfo(chunk, pai);

    //----------------- 역만 체크
    /* 멘젠 한정 */
    if (player.menjen) {
        // 천화, 지화
        if (info.lastPai == 69 &&
            player.state.includes('tsumo') &&
            player.first == true) {
            // 천화
            jocbo.push('chunhwa');

        } else if (player.state.includes('tsumo') &&
            player.first == true) {
            // 지화
            jocbo.push('jihwa');
        }
        // 사안커
        if (paiInfo.cut == 4) {
            if (player.state.includes('tsumo') ||
                paiInfo.type.includes('short')) {
                jocbo.push('sanan');
            }
        }
        // 국사무쌍
        let gukPai = [11, 19, 21, 29, 31, 39, 41, 42, 43, 44, 45, 46, 47];
        gukPai.forEach(function (pai) {
            if (deepEqual(pais, gukPai.concat(pai))) {
                let j = 'guksa';
                // 13면
                if (deepEqual(sonPai, gukPai)) {
                    j = '13' + j;
                }
                jocbo.push(j);
            }
        });
        // 구련보등
        let guPai = [11, 11, 11, 12, 13, 14, 15, 16, 17, 18, 19, 19, 19];
        guPai.forEach(function (pai) {
            if (deepEqual(pais, guPai.concat(pai))) {
                let j = 'guryun';
                if (deepEqual(sonPai, guPai)) {
                    j = 'sun' + j;
                }
                jocbo.push(j);
            }
        });
    }
    /* 멘젠 비한정 */
    // 녹일색
    let nokPai = [32, 33, 34, 36, 38, 46];
    flag = true;
    for (let i = 0; i < pais.length; i++) {
        if (!nokPai.includes(pais[i])) {
            flag = false;
            break;
        }
    }
    if (flag) jocbo.push('nok');
    // 자일색
    if (paiColor == 'ja') {
        jocbo.push('ja')
    }
    // 대삼원 - 책임지불
    if (
        (chunk.deepInclude([45, 45, 45]) || chunk.deepInclude([45, 45, 45, 45])) &&
        (chunk.deepInclude([46, 46, 46]) || chunk.deepInclude([46, 46, 46, 46])) &&
        (chunk.deepInclude([47, 47, 47]) || chunk.deepInclude([47, 47, 47, 47]))
    ) {
        jocbo.push('deasam');
    }
    // 소사희, 대사희
    flag = false;
    let soPai = [41, 42, 43, 44];
    for (let i = 0; i < soPai.length; i++) {
        let pai = soPai[i];
        let left = soPai.deepCopy();
        left.remove(pai);

        if (
            (chunk.deepInclude([left[0], left[0], left[0]]) || chunk.deepInclude([left[0], left[0], left[0], left[0]])) &&
            (chunk.deepInclude([left[1], left[1], left[1]]) || chunk.deepInclude([left[1], left[1], left[1], left[1]])) &&
            (chunk.deepInclude([left[2], left[2], left[2]]) || chunk.deepInclude([left[2], left[2], left[2], left[2]]))
        ) {
            // 소사희
            if (chunk.deepInclude([pai, pai])) {
                jocbo.push('sosa');
                break;
                // 대사희
            } else if (chunk.deepInclude([pai, pai]) || chunk.deepInclude([pai, pai, pai])) {
                jocbo.push('deasa');
                break;
            }
        }
    }
    // 사깡즈 - 책임지불
    // 역만이면 그 이하 역과는 중복이 안된다
    if (jocbo.length != 0) {
        console.log('chunk: ', chunk);
        console.log('jocbo: ', jocbo);
        return jocbo;
    }

    //----------------- 특수 만관
    // 인화
    // 유국만관

    //----------------- 일반 족보
    /* 멘젠 한정 */
    if (player.menjen == true) {
        //-- 1 --//
        // 멘젠쯔모
        if (player.state.includes('tsumo')) {
            jocbo.push('mjtsumo');
        }
        // 리치
        if (player.rich == true) {
            jocbo.push('rich');
        }
        // 일발
        if (player.ilbal == true) {
            jocbo.push('ilbal');
        }
        // 핑후
        flag = true;
        let head = 0;
        let cant = [player.ga, parseInt(info.guk / 4), 45, 46, 47];
        chunk.forEach(function (c) {
            if (c.length == 2) {
                head = c[0];
            }
        });
        if (paiInfo.shun == 4 &&
            paiInfo.type.includes('both') &&
            !cant.includes(head)
        ) {
            jobco.push('pinghu');
        }
        // 이페코
        let tc = chunk.deepCopy();
        let cnt = 0;
        while (tc.length != 0) {
            let tmp = tc.pop();
            if (tc.deepInclude(tmp)) {
                cnt++;
            }
        }
        if (cnt == 1) {
            // 이페코
            jocbo.push('ipeco');
        } else if (cnt == 2) {
            //-- 3 --//
            // 량페코
            jocbo.push('rypeco');
        }

        //-- 2 --//
        // 더블리치
        if (player.dbrich == true) {
            jocbo.push('dbrich');
        }
        // 칠대자
        let chitoi = [];
        checkChiToi(pais.deepCopy(), [], chitoi);
        if (chitoi.length != 0) {
            jocbo.push('chitoi');
        }
    }

    /* 멘젠 준한정 */
    //-- 2 --//
    // 삼색동순
    for (let i = 1; i <= 7; i++) {
        let flag = true;
        for (let j = 1; j <= 3; j++) {
            let pais = [j * 10 + i, j * 10 + i + 1, j * 10 + i + 2];
            if (!chunk.deepInclude(pais)) {
                flag = false;
                break;
            }
        }
        if (flag == true) {
            jocbo.push('dongsun');
            break;
        }
    }
    // 일기통관
    for (let i = 1; i <= 3; i++) {
        let flag = true;
        for (let j = 0; j < 3; j++) {
            let pais = [i * 10 + j * 3 + 1, i * 10 + j * 3 + 2, i * 10 + j * 3 + 3];
            if (!chunk.deepInclude(pais)) {
                flag = false;
                break;
            }
        }
        if (flag == true) {
            jocbo.push('ilgi');
            break;
        }
    }
    // 찬타
    flag = true;
    for (let i = 0; i < chunk.length; i++) {
        let f = false;
        for (let j = 0; j < chunk[i].length; j++) {
            if (isYogu(chunk[i][j])) {
                f = true;
                break;
            }
        }
        if (f == false) {
            flag = false;
            break;
        }
    }
    if (flag == true) {
        jocbo.push('chanta');
    }

    //-- 3 --//
    // 준찬타
    flag = true;
    for (let i = 0; i < chunk.length; i++) {
        let f = false;
        for (let j = 0; j < chunk[i].length; j++) {
            if (isNodu(chunk[i][j])) {
                f = true;
                break;
            }
        }
        if (f == false) {
            flag = false;
            break;
        }
    }
    if (flag == true) {
        jocbo.push('jchanta');
    }
    // 혼일색
    if (paiColor == 'hon') {
        jocbo.push('hon');
    }

    /* 멘젠 비한정 */
    //-- 1 --//
    // 삼원패 백 발 중
    if (chunk.deepInclude([45, 45, 45]) || chunk.deepInclude([45, 45, 45, 45])) {
        jocbo.push('bak');
    }
    if (chunk.deepInclude([46, 46, 46]) || chunk.deepInclude([46, 46, 46, 46])) {
        jocbo.push('bal');
    }
    if (chunk.deepInclude([47, 47, 47]) || chunk.deepInclude([47, 47, 47, 47])) {
        jocbo.push('chu');
    }
    // 자풍패 동 남 서 북
    {
        let pai = 41 + player.ga;
        if (chunk.deepInclude([pai, pai, pai]) || chunk.deepInclude([pai, pai, pai, pai])) {
            jocbo.push('japung')
        }
    }
    // 장풍패 - 현재 국의 바람패
    {
        let pai = 41 + (info.guk % 4);
        if (chunk.deepInclude([pai, pai, pai]) || chunk.deepInclude([pai, pai, pai, pai])) {
            jocbo.push('jangpung')
        }
    }
    // 연풍패
    if (jocbo.includes('japung') && jocbo.includes('jangpung') &&
        player.ga == (info.guk % 4)) {
        jocbo.removes('japung', 'jangpung');
        jocbo.push('yunpung');
    }
    // 탕야오
    flag = true;
    for (let i = 0; i < pais.length; i++) {
        if (isYogu(pais[i])) {
            flag = false;
            break;
        }
    }
    if (flag) {
        jocbo.push('tang');
    }
    // 영상개화
    if (player.state.includes('kingtsumo')) {
        jocbo.push('youngsang');
    }
    // 챵깡
    if (info.lastPai == 0) {
        if (player.state.includes('tsumo')) {
            // 해저로월 - 마지막 패로 쯔모
            jocbo.push('rowall');
        } else {
            // 하저로어 - 마지막 패로 론
            jocbo.push('rower');
        }
    }

    //-- 2 --//
    // 또이또이
    if (paiInfo.cut == 4) {
        jocbo.push('toitoi');
    }
    // 삼안커
    let sanInfo = getPaiInfo(dragon);
    if (sanInfo.cut == 3) {
        
    }
    // 삼색동각
    for (let i = 1; i <= 9; i++) {
        flag = true;
        for (let j = 1; j <= 3; j++) {
            let pais = [j * 10 + i, j * 10 + i, j * 10 + i];
            let pais2 = [j * 10 + i, j * 10 + i, j * 10 + i, j * 10 + i];
            if (!(chunk.deepInclude(pais) || chunk.deepInclude(pais2))) {
                flag = false;
                break;
            }
        }
        if (flag == true) {
            jocbo.push('donggak');
        }
    }
    // 소삼원
    flag = false;
    let samPai = [45, 46, 47];
    for (let i = 0; i < samPai.length; i++) {
        let pai = samPai[i];
        let left = samPai.deepCopy();
        left.remove(pai);

        if (
            (chunk.deepInclude([left[0], left[0], left[0]]) || chunk.deepInclude([left[0], left[0], left[0], left[0]])) &&
            (chunk.deepInclude([left[1], left[1], left[1]]) || chunk.deepInclude([left[1], left[1], left[1], left[1]])) &&
            (chunk.deepInclude([left[2], left[2], left[2]]) || chunk.deepInclude([left[2], left[2], left[2], left[2]]))
        ) {
            if (chunk.deepInclude([pai, pai])) {
                jocbo.push('sosam');
                break;
            }
        }
    }
    // 혼노두
    flag = true;
    for (let i = 0; i < pais.length; i++) {
        if (!isYogu(pais[i])) {
            flag = false;
            break;
        }
    }
    if (flag == true) {
        jocbo.push('honnodu');
    }
    // 삼깡즈
    let kangcnt = 0;
    for (let i = 0; i < chunk.length; i++) {
        if (chunk[i].length == 4) {
            kangcnt++;
        }
    }
    if (kangcnt == 3) {
        jocbo.push('samkang');
    }

    //-- 6 --//
    // 청일색
    if (paiColor == 'chung') {
        jocbo.push('chung');
    }

    console.log('chunk: ', chunk);
    console.log('jocbo: ', jocbo);
    return jocbo;
}

// 화료 가능 여부
checkWin = function (info, player, pai) {
    let sonPai = player.sonPai;

    // 화료 가능 모양인가
    let dragon = [];
    checkChunk(sonPai.concat(pai), false, [], dragon);
    if (player.menjen) checkChiToi(sonPai.concat(pai), [], dragon);
    checkGuksa(sonPai.concat(pai), dragon);

    if (dragon.length == 0) {
        return false;
    }

    // 족보가 있는 모양이 있는가
    let jocbo = [];
    let flag = false;
    for (let i = 0; i < dragon.length; i++) {
        jocbo = checkJocbo(info, player, pai, dragon);
        if (jocbo.length != 0) {
            flag = true;
        }
    }

    return flag;
}

// 패 정보
getPaiColor = function (pais) {
    // 각각의 패의 수
    let man = 0;
    let ton = 0;
    let sak = 0;
    let ja = 0;
    pais.forEach(function (pai) {
        let t = parseInt(pai / 10);
        if (t == 1) {
            man++;
        } else if (t == 2) {
            ton++;
        } else if (t == 3) {
            sak++;
        } else {
            ja++;
        }
    });

    if (man + ton + sak == 0) {
        return 'ja';
    } else if (ton + sak + ja == 0 ||
        man + sak + ja == 0 ||
        ton + sak + ja == 0) {
        return 'chung';
    } else if (ton + sak == 0 ||
        man + sak == 0 ||
        man + ton == 0) {
        return 'hon';
    }

    return '';
}

// 패의 개별 정보를 수집한다.
getPaiInfo = function (chunk, pai) {
    let info = {
        shun: 0,        // 슌츠의 갯수
        cut: 0,         // 커츠의 갯수
        type: [],       // 대기 형태 ('both', 'middle', 'side', 'shabo', 'short')
    };

    // 슌츠와 커츠의 갯수
    chunk.forEach(function (chunk) {
        if (chunk.length == 3) {
            if (chunk[0] == chunk[1]) {
                info.cut++;
            } else {
                info.shun++;
            }
        }
    });

    // 대기형태
    chunk.forEach(function (chunk) {
        if (chunk[0] == pai) {
            if (chunk[1] == pai) {
                // 샤보
                if (chunk.length == 3) {
                    info.type.push('shabo');
                    // 단기
                } else {
                    info.type.push('short');
                }
            } else {
                // 변짱
                if (chunk[2] % 10 == 9) {
                    info.type.push('side');
                }
            }
        } else if (chunk[1] == pai) {
            // 간짱
            info.type.push('middle');
        } else if (chunk[2] == pai) {
            // 변짱
            if (chunk[0] % 10 == 1) {
                info.type.push('side');
            }
        }
    });

    return info;
}

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

isNodu = function (pai) {
    // 1 9
    if (pai % 10 == 1 || pai % 10 == 9) {
        return true;
    }
    // 자패, 중장패
    return false;
}

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