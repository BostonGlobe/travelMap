var map;
var bounds = new google.maps.LatLngBounds();
var openInfowindow;
var mapMarkers = [];
var mapHtmls = [];
var isFullScreen = false;

function GetMyLocation() {
    var useMyLocation = document.getElementById('myLocationCheckBox');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(ProcessLocation);
    } else {
        useMyLocation.checked = false;
        alert("Geo Location is not supported on your current browser!");
    }
}

function ProcessLocation(position) {
    var currentLocation = document.getElementById("currentLocation");
    currentLocation.value = position.coords.latitude + "," + position.coords.longitude; var latlong = position.coords.latitude + "," + position.coords.longitude;

    var searchButton = document.getElementById('SearchButton');
    searchButton.click();
}

function load() {
    var myLocationValue = document.getElementById("currentLocation");
    var useMyLocation = document.getElementById('myLocationCheckBox').checked;
    if (useMyLocation && myLocationValue.value == "") {
        GetMyLocation();
    }

    SetDistanceOption();

    var zoomLevel = 10;

    var distanceDropDown = document.getElementById('distanceDropDown');
    var distance = distanceDropDown.options[distanceDropDown.selectedIndex].value;

    if (distance == 1000) {
        mapCenter.latitude = 42.2625932;
        mapCenter.longitude = -71.8022934;
    }

    if (window.mapCenter !== undefined && window.mapLocations !== undefined) {
        var mapOptions = {
            zoom: zoomLevel,
            maxZoom: 15,
            minZoom: 7,
            center: new google.maps.LatLng(mapCenter.latitude, mapCenter.longitude),
            mapTypeControl: true,
            mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
            navigationControl: true,
            navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        map = new google.maps.Map($("#map")[0], mapOptions);

        google.maps.event.addDomListener(window, "resize", function () {
            google.maps.event.trigger(map, "resize");

            if (mapMarkers.length > 0) {
                map.fitBounds(bounds);

                if (distance >= 15) {
                    map.setZoom(map.zoom + 1);
                }
            }
        });

        google.maps.event.addListenerOnce(map, 'bounds_changed', function (event) {
            if (distance >= 15) {
                map.setZoom(map.zoom + 1);
            }
        });

        var resultText = mapLocations.locations.length + " place";
        resultText = (mapLocations.locations.length != 1) ? resultText + 's' : resultText;

        if (distance == 1000) {
            $("#resultsCount").html(resultText);
        } else {
            $("#resultsCount").html(resultText + " within " + distance + " miles");
        }

        for (var i = 0; i < mapLocations.locations.length; i++) {
            var point = new google.maps.LatLng(mapLocations.locations[i].latitude, mapLocations.locations[i].longitude);
            var locationAddress = mapLocations.locations[i].address + ", " + mapLocations.locations[i].city + ", " + mapLocations.locations[i].state + " " + mapLocations.locations[i].zip;
            createMarker(point, mapLocations.locations[i].name, locationAddress, encodeURI(locationAddress), mapLocations.locations[i].description, mapLocations.locations[i].website, mapLocations.locations[i].phone, mapLocations.locations[i].mapcode, mapLocations.locations[i].allmapcodes, mapLocations.locations[i].farmprograms, mapLocations.locations[i].index);
            AddSearchResult(mapLocations.locations[i].name, mapLocations.locations[i].city + ", " + mapLocations.locations[i].state, mapLocations.locations[i].mapcode, mapLocations.locations[i].allmapcodes, mapLocations.locations[i].index);
        }

        for (var i = 0; i < mapMarkers.length; i++) {
            bounds.extend(mapMarkers[i].getPosition());
        }

        if (mapMarkers.length > 0) {
            map.fitBounds(bounds);
        }
    }
}


function createMarker(point, name, address, urladdress, description, website, phone, mapcode, allmapcodes, farmprograms, locationNumber) {
    var iconSize = new google.maps.Size(32, 37);
    var iconShadowSize = new google.maps.Size(37, 34);
    var iconHotSpotOffset = new google.maps.Point(9, 0);
    var iconPosition = new google.maps.Point(0, 0);
    var infoWindowAnchor = new google.maps.Point(9, 2);
    var infoShadowAnchor = new google.maps.Point(18, 25);

    var iconShadowUrl = "images/markers/shadow.png";
    var iconImageUrl;
    var iconImageOverUrl;
    var iconImageOutUrl;

    if (mapcode != "") {
        iconImageOutUrl = "images/markers/" + mapcode + ".png";
        iconImageOverUrl = "images/markers/" + mapcode + ".png";
        iconImageUrl = iconImageOutUrl;
    } else {
        iconImageOutUrl = "images/markers/farm.png";
        iconImageOverUrl = "images/markers/farm.png";
        iconImageUrl = iconImageOutUrl;
    }

    var markerShadow =
        new google.maps.MarkerImage(iconShadowUrl, iconShadowSize,
            iconPosition, iconHotSpotOffset);

    var markerImage =
        new google.maps.MarkerImage(iconImageUrl, iconSize,
            iconPosition, iconHotSpotOffset);

    var markerImageOver =
        new google.maps.MarkerImage(iconImageOverUrl, iconSize,
            iconPosition, iconHotSpotOffset);

    var markerImageOut =
        new google.maps.MarkerImage(iconImageOutUrl, iconSize,
            iconPosition, iconHotSpotOffset);

    var markerOptions = {
        title: name,
        icon: markerImage,
        shadow: markerShadow,
        position: point,
        map: map
    }

    var marker = new google.maps.Marker(markerOptions);

    var arrMapCodes = allmapcodes.split(",");
    var mapCodesHtml = '<div id="mapCodes">';

    for (var i in arrMapCodes) {
        if (arrMapCodes[i] != "") {
            mapCodesHtml += '<img src="images/markers/' + arrMapCodes[i] + '.png" alt="" />';
        } else {
            mapCodesHtml += '<img src="images/markers/farm.png" alt="" />';
        }
    }

    mapCodesHtml += '</div>';

    var arrFarmPrograms = farmprograms.split(",");
    var farmProgramsHtml = '<div id="farmPrograms">';

    for (var i in arrFarmPrograms) {
        if (arrFarmPrograms[i] == "SNAP" || arrFarmPrograms[i] == "HIP" || arrFarmPrograms[i] == "FMNP") {
            farmProgramsHtml += '<img src="images/markers/' + arrFarmPrograms[i] + '.png" alt="" />';
        }
    }

    farmProgramsHtml += '</div>';

    var weburl = (website != "") ? '<a target="_blank" href="http://' + website + '">Website</a>  | ' : website;
    var telephone = (phone != "") ? 'Phone: ' + phone + '<br>' : phone;
    var html = mapCodesHtml + '<b>' + name + '</b><br>' + address + '<br>' + telephone + description + '<br>' + weburl + '<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&q=from:' + mapCenter.address + '+to:' + urladdress + '">Directions</a><br>' + farmProgramsHtml;

    google.maps.event.addListener(marker, 'click', function () {
        var infowindow = new google.maps.InfoWindow({ content: html });
        setInfowindow(infowindow);
        infowindow.open(map, marker);
    });

    mapMarkers.push(marker);
    mapHtmls.push(html);
    return marker;
}

function AddSearchResult(name, address, mapcode, allmapcodes, locationNumber) {
    $('<div class="result" onclick="Javascript:markerClicked(' + locationNumber + ')"></div>').html('<a href="Javascript:;" class="locationName">' + name + '</a><br>' + address + '</br>').appendTo('#results');
}

function LoadSearchResults(comparator) {
    mapLocations.locations.sort(eval(comparator));

    $('#results').empty();

    for (var i = 0; i < mapLocations.locations.length; i++) {
        AddSearchResult(mapLocations.locations[i].name, mapLocations.locations[i].city + ", " + mapLocations.locations[i].state, mapLocations.locations[i].mapcode, mapLocations.locations[i].allmapcodes, mapLocations.locations[i].index);
    }
}

function SortByName(x, y) {
    return ((x.name == y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
}

function SortByDistance(x, y) {
    return x.distance - y.distance;
}

function markerClicked(markerNum) {
    var infowindowOptions = {
        content: mapHtmls[markerNum]
    }
    var infowindow = new google.maps.InfoWindow(infowindowOptions);
    infowindow.open(map, mapMarkers[markerNum]);
    setInfowindow(infowindow);
}

function setInfowindow(newInfowindow) {
    if (openInfowindow != undefined) {
        openInfowindow.close();
    }

    openInfowindow = newInfowindow;
}

function SetDistanceOption() {

    var farmTypeDropDown = $("#farmTypeDropDown")[0];
    var farmProductDropDown = $("#farmProductDropDown")[0];
    var farmProgramDropDown = $("#farmProgramDropDown")[0];
    var distanceDropDown = $("#distanceDropDown")[0];
    var keywordTextBox = $("#keywordTextBox")[0];

    var selectedType = farmTypeDropDown.options[farmTypeDropDown.selectedIndex].value;

    farmProductDropDown.disabled = (selectedType == "Fairs" || selectedType == "Farmers Markets" || selectedType == "Winter Markets") ? true : false;

    if (farmTypeDropDown.selectedIndex == 0 && farmProductDropDown.selectedIndex == 0 && farmProgramDropDown.selectedIndex == 0 && keywordTextBox.value.length < 3) {
        distanceDropDown.options[distanceDropDown.options.length - 1] = null;
        return;
    }

    if (distanceDropDown.options[distanceDropDown.length - 1].text != "Any Distance") {
        var optn = document.createElement("OPTION");
        optn.text = "Any Distance";
        optn.value = "1000";
        distanceDropDown.options.add(optn);
    }
}