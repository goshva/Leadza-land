if ((/bot|google|yandex|baidu|bing|msn|duckduckbot|teoma|slurp|crawler|spider|robot|crawling|facebook/i.test(navigator.userAgent)) === false && typeof(sessionStorage) != 'undefined' && sessionStorage.getItem('visited') !== 'y') {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '@media screen and (min-width: 980px) {.t-records {opacity: 0;}.t-records_animated {-webkit-transition: opacity ease-in-out .2s;-moz-transition: opacity ease-in-out .2s;-o-transition: opacity ease-in-out .2s;transition: opacity ease-in-out .2s;}.t-records.t-records_visible {opacity: 1;}}';
    document.getElementsByTagName('head')[0].appendChild(style);
    $(document).ready(function() {
        $('.t-records').addClass('t-records_animated');
        setTimeout(function() {
            $('.t-records').addClass('t-records_visible');
            sessionStorage.setItem('visited', 'y');
        }, 400);
    });
}