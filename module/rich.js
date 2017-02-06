/** 3-3-3-3-2 리치 가능 여부
 * @param {Array} pais 검사 패 배열
 * @param {Bool} cantHead true: 머리검사 안함
 * @param {Array} chunk 현재까지 모은 형태
 * @param {Array} out 리턴용 (버림패)
 */
checkRichChunk = function(pais, cantHead, chunk, out) {
    // 남은 패가 없으면 아무거나 버려도 됨
    if (pais.length == 0) {
        out.singlePush(null);
        return;
    // 남은 패가 2개일때
    } else if (pais.length == 2) {
        let pai1 = pais[0];
        let pai2 = pais[1];

        // 머리가 아직 없는데 둘이 다르면 둘중 하나
        if (!cantHead) {
            if (pai1 != pai2) {
                out.singlePush(pai1);
                out.singlePush(pai2);
                return;
            }
        }
    } else if (pais.length == 3) {
        for (let i = 0; i < 3; i++) {
            let pai1 = pais[i];
            let pai2 = pais[(i+1)%3];
            let pai3 = pais[(i+2)%3];

            if (isClose(pai1, pai2)) {
                out.singlePush(pai3);
            }
        }
    }

    let skip = [];      // 이미 검사한 패
    let skipChi = [];   // 이미 검사한 슌츠

    for (let i = 0; i < pais.length; i++) {
        if (skip.includes(pais[i])) continue;
        skip.push(pais[i]);

        let pai = pais[i];
        let leftPai = pais.deepCopy();
        leftPai.remove(pai);

        // 1번 머리
        if (!cantHead && leftPai.includes(pai)) {
            let lp = leftPai.deepCopy();
            lp.remove(pai);
            checkRichChunk(lp, true, [], out);
        }
        // 2번 커츠
        if (checkPong(leftPai, pai)) {
            let lp = leftPai.deepCopy();
            lp.removes([pai, pai]);
            checkRichChunk(lp, cantHead, [], out);
        }
        // 3번 슌츠
        let chiPais = checkChi(leftPai, pai);
        if (chiPais.length != 0) {
            for (let j = 0; j < chiPais.length; j++) {
                let chiPai = chiPais[j];
                let chiChunk = chiPai.concat(pai);  chiChunk.sort();

                if (skipChi.deepInclude(chiChunk)) continue;
                skipChi.push(chiChunk);

                let lp = leftPai.deepCopy();
                lp.removes(chiPai);
                checkRichChunk(lp, cantHead, [], out);
            }
        }
    }
}

/** 칠대자 리치
 * @param {Array} pais 검사 패 배열 (파괴됨)
 * @param {Array} chunk 현재까지 모은 형태
 * @param {Array} out 리턴용
 */
checkRichChiToi = function(pais) {
    let flag = true;
    let richPai = [];
    let chunk = [];

    while (pais.length != 0) {
        let pai = pais.pop();
        if (!pais.includes(pai)) {
            if (richPai.length == 2) {
                flag = false;
                break;
            }
            richPai.push(pai);
            continue;
        }
        if (chunk.deepInclude([pai, pai])) {
            flag = false;
            break;
        }
        chunk.push([pai, pai]);
        pais.remove(pai);
    }
    if (flag == false) {
        return [];
    }

    return richPai;
}

/** 리치 국사무쌍
 * @param {Array} pais
 * @param {Array} out 리턴용
 */
checkRichGuksa = function(pais, out) {
    let gukPai = [11, 19, 21, 29, 31, 39, 41, 42, 43, 44, 45, 46, 47];
    
    let cnt = 0;
    for (let i = 0; i < gukPai.length; i++) {
        if (pais.includes(gukPai[i])) {
            pais.remove(gukPai[i]);
            cnt++;
        }
    }
    if (cnt == 12) {
        if (gukPai.includes(pais[0])) {
            out.singlePush(pais[1]);
        } else if (gukPai.include(pais[1])) {
            out.singlePush(pais[0]);
        } else {
            return;
        }
    } else if (cnt == 13) {
        if (gukPai.includes(pais[0])) {
            out.singlePush(null);
        } else {
            out.singlePush(pais[0]);
        }
    }
}

// 리치 가능 여부
checkRich = function (player) {
    let sonPai = player.sonPai;

    if (!player.menjen) {
        return false;
    }

    // 리치 가능 버림패 모으기
    let richPai = [];
    checkRichChunk(sonPai.concat(player.tsumoPai), false, [], richPai);
    let chitoi = checkRichChiToi(sonPai.concat(player.tsumoPai));
    richPai = richPai.concat(chitoi);
    checkRichGuksa(sonPai.concat(player.tsumoPai), richPai);
    if (richPai.length != 0) console.log(richPai);

    return richPai;
}