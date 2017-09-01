function Map() {
    var _map;
    var exports = function(selection){
        var _farmData=[];
        console.log("Set the map");
        //map layer
        //light map https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ
        var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
            id: 'mapbox.street',
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        });

        _map.setView([42.323, -71.072], 8.5);
        streetMap.addTo(_map);

        var arr = selection.datum()? selection.datum():[];
        var zoom = 14;
        //ADD ICON

        var iconStyle= {
            iconUrl: './assets/leaf-red.png',
            shadowUrl: './assets/leaf-shadow.png',
            iconSize:     [19, 47.5], // size of the icon
            shadowSize:   [25, 32], // size of the shadow
            iconAnchor:   [11, 47], // point of the icon which will correspond to marker's location
            shadowAnchor: [2, 31],  // the same for the shadow
            popupAnchor:  [-3, -38] // point from which the popup should open relative to the iconAnchor
        };
        var greenIcon = L.icon(iconStyle);

        var markersLayer = L.layerGroup();
        var farmMarkers = Array.from(arr,function(d, i){

            var marker = L.marker([+d.lat, +d.lon],
                {icon: greenIcon, riseOnHover: true})
                .bindPopup("<p><a target='_blank' href='http://"+d.Website +"'><span> "+ d.LocationName+" </span></a><hr/><b>Address:</b> "+d.addresses+"<br/><b>Description:</b> "+d.Description+" </p>");
            markersLayer.addLayer(marker);
            var saveLatLng =L.latLng(42.323, -71.072);

            marker.on('click', function(e){
                console.log(e.latlng);

                if (_map.getZoom()<=12){
                    _map.flyTo(e.latlng, zoom);
                } else if (saveLatLng == e.latlng){
                        _map.flyTo(e.latlng, 8.5);
                } else{
                    iconStyle.iconSize = [38, 95];
                    _map.panTo(e.latlng);
                }
                saveLatLng= e.latlng;

            });

        });
        markersLayer.addTo(_map);
        var overlay = {'markers': markersLayer};
       L.control.layers(null, overlay).addTo(_map);



    }
    exports.map = function(_){
        if(!arguments.length) return _map;
        _map = _;
        return this;
    }

    return exports;
}