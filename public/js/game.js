let mj;
let socket;
let chiPais;
let lastPlayer = 0;

$(function () {
    socket = io('/game255');

    socket.on('user', function (people) {
        $('#msg').text('There are ' + people + ' people');
    });

    socket.on('disconnect', function () {
        console.log('Reload...');
        setTimeout(function () {
            window.location.href = '/debug/game';
        }, 1000);
    });

    socket.on('game start', function () {
        console.log('game start');
        setGame();
    });

    socket.on('mj', function (_mj) {
        console.log(_mj);
        if (mj) {
            for (let i = 0; i < 4; i++) {
                if (_mj.river[i].length != mj.river[i].length) {
                    lastPlayer = i;
                    break;
                }
            }
        }
        mj = _mj;
        refreshInfo();
        setTrigger();
    })

    socket.on('pan end', function (winInfo) {
        console.log(winInfo);
        let title = GA(winInfo.player.ga) + '가의 ';
        if (winInfo.type == 'tsumo') {
            title += '쯔모!';
        } else {
            title += '론!';
        }

        let html = '';
        winInfo.player.cry.forEach(function (cry) {
            let from = (winInfo.player.ga + mj.info.guk - cry.from + 4) % 4 - 1;
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
            html += '&nbsp;';
        });

        html += '<p>';
        winInfo.player.sonPai.sort();
        winInfo.player.sonPai.forEach(function (pai) {
            html += IMG(pai);
        })
        html += '&nbsp;';
        html += IMG(winInfo.winPai);
        html += '<p>';

        html += '<p>' + winInfo.jocbo.toString() + '</p>';
        html += '<p>' + winInfo.pan + '판 ' + winInfo.bu + '부' + '</p>';
        if (Array.isArray(winInfo.score)) {
            if (winInfo.score[0] == winInfo.score[1]) {
                html += winInfo.score[0] + ' ALL';
            } else {
                html += winInfo.score[1] + ', ' + winInfo.score[0];
            }
        } else {
            html += winInfo.score;
        }
        $('#panend').html(html);
        $('#panend').dialog({
            title: title,
            close: function () {
                socket.emit('next');
                $('#state').html('다른 플레이어를 기다리는 중...');
            }
        });
    });

    socket.on('uguk', function (uguk) {
        console.log(uguk);
        let title = '유국';

        let html = '';
        for (let i = 0; i < uguk.winPlayers.length; i++) {
            let player = uguk.winPlayers[i];
            html += '<p>' + GA(player.ga) + '</p>';
            html += '<p>';
            player.sonPai.sort();
            player.sonPai.forEach(function (pai) {
                html += IMG(pai);
            });
            html += '</p>'
        }
        $('#panend').html(html);
        $('#panend').dialog({
            title: title,
            close: function () {
                socket.emit('next');
                $('#state').html('다른 플레이어를 기다리는 중...');
            }
        });
    });
});

function setGame() {
    $('#wait').hide();

    $('#gameview').append(
        '<p id="info"></p>' +
        '<p id="dora"></p>' +

        '<p><span id="score0"></span>' +
        '<span id="river0"></span>' +
        '<span id="cry0"></span></p>' +

        '<p><span id="score1"></span>' +
        '<span id="river1"></span>' +
        '<span id="cry1"></span></p>' +

        '<p><span id="score2"></span>' +
        '<span id="river2"></span>' +
        '<span id="cry2"></span></p>' +

        '<p><span id="score3"></span>' +
        '<span id="river3"></span>' +
        '<span id="cry3"></span></p>' +

        '<p id="btn"></p>' +
        '<p id="sonPai"></p>' +

        '<div id="panend"></div>'
    )

    $('#panend').hide();

    socket.emit('ready');
}

function refreshInfo() {
    let html;

    let info = mj.info;
    let player = mj.player;

    let river = mj.river[lastPlayer];
    let wantPai = river[river.length - 1];

    $('#state').html('');

    // 기본 정보
    $('#info').text(
        GA(parseInt(info.guk / 4)) + (info.guk % 4 + 1) + '국 ' + info.bon + '본장' +
        ' 오야: ' + info.oya + ' 차례: ' + GA((info.turn - info.guk + 16) % 4) +
        ' 남은패: ' + info.lastPai +
        ' 공탁금: ' + info.gongtak +
        ' 당신은 ' + GA(player.ga) + '가'
    )

    html = '도라: ';
    mj.dora.forEach(function (pai) {
        html += IMG(pai);
    });
    $('#dora').html(html);

    // 점수, 버림패, 운패
    for (let i = 0; i < 4; i++) {
        html = GA(i) + ' - 점수: '
        html += mj.score[i] + ' ';
        $('#score' + i).html(html);

        let river = mj.river[i];
        html = '버림패: ';
        river.forEach(function (expai) {
            // for (let j = 0; j < river.length; j++) {
            //     expai = river[i];
            let cls = '';
            if (expai.rich == true) {
                cls += 'rotate1 ';
            }
            if (expai.take == true) {
                cls += 'trans ';
            }
            if (expai == wantPai) {
                cls += 'strong ';
            }
            html += IMG(expai.pai, cls);
        });
        $('#river' + i).html(html);

        let cry = mj.cry[i];
        html = '운패: ';
        cry.forEach(function (cry) {
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
    }

    // 플레이어 손패
    html = '';
    player.sonPai.sort();
    player.sonPai.forEach(function (pai) {
        html += IMG(pai);
    })
    if (player.tsumoPai != null) {
        html += '&nbsp;';
        html += IMG(player.tsumoPai, 'tsumo');
    }
    $('#sonPai').html(html);
}

function setTrigger() {
    let player = mj.player;
    let river = mj.river[mj.info.turn];
    let wantPai = river[river.length - 1];
    $('#btn').html('');

    // 기리
    if (player.state.includes('tsumo') || player.state.includes('cry')) {
        $('#sonPai img').click(function () {
            let a = {
                action: 'giri',
                pai: parseInt(this.alt)
            };
            if ((' ' + this.className + ' ').indexOf(' tsumo ') != -1) {
                a.tsumo = true;
            }
            doAction(a);
        })
    }

    // 캔슬 플래그
    let flag = false;
    // 쯔모
    if (player.state.includes('tsumo!')) {
        $('#btn').append('<button id="tsumo">쯔모</button>');
        $('#tsumo').click(function (event) {
            let a = {
                action: 'tsumo',
            };
            doAction(a)
        });
    }

    // 론
    if (player.state.includes('ron')) {
        flag = true;
        $('#btn').append('<button id="ron">론</button>');
        $('#ron').click(function (event) {
            let a = {
                action: 'ron',
            };
            doAction(a)
        });
    }

    // 리치
    if (player.state.includes('rich')) {
        $('#btn').append('<button id="rich">리치</button>');
        $('#rich').click(function () {
            let richPai = checkRich(player);

            // 버튼 등록
            $('#sonPai img').unbind('click');
            $('#btn').hide();
            for (let i = 0; i < $('#sonPai img').length; i++) {
                let pai = parseInt($('#sonPai img')[i].alt);
                if (richPai.includes(pai)) {
                    $('#sonPai img:eq(' + i + ')').click(function () {
                        let a = {
                            action: 'giri',
                            pai: parseInt(this.alt),
                            rich: true
                        };
                        if ((' ' + this.className + ' ').indexOf(' tsumo ') != -1) {
                            a.tsumo = true;
                        }
                        doAction(a);
                    });
                } else {
                    $('#sonPai img:eq(' + i + ')').addClass('trans');
                }
            }
        });
    }

    // 치
    if (player.state.includes('chi')) {
        flag = true;
        $('#btn').append('<button id="chi">치</button>');
        $('#chi').click(function (event) {
            chiPais = checkChi(player.sonPai, wantPai.pai);
            // 가능한 경우가 하나면 바로 치
            if (chiPais.length == 1) {
                let a = {
                    action: 'chi',
                    hasPais: chiPais[0]
                };
                doAction(a);
                return;
            }

            // 아니면 버튼등록
            console.log(chiPais);
            $('#sonPai img').unbind('click');
            $('#btn').hide();

            for (let i = 0; i < $('#sonPai img').length; i++) {
                let pai = parseInt($('#sonPai img')[i].alt);
                let flag = false;
                for (let j = 0; j < chiPais.length; j++) {
                    if (chiPais[j].includes(pai)) {
                        flag = true;
                        break;
                    }
                }
                if (flag == true) {
                    $('#sonPai img:eq(' + i + ')').click(function () { chi(pai) });
                } else {
                    $('#sonPai img:eq(' + i + ')').addClass('trans');
                }
            }
        });
    }

    // 퐁
    if (player.state.includes('pong')) {
        flag = true;
        $('#btn').append('<button id="pong">퐁</button>');
        $('#pong').click(function () {
            let a = {
                action: 'pong',
            };
            doAction(a);
        });
    }

    // 깡
    if (player.state.includes('kang')) {
        flag = true;
        $('#btn').append('<button id="kang">깡</button>');
        $('#kang').click(function () {
            let a = {
                action: 'kang',
            };
            doAction(a);
        });
    }

    // 안깡
    if (player.state.includes('ankang')) {
        $('#btn').append('<button id="ankang">안깡</button>');
        $('#ankang').click(function () {
            kangPai = checkAnkang(player, player.sonPai.concat(player.tsumoPai));
            // 가능한 경우가 하나면 바로 깡
            if (kangPai.length == 1) {
                let a = {
                    action: 'ankang',
                    pai: kangPai[0]
                };
                doAction(a);
                return
            }

            // 아니면 버튼 등록
            $('#sonPai img').unbind('click');
            $('#btn').hide();

            for (let i = 0; i < $('#sonPai img').length; i++) {
                let pai = parseInt($('#sonPai img')[i].alt);
                if (kangPai.includes(pai)) {
                    $('#sonPai img:eq(' + i + ')').click(function () { ankang(pai) });
                } else {
                    $('#sonPai img:eq(' + i + ')').addClass('trans');
                }
            }
        });
    }

    // 가깡
    if (player.state.includes('gakang')) {
        $('#btn').append('<button id="gakang">가깡</button>');
        $('#gakang').click(function () {
            kangPai = checkGakang(player.cry, player.sonPai.concat(player.tsumoPai));
            // 가능한 경우가 하나면 바로 깡
            if (kangPai.length == 1) {
                let a = {
                    action: 'gakang',
                    pai: kangPai[0]
                };
                doAction(a);
                return
            }

            // 아니면 버튼 등록
            $('#sonPai img').unbind('click');
            $('#btn').hide();

            for (let i = 0; i < $('#sonPai img').length; i++) {
                let pai = parseInt($('#sonPai img')[i].alt);
                if (kangPai.includes(pai)) {
                    $('#sonPai img:eq(' + i + ')').click(function () { gakang(pai) });
                } else {
                    $('#sonPai img:eq(' + i + ')').addClass('trans');
                }
            }
        });
    }

    // 캔슬
    if (flag == true) {
        $('#btn').append('<button id="cancel">캔슬</button>');
        $('#cancel').click(function () {
            let a = {
                action: 'cancel',
            };
            doAction(a);
        })
    }

    $('#btn').show();
}

function chi(pai) {
    //console.log(pai, chiPais);
    let leftchiPais = [];
    chiPais.forEach(function (pais) {
        if (pais.includes(pai)) {
            leftchiPais.push(pais);
        }
    })
    console.log('leftchiPais: ', leftchiPais);
    // 남은게 하나면 바로 ㄱㄱ
    if (leftchiPais.length == 1) {
        let a = {
            action: 'chi',
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

function ankang(pai) {
    let a = {
        action: 'ankang',
        pai: pai
    };
    doAction(a);
}

function gakang(pai) {
    let a = {
        action: 'gakang',
        pai: pai
    };
    doAction(a);
}

function doAction(a) {
    console.log(a);
    socket.emit('action', a);
}

function IMG(pai, cls) {
    let ret = '<img src=/image/pai/' + pai + '.gif alt="' + pai + '" ';
    if (cls) {
        ret += 'class=' + cls;
    }
    ret += '>'
    return ret;
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