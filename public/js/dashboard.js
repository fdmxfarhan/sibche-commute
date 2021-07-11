$(document).ready(function(){
    $('.close-success-msg').click(() => {
        $('.success-msg').slideUp(500);
    });
    $('.close-notif-msg').click(() => {
        $('.notif-msg').slideUp(500);
    });

    var modal = $('.black-modal');
    var commutes = [];
    for(var i=0; i<100; i++){
        commutes.push({btn: $(`#day${i}`), commute: $(`#commute${i}`)});
    }
    var edits = [];
    for(var i=0; i<5000; i++){
        for(var j=0; j<200; j++){
            edits.push({btn: $(`#btn-edit${i}-form${j}`), edit: $(`#day${i}-form${j}`)});
        }
    }
    
    commutes.forEach(commute => {
        commute.btn.click(() => {
            // modal.fadeIn(500);
            edits.forEach(edit => {
                edit.edit.hide();
            });
            commute.commute.slideToggle(500);
        });
    });
    
    edits.forEach(edit => {
        edit.btn.click(() => {
            edits.forEach(edit => {
                edit.edit.hide();
            });
            edit.edit.slideToggle(500);
        });
    });

    $('a.upload-log-btn').click(() => {
        $('#upload-log').fadeIn(500);
        modal.fadeIn(500);
    });
    modal.click(() => {
        $('#upload-log').fadeOut(500);
        modal.fadeOut(500);
    })
    $('.close-popup').click(() => {
        $('#upload-log').fadeOut(500);
        modal.fadeOut(500);
    })
});