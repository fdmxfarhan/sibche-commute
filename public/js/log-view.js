$(document).ready(function(){
    $('#tab1-btn').click(() => {
        $('.tab1').show();
        $('.tab2').hide();
        $('.tab3').hide();
        $('.tab4').hide();
        $('#tab1-btn').addClass('active');
        $('#tab2-btn').removeClass('active');
        $('#tab3-btn').removeClass('active');
        $('#tab4-btn').removeClass('active');
    });
    $('#tab2-btn').click(() => {
        $('.tab1').hide();
        $('.tab2').show();
        $('.tab3').hide();
        $('.tab4').hide();
        $('#tab1-btn').removeClass('active');
        $('#tab2-btn').addClass('active');
        $('#tab3-btn').removeClass('active');
        $('#tab4-btn').removeClass('active');
    });
    $('#tab3-btn').click(() => {
        $('.tab1').hide();
        $('.tab2').hide();
        $('.tab3').show();
        $('.tab4').hide();
        $('#tab1-btn').removeClass('active');
        $('#tab2-btn').removeClass('active');
        $('#tab3-btn').addClass('active');
        $('#tab4-btn').removeClass('active');
    });
    $('#tab4-btn').click(() => {
        $('.tab1').hide();
        $('.tab2').hide();
        $('.tab3').hide();
        $('.tab4').show();
        $('#tab1-btn').removeClass('active');
        $('#tab2-btn').removeClass('active');
        $('#tab3-btn').removeClass('active');
        $('#tab4-btn').addClass('active');
    });
    

});