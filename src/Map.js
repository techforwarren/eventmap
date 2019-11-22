import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import gMark from './img/w-marker-icon-2x.png';
import hMark from './img/w-marker-icon-2x-highlighted.png';
import sMark from './img/marker-shadow.png';

export function Map(props){

  const [center, setCenter] = useState([39.8283, -98.5795]);
  const [locations, setLocations] = useState({});
  const [newCenter, setNewCenter] = useState(false);
  const map = useRef();
  const markers = useRef();

  //Called to set/unset location filter
  function locationFilter(event, set){

    if(set){
      props.selectLoc({
        'lat': event['latlng']['lat'],
        'lng': event['latlng']['lng']
      });
    } else {
      props.selectLoc(null);
    }
  }

  //First render
  useEffect(() => {
      var lastScroll = new Date().getTime();
      var wheelDeltaList = [];

      // override the scrollwheelzoom
      L.Map.ScrollWheelZoomExtended = L.Map.ScrollWheelZoom.extend({
    	  _performZoom: function() {
    		  var currentScrollTime = new Date().getTime();
    		  var map = this._map,
              	zoom = map.getZoom(),
              	delta = this._delta,
              	normalizedDelta = 0,
              	snap = this._map.options.zoomSnap || 0;
            
    		  wheelDeltaList.push(Math.abs(delta));
    		  var average = 0;
    		  for(var i = 0; i< wheelDeltaList.length; i++){
    			  average += wheelDeltaList[i];
    		  }
    		  average = average / wheelDeltaList.length;

    		  var diffSquaredTotal= 0;
    		  for(var i = 0; i < wheelDeltaList.length; i++){
    			  var diff = wheelDeltaList[i] - average;
    			  diffSquaredTotal += Math.pow(diff,2);
    		  }
            
    		  var standardDeviation = Math.sqrt(diffSquaredTotal/wheelDeltaList.length);
    		  map.stop(); // stop panning and fly animations if any
            
    		  var deltaTime = currentScrollTime - lastScroll;
            
    		  var d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4),
    		  d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
    		  d4 = snap ? Math.ceil(d3 / snap) * snap : d3,
                    normalizedDelta = map._limitZoom(zoom + (this._delta > 0 ? d4 : -d4)) - zoom;

    		  this._delta = 0;
    		  this._startTime = null;
    		  lastScroll = currentScrollTime;
    		  if (!normalizedDelta) {
    			  return;
    		  }
            
    		  if(deltaTime < 1000 && ((average+standardDeviation) >= Math.abs(delta))){
    			  return;
    		  } else if (map.options.scrollWheelZoom === 'center') {
    			  map.setZoom(zoom + normalizedDelta);
    		  } else {
    			  map.setZoomAround(this._lastMousePos, zoom + normalizedDelta);
    		  }
    		  wheelDeltaList = [];
    	  }
        });
       
        L.Map.addInitHook('addHandler', 'scrollWheelZoomExtended', L.Map.ScrollWheelZoomExtended);
        
        // Create the map with US center
        map.current = L.map('map', {
            zoomControl: false,
            scrollWheelZoom: false,
            scrollWheelZoomExtended: true
        }).setView(center, (props.events != null) ? 8 : 4);

	    //Initializes layergroup
	    markers.current = L.featureGroup().addTo(map.current);
	    markers.current.on("click", (event) => locationFilter(event, true));
	    map.current.on("click", (event) => locationFilter(event, false));


		// Set up the OSM layer
		L.tileLayer(
			'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
				maxZoom: 18
			}).addTo(map.current);

		L.control.zoom({
			position: 'topright'
		}).addTo(map.current);

  }, []);


  //When locations are updated, generate new markers
  useEffect(() => {

    if(Object.keys(locations).length > 0){
      markers.current.clearLayers();

      if(newCenter){
        map.current.setView(center, 8);
        setNewCenter(false);
      }


      var generalIcon = new L.Icon({
        iconUrl: gMark,
        shadowUrl: sMark,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      var highlightedIcon = new L.Icon({
        iconUrl: hMark,
        shadowUrl: sMark,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      for (var key in locations) {
        let highlighted = false;

        if(key === props.hoverMarker || (props.locFilt !== null && key === props.locFilt['lat'] + "&" + props.locFilt['lng'])){
          console.log("matching");
          highlighted = true;
        }

  			let cord = key.split("&");

        if(highlighted){
          L.marker([parseFloat(cord[0]), parseFloat(cord[1])], {icon: highlightedIcon, zIndexOffset: 1000}).addTo(markers.current);
        } else {
          L.marker([parseFloat(cord[0]), parseFloat(cord[1])], {icon: generalIcon}).addTo(markers.current);
        }


  		}
    }
  }, [locations, props.hoverMarker, props.locFilt]);

  //Iterates through new events
  useEffect(() => {

    if(props.events != null){

      //Initiates map's focus at the first event (typically the closest to the provided zipcode) with a valid lat & long position
      let first = 0;
  		if (!('location' in props.events[first]) || !('location' in props.events[first]['location']) || !('latitude' in props.events[first]['location']['location'])) {
  			first++;
  		}

      var lat = props.events[first]['location']['location']['latitude'];
      var long = props.events[first]['location']['location']['longitude'];

      if(center[0] !== lat || center[0] !== long){
        setCenter([lat, long]);
        setNewCenter(true);
      }

      var places = {};

      props.events.forEach(function(event, index) {

  			//If has longitude and latitute
  			if ('location' in event && 'location' in event['location'] && 'latitude' in event['location']['location']) {

  				//Creates string key for {places} dictionary
  				let str = event['location']['location']['latitude'] + "&" + event['location']['location']['longitude'];
  				//Creates or adds to a location - adds HTML code for event list for that location
  				if (str in places) {
  					places[str] = places[str] + 1;
  				} else {
  					places[str] = 1;
  				}

  			}
  		});
      setLocations(places);
    }

  }, [props.events]);


  return(
    <div id="map"></div>
  );
}

export default Map;
