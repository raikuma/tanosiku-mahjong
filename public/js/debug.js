let mj;
let socket;

$(function () {
    let con = $('#player');
    for (let i = 0; i < 4; i++) {
        con.append(
            '<div id="player' + i + '">' +
            '<p id="pinfo' + i + '"></p>' +
            '<div id="pai' + i + '"></div>' +
            '<div id="river' + i + '"></div>' +
            '<div id="cry' + i + '"></div>' +
            '</div>'
        );
    }

    socket = io('/debug');
    console.log('debug start');

    socket.on('mj', function (_mj) {
        console.log(_mj);
        mj = _mj;

        refreshInfo();
        setTrigger();
    })
})

function doAction(a) {
    console.log(a);
    socket.emit('action', a);
}

function setTrigger() {
    for (let i = 0; i < 4; i++) {
        let player = mj.players[i];

        // 기리
        $('#pai'+i+' img').click(function() {
            let a = {
                player: i,
                action: 'giri',
                pai: {num:parseInt(this.alt), tsumo:false}
            };
            if ((' '+this.className+' ').indexOf(' tsumo ') != -1) {
                a.pai.tsumo = true;
            }
            doAction(a);
        })

        // 버튼
        if (player.state.includes('chi')) {
            $('#pinfo'+i).append('<button id="chi'+i+'">치</button>');
            $('#chi'+i).click({i:i}, function(event) {
                let i = event.data.i;
                let river = mj.players[mj.info.turn].river;
                let wantPai = river[river.length-1];
                console.log(checkChi(mj.players[i].sonPai, wantPai))
            });
        }
    }
}

function refreshInfo() {
    let info = mj.info;

    $('#info').text(
        GA(parseInt(info.guk / 4)) + (info.guk % 4 + 1) + '국 ' + info.bon + '본장' +
        ' 오야: ' + info.oya + ' 차례: ' + info.turn +
        ' 남은패: ' + mj.lastPai
    )

    let html = '<span>도라: </span>';
    mj.dora.forEach(function (pai) {
        html += IMG(pai);
    });

    $('#dora').html(html);
    for (let i = 0; i < 4; i++) {
        let player = mj.players[i];

        $('#pinfo' + i).text(
            '<플레이어' + i + '> 점수: ' + player.score +
            ' [' + player.state + ']'
        );

        let html = '';
        let tsumoPai = player.sonPai.filter(function(pai) {
            if (pai.tsumo == true) return true;
            return false;
        });
        if (tsumoPai.length != 0) {
            player.sonPai.splice(player.sonPai.indexOf(tsumoPai), 1);
        }
        player.sonPai.sort(function(A, B) {
            return (A.num - B.num)
        });
        player.sonPai.forEach(function (pai) {
            html += IMG(pai);
        })
        if (tsumoPai.length != 0) {
            html += '<span> </span>';
            html += IMG(tsumoPai[0], 'tsumo');
        }
        $('#pai' + i).html(html);

        html = '<span>운패: </span>';
        player.cry.forEach(function (cry) {
            let from = (i - cry.from + 4) % 4 - 1;
            let tmp = cry.pais.pop();
            cry.pais.splice(from, 0, tmp);
            for (let j = 0; j < cry.pais.length; j++) {
                if (j == from) {
                    html += IMG(cry.pais[j], 'rotate1');
                } else {
                    html += IMG(cry.pais[j]);
                }
            }
        });
        $('#cry' + i).html(html);

        html = '<span>버림패: </span>';
        player.river.forEach(function (pai) {
            if (!pai.take) {
                if (pai.rich) {

                } else {

                }
                html += IMG(pai);
            }
        })
        $('#river' + i).html(html);
    }
}

function IMG(pai, cls) {
    let ret = '<img src=image/pai/' + pai.num + '.gif alt="' + pai.num + '" ';
    if (cls) {
        ret += 'class=' + cls;
    }
    ret += '>'
    return ret;
}

function checkChi (sonPai, pai) {
    let n = pai.num

    let pais = [
        {num: n-2, tsumo: false},
        {num: n-1, tsumo: false},
        {num: n+1, tsumo: false},
        {num: n+2, tsumo: false}
    ]
    let ret = [];

    for (let i = 0; i < 4; i++) {
        if (paiHave(sonPai, pais[i]) &&
        paiHave(sonPai, pais[i+1])) {
            return true;
        }
    }

    return false;
}

/**
 * 같은 패 여부
 */
let paiEqual = function(pai1, pai2, numOnly) {
    if (pai1.num != pai2.num) return false;
    if ((pai1.tsumo != pai2.tsumo) && !numOnly) return false;
    return true;
}

/**
 * 패 포함 여부
 */
function paiFind(arr, pai, numOnly) {
    return arr.filter(function(p) {
        if (paiEqual(p, pai, numOnly)) return true;
        return false;
    })
}
function paiHave(sonPai, pai) {
    if (paiFind(sonPai, pai).length != 0) return true;
    return false;
}

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
        switch (parseInt(pai / 10)) {
            case 1: return '' + (pai % 4) + 'man';
            case 2: return '' + (pai % 4) + 'ton';
            case 3: return '' + (pai % 4) + 'sak';
            case 4:
                switch (pai % 10) {
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