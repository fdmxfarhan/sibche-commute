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
    commutes.forEach(commute => {
        commute.btn.click(() => {
            // modal.fadeIn(500);
            commute.commute.slideToggle(500);
        });
    });

    
});