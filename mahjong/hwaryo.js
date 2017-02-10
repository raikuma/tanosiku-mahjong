/* 패의 완성 여부 등 승리 조건의 검사 */

// 화료 가능 여부
checkWin = function (info, player, winPai) {
    let sonPai = player.sonPai;

    // 후리텐
    if (player.freeten == true) {
        console.log('**후리텐2**', player.ga);
        return false;
    }
    if (!player.state.includes('tsumo')) {
        let waitPai = getWaitPai(sonPai);
        // console.log('waitPai: ', waitPai);
        for (let i = 0; i < player.river.length; i++) {
            let pai = player.river[i].pai;
            if (waitPai.includes(pai)) {
                console.log('**후리텐1**', player.ga);
                return false;
            }
        }
    }

    // 화료 가능 모양인가
    let dragons = getDragon(player.sonPai.concat(winPai));
    if (dragons.length == 0) {
        return false;
    }

    // 족보가 있는 모양이 있는가
    let jocbo = [];
    let flag = false;
    for (let i = 0; i < dragons.length; i++) {
        let paiInfo = getPaiInfo(info, player, dragons[i], winPai);
        jocbo = getJocbo(info, player, paiInfo);
        if (jocbo.length != 0) {
            flag = true;
            break;
        }
    }

    return flag;
}

/** 족보체크 */
getJocbo = function (info, player, paiInfo) {
    let jocbo = [];
    let flag;       // 다목적 플래그

    let sonPai = player.sonPai;
    // let paiInfo = getPaiInfo(info, player, sonChunks, pai);
    let pais = paiInfo.pais;
    let chunk = paiInfo.chunks;

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
        if (paiInfo.ancut + paiInfo.ankang == 4) {
            jocbo.push('sanan');
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
    if (paiInfo.color == 'nok') {
        jocbo.push('nok');
    }
    // 자일색
    if (paiInfo.color == 'ja') {
        jocbo.push('ja')
    }
    // 대삼원 - 책임지불
    if (
        chunk.deepOrIncludes(cutof(45)) &&
        chunk.deepOrIncludes(cutof(46)) &&
        chunk.deepOrIncludes(cutof(47))
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
            chunk.deepOrIncludes(cutof(left[0])) &&
            chunk.deepOrIncludes(cutof(left[1])) &&
            chunk.deepOrIncludes(cutof(left[2]))
        ) {
            if (chunk.deepInclude([pai, pai])) {
                // 소사희
                jocbo.push('sosa');
                break;
            } else if (chunk.deepOrIncludes(cutof(pai))) {
                // 대사희
                jocbo.push('deasa');
                break;
            }
        }
    }
    // 사깡즈 - 책임지불
    if (paiInfo.kang == 4) {
        jocbo.push('sakang');
    }

    /* 역만이면 그 이하 역과는 중복이 안된다 */
    if (jocbo.length != 0) {
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
        if (paiInfo.shun == 4 &&
            paiInfo.type.includes('both') &&
            paiInfo.sphead == false
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
            jocbo.remove('rich');
            jocbo.push('dbrich');
        }
        // 칠대자
        if (chunk.length == 7) {
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
            if (player.menjen) {
                jocbo.push('dongsun');
            } else {
                jocbo.push('dongsun_');
            }
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
            if (player.menjen) {
                jocbo.push('ilgi');
            } else {
                jocbo.push('ilgi_');
            }
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
        if (plaer.menjen) {
            jocbo.push('chanta');
        } else {
            jocbo.push('chanta_');
        }
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
        if (player.menjen) {
            jocbo.push('jchanta');
        } else {
            jocbo.push('jchanta_');
        }
    }
    // 혼일색
    if (paiInfo.color == 'hon') {
        if (player.menjen) {
            jocbo.push('hon');
        } else {
            jocbo.push('hon_');
        }
    }

    /* 멘젠 비한정 */
    //-- 1 --//
    // 삼원패 백 발 중
    if (chunk.deepOrIncludes(cutof(45))) {
        jocbo.push('bak');
    }
    if (chunk.deepOrIncludes(cutof(46))) {
        jocbo.push('bal');
    }
    if (chunk.deepOrIncludes(cutof(47))) {
        jocbo.push('chu');
    }
    // 자풍패 동 남 서 북
    {
        let pai = 41 + player.ga;
        if (chunk.deepOrIncludes(cutof(pai))) {
            jocbo.push('japung')
        }
    }
    // 장풍패 - 현재 국의 바람패
    {
        let pai = 41 + (info.guk % 4);
        if (chunk.deepOrIncludes(cutof(pai))) {
            jocbo.push('jangpung')
        }
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
    // 해저로월, 하저로어
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
    // 연풍패
    if (jocbo.includes('japung') && jocbo.includes('jangpung') &&
        player.ga == (info.guk % 4)) {
        jocbo.removes('japung', 'jangpung');
        jocbo.push('yunpung');
    }
    // 또이또이
    if (paiInfo.cut + paiInfo.kang == 4) {
        jocbo.push('toitoi');
    }
    // 삼안커
    if (paiInfo.ancut + paiInfo.ankang == 3) {
        jocbo.push('saman')
    }
    // 삼색동각
    for (let i = 1; i <= 9; i++) {
        flag = true;
        for (let j = 1; j <= 3; j++) {
            if (!(chunk.deepOrIncludes(cutof(j * 10 + i)))) {
                flag = false;
                break;
            }
        }
        if (flag == true) {
            jocbo.push('donggak');
            break;
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
            chunk.deepOrIncludes(cutof(45)) &&
            chunk.deepOrIncludes(cutof(46)) &&
            chunk.deepOrIncludes(cutof(47))
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
    if (paiInfo.kang == 3) {
        jocbo.push('samkang');
    }

    //-- 6 --//
    // 청일색
    if (paiInfo.color == 'chung') {
        jocbo.push('chung');
    }

    return jocbo;
}

// 패의 개별 정보를 수집한다.
getPaiInfo = function (info, player, sonChunk, pai) {
    let ret = {
        pais: [],       // 전체 패 배열
        chunks: [],     // 전체 묶음 배열
        color: '',      // 패의 색깔
        shun: 0,        // 슌츠의 갯수
        cut: 0,         // 커츠의 갯수
        kang: 0,        // 깡의 갯수
        mincut: 0,      // 운 커츠
        minkang: 0,     // 운 깡
        ancut: 0,       // 울지 않은 커츠
        ankang: 0,      // 울지 않은 깡
        sphead: false,  // 특수 머리
        type: [],       // 대기 형태 ('both', 'middle', 'side', 'shabo', 'short')
        bu: 20          // 부수
    };

    // 전체 패 배열
    ret.pais = player.sonPai.concat(pai);
    ret.chunks = sonChunk.deepCopy();
    player.cry.forEach(function (cry) {
        ret.pais = ret.pais.concat(cry.pais);
        ret.chunks.push(cry.pais);
    });

    // 패 색깔
    ret.color = getPaiColor(ret.pais);

    // 슌츠와 커츠의 갯수
    let cryAndSonChunk = player.cry.concat(sonChunk);
    cryAndSonChunk.forEach(function (chunk) {
        let bu;
        switch (getChunkType(chunk)) {
            case 'ankang':
                bu = 16;
                ret.ankang++;
                break;
            case 'minkang':
                bu = 8;
                ret.minkang++;
                break;
            case 'ancut':
                bu = 4;
                ret.ancut++;
                break;
            case 'mincut':
                bu = 2;
                ret.mincut++;
                break;
            case 'shun':
                bu = 0;
                ret.shun++;
                break;
            default:
                bu = 0;
        }
        let pai;
        if ('pais' in chunk) {
            pai = chunk.pais[0];
        } else {
            pai = chunk[0];
        }
        if (isYogu(pai)) bu *= 2;
        ret.bu += bu;
    });

    // 대기형태
    sonChunk.forEach(function (chunk) {
        if (chunk[0] == pai) {
            if (chunk[1] == pai) {
                if (chunk.length == 3) {
                    // 샤보
                    ret.type.singlePush('shabo');
                } else {
                    // 단기
                    ret.type.singlePush('short');
                }
            } else {
                if (chunk[2] % 10 == 9) {
                    // 변짱
                    ret.type.singlePush('side');
                } else {
                    // 양면
                    ret.type.singlePush('both');
                }
            }
        } else if (chunk[1] == pai) {
            // 간짱
            ret.type.singlePush('middle');
        } else if (chunk[2] == pai) {
            // 변짱
            if (chunk[0] % 10 == 1) {
                ret.type.singlePush('side');
            } else {
                // 양면
                ret.type.singlePush('both');
            }
        }
    });

    if (ret.type.includes('short') ||
        ret.type.includes('side') ||
        ret.type.includes('middle')) {
        ret.bu += 2;
    }

    // 특수 머리
    for (let i = 0; i < sonChunk.length; i++) {
        if (sonChunk[i].length == 2) {
            let sh = [player.ga, parseInt(info.guk / 4), 45, 46, 47];
            if (sh.includes(sonChunk[i][0])) {
                ret.bu += 2;
                ret.sphead = true;
            }
            if (sh[0] == sh[1]) ret.bu += 2;
            break;
        }
    }

    // 밍커 갯수를 위한 처리
    if (!player.state.includes('tsumo') &&
        ret.type.includes('shabo')) {
        ret.ancut--;
        ret.mincut++;
    }

    // 멘젠론, 쯔모 시 부수 추가
    if (player.menjen && !player.state.includes('tsumo')) {
        ret.bu += 10
    } else if (player.state.includes('tsumo')) {
        ret.bu += 2;
    }

    ret.cut = ret.mincut + ret.ancut;
    ret.kang = ret.minkang + ret.ankang;

    return ret;
}

/** 패 색깔
 * @param {Array} pais 패 배열
 */
getPaiColor = function (pais) {
    // 녹일색
    let nokPai = [32, 33, 34, 36, 38, 46];
    flag = true;
    for (let i = 0; i < pais.length; i++) {
        if (!nokPai.includes(pais[i])) {
            flag = false;
            break;
        }
    }
    if (flag == true) {
        return 'nok';
    }

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
        // 자일색
        return 'ja';
    } else if (ton + sak + ja == 0 ||
        // 청일색
        man + sak + ja == 0 ||
        ton + sak + ja == 0) {
        return 'chung';
    } else if (ton + sak == 0 ||
        // 혼일색
        man + sak == 0 ||
        man + ton == 0) {
        return 'hon';
    }

    return '';
}

/** 몸의 종류를 반환
 * @param {Array} chunk 검사할 패 묶음 또는 운패
 * @return {String} ankang, minkang, ancur, mincut, shun, head
 */
getChunkType = function (chunk) {
    if ('pais' in chunk) {
        let cry = chunk;
        if (cry.pais[0] == cry.pais[1]) {
            if (cry.pais.length == 4) {
                if (!('from' in cry)) {
                    // 안깡
                    return 'ankang';
                } else {
                    // 대명깡, 가깡
                    return 'minkang';
                }
            } else {
                // 밍커
                return 'mincut';
            }
        } else {
            // 슌츠
            return 'shun';
        }
    } else {
        if (chunk.length == 3) {
            if (chunk[0] == chunk[1]) {
                // 안커
                return 'ancut';
            } else {
                // 슌츠
                return 'shun';
            }
        } else if (chunk.length == 2) {
            return 'head';
        }
    }
}

/** 손패의 화료 가능한 모양을 반환 
 * @param {Array} sonPai 플레이어의 손패 배열
 * @param {Pai} winPai 화료패
 */
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