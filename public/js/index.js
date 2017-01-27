$(function() {
    // iconSelect 설정
    let iconSelect = new IconSelect('icon');
    let icons = [];
    for (let i = 0; i < 14; i++) {
    icons.push({'iconFilePath':'image/char/'+i+'.png', 'iconValue':''+i});
    }
    iconSelect.refresh(icons);
    document.getElementById('icon').addEventListener('changed', function(e){
    $('#char').val(iconSelect.getSelectedValue());
    });

    // 자동 로그인 정보 쿠키에서 불러오기
    $('#name').val($.cookie('name'));
    $('#char').val($.cookie('char'));
    iconSelect.setSelectedIndex($.cookie('char'));
});