import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import gMark from './img/w-marker-icon-2x.png';
import hMark from './img/w-marker-icon-2x-highlighted.png';
import sMark from './img/marker-shadow.png';
import { eventHasValidLocation } from './Util';

export function Map(props){

  const [center, setCenter] = useState([39.8283, -98.5795]);  // center of the USA
  const [locations, setLocations] = useState({});       // set of unique lat/longs for events
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
              	snap = this._map.options.zoomSnap || 0;  // ??? frm: why use this._map instead of just map
            
    		  wheelDeltaList.push(Math.abs(delta));
    		  var average = 0;
    		  for(let i = 0; i< wheelDeltaList.length; i++){  
    			  average += wheelDeltaList[i];
    		  }
    		  average = average / wheelDeltaList.length;

    		  var diffSquaredTotal= 0;
    		  for(let i = 0; i < wheelDeltaList.length; i++){  
    			  var diff = wheelDeltaList[i] - average;
    			  diffSquaredTotal += Math.pow(diff,2);
    		  }
            
    		  var standardDeviation = Math.sqrt(diffSquaredTotal/wheelDeltaList.length);
    		  map.stop(); // stop panning and fly animations if any
            
    		  var deltaTime = currentScrollTime - lastScroll;
            
    		  var d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4),  // ??? frm: why use this._map instead of just map
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

      /* ??? frm: The current code immediately below does not correctly resize and
       *          rezoom on mobile.  The problem is that the amount of space used
       *          for each card varies, and hence the amount of space available
       *          for the map can change every time the cardIndex changes.
       *          
       *          The code below tells the map to resize (by calling invlidatesize() )
       *          everytime the hoverMarker changes which is almost correct.  Instead
       *          it should resize every time the cardIndex changes.  
       *    
       *          Unfortuately, the Map currently does not know about the cardIndex
       *          It would be easy to pass it in the way the hoverMarker is currently
       *          passed in, but I want to wait and make that change in a separate
       *          pull request (there is another related issue/bug concerning hoverMarker
       *          on mobile that I will change at the same time).
       *
       *          I am also not going to create an issue for this on github yet
       *          because this is not a problem in the old UI - so it doesn't make
       *          sense to create an issue that is not yet a problem in production.
       *          I will create an issue once the new tiled layout is merged...
       */

      // zoom to marker bounds, plus padding to make sure entire marker is visible
      // ??? frm: probably only have to invalidateSize() on mobile... (but it is a cheap op)
      map.current.invalidateSize();  // make sure the map fits its allocated space (mobile issue)
      map.current.fitBounds(markers.current.getBounds().pad(0.1));
    }
  }, [locations, props.hoverMarker, props.locFilt]);

  //Iterates through new events
  useEffect(() => {

    if(props.events != null){

      if(props.events.length > 0){

        //Initiates map's focus at the first event (typically the closest to the provided zipcode) with a valid lat & long position

        // Find out whether there are any events in the list that are not private
        let first = -1;  
        for (let i=0; i<props.events.length; i++) {
            if (eventHasValidLocation(props.events[i])) {
              first = i;
              break;
            }
        }

        if (first !== -1) {  // There is at least one event that is not private (hence visible on map)

            const lat = props.events[first]['location']['location']['latitude'];
            const long = props.events[first]['location']['location']['longitude'];

            /* 
             * If "first" non-private location is different from previous "center"
             * then update the "center".  This will center the map view on the 
             * "first" non-private location which we assume is the one closest to
             * the given zip code (the Mobilize API should return events in the 
             * order of closest first)
             */
            if(center[0] !== lat || center[1] !== long){  
              setCenter([lat, long]);
              setNewCenter(true);
            }

            var places = {};

            props.events.forEach(function(event, index) {

              //If has longitude and latitute
              if (eventHasValidLocation(event)) {

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
        else {
            /* 
             * TODO: After everyone is OK with the changes to account for 
             *            a list of events that are all private, this code
             *            should be refactored so that it first checks to 
             *            see if there are any visible events (which involves 
             *            two tests: 1. that the events list is not empty and
             *            2. that at least one of the events is not private.
             *            If there is at least one event that is not private
             *            then the code should create the "places" array.
             *
             *            So the code should look like:
             *
             *                ...check to see if there is at least one event that is not private
             *                if (...at least one event is not private) {
             *                    ...compute the places variable's value
             *                    setLocations(places);
             *                }
             *                else {
             *                    ...clear all markers from the map
             *                }
             *                
             */
            markers.current.clearLayers();
            map.current.setView([39.739, -104.9903], 4);
        }
      } else {
        markers.current.clearLayers();
        map.current.setView([39.739, -104.9903], 4);
      }
    } 
  }, [props.events]);


  return(
    <div id="map"></div>
  );
}

export default Map;
