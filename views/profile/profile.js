require('./profile.styl');

/* eslint-disable no-undef*/
ymaps.ready(init);
var myMap;
function init() {
    myMap = new ymaps.Map('map', {
            center: [56.8575, 60.6125],
            zoom: 4,
            controls: ['zoomControl', 'fullscreenControl']
        });
    var coordinates = JSON.parse(document.querySelector('#map').dataset.coordinates);
    coordinates.forEach(coordinate => {
            var marker = [coordinate.lat, coordinate.lng];
            myMap.geoObjects.add(new ymaps.Placemark(marker));
        });
}
