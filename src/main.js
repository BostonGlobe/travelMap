'use strict';
(function() {
	// global variables
   var map = L.map("map",{scrollWheelZoom: false});
    var path;

	// called once on page load
	var init = function() {

	};

	// called automatically on article page resize
	window.onResize = function(width) {

	};

	// called when the graphic enters the viewport
	window.enterView = function() {

	};



	    //mapdata
        var mapData=[1];
	    //set up the map



        d3.json('./assets/geoCodedFarm.json', function (error, data) {
            console.log(data);
            var farmMap = Map().map(map);
            d3.select("#map").datum(data).call(farmMap);
        });

	// run code
	init();
})();
