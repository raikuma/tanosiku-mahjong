let mj;
let socket;
let chiPais;

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

    $('#newgame').click(function() {
        socket.emit('newgame');
    })
})

function doAction(a) {
    console.log(a);
    socket.emit('action', a);
}

function chi(pai, player) {
    //console.log(pai, chiPais);
    let leftchiPais = [];
    chiPais.forEach(function(pais) {
        if (pais.includes(pai)) {
            leftchiPais.push(pais);
        }
    })
    // 남은게 하나면 바로 ㄱㄱ
    if (leftchiPais.length == 1) {
        let a = {
            action: 'chi',
            player: player,
            hasPais: leftchiPais[0]
        };
        doAction(a);
    // 없으면 잘못 고른것
    } else if (leftchiPais.length == 0) {
        return
    // 아니면 대기
    } else {
        chiPais = leftchiPais;
    }
}

function setTrigger() {
    //가져올 패가 있는 플레이어의 강
    let river = mj.players[mj.info.turn].river;
    // 가져올 패
    let wantPai = river[river.length-1];

    for (let i = 0; i < 4; i++) {
        let player = mj.players[i];

        // 기리
        if (player.state.includes('tsumo') || player.state.includes('cry')) {
            $('#pai'+i+' img').click(function() {
                let a = {
                    action: 'giri',
                    player: i,
                    pai: parseInt(this.alt)
                };
                if ((' '+this.className+' ').indexOf(' tsumo ') != -1) {
                    a.tsumo = true;
                }
                doAction(a);
            })
        }

        // 캔슬 플래그
        let flag = false;
        // 론
        if (player.state.includes('ron')) {
            flag = true;
            $('#pinfo'+i).append('<button id="ron'+i+'">론</button>');
            $('#ron'+i).click(function(event) {
                let a = {
                    action: 'ron',
                    player: i
                };
                doAction(a)
            });
        }

        // 치
        if (player.state.includes('chi')) {
            flag = true;
            $('#pinfo'+i).append('<button id="chi'+i+'">치</button>');
            $('#chi'+i).click(function(event) {
                chiPais = checkChi(player.sonPai, wantPai.pai);
                //console.log(chiPais);
                // 가능한 경우가 하나면 바로 치
                if (chiPais.length == 1) {
                    let a = {
                        action: 'chi',
                        player: i,
                        hasPais: chiPais[0]
                    };
                    doAction(a);
                    return;
                }

                // 아니면 버튼등록
                $('#pai'+i+' img').click(function() {chi(parseInt(this.alt), i)});
            });
        }

        // 퐁
        if (player.state.includes('pong')) {
            flag = true;
            $('#pinfo'+i).append('<button id="pong'+i+'">퐁</button>');
            $('#pong'+i).click(function() {
                let a = {
                    action: 'pong',
                    player: i
                };
                doAction(a);
            });
        }

        // 깡
        if (player.state.includes('kang')) {
            flag = true;
            $('#pinfo'+i).append('<button id="kang'+i+'">깡</button>');
            $('#kang'+i).click(function() {
                let a = {
                    action: 'kang',
                    player: i
                };
                doAction(a);
            });
        }

        // 안깡
        if (player.state.includes('ankang')) {
            flag = true;
            $('#pinfo'+i).append('<button id="ankang'+i+'">안깡</button>');
            $('#ankang'+i).click(function() {
                let a = {
                    action: 'ankang',
                    player: i
                };
                doAction(a);
            });
        }

        // 캔슬
        if (flag == true) {
            $('#pinfo'+i).append('<button id="cancel'+i+'">캔슬</button>');
            $('#cancel'+i).click(function() {
                let a = {
                    action: 'cancel',
                    player: i
                };
                doAction(a);
            })
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
        player.sonPai.sort();
        player.sonPai.forEach(function (pai) {
            html += IMG(pai);
        })
        if (player.tsumoPai != null) {
            html += '<span> </span>';
            html += IMG(player.tsumoPai, 'tsumo');
        }
        $('#pai' + i).html(html);

        html = '<span>운패: </span>';
        player.cry.forEach(function (cry) {
            let from = (i - cry.from + 4) % 4 - 1;
            if (cry.pais.length == 4 && from == 2) {
                from = 3;
            }
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
        player.river.forEach(function (expai) {
            if (!expai.take) {
                if (expai.rich) {

                } else {

                }
                html += IMG(expai.pai);
            }
        })
        $('#river' + i).html(html);
    }
}

function IMG(pai, cls) {
    let ret = '<img src=image/pai/' + pai + '.gif alt="' + pai + '" ';
    if (cls) {
        ret += 'class=' + cls;
    }
    ret += '>'
    return ret;
}

let checkChi = function (sonPai, pai) {
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