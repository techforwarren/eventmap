import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import gMark from './img/w-marker-icon-2x.png';
import hMark from './img/w-marker-icon-2x-highlighted.png';
import sMark from './img/marker-shadow.png';

require('mapbox-gl/dist/mapbox-gl.css');
export function Map(props){

  const [center, setCenter] = useState([-98.5795, 39.8283]);
  const [locations, setLocations] = useState([]);
  const [newCenter, setNewCenter] = useState(false);
  const [mapReady, setMapReady] = useState(false);
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
    // Create the map with US center
    mapboxgl.accessToken = 'pk.eyJ1IjoibWlja3QiLCJhIjoiLXJIRS1NbyJ9.EfVT76g4A5dyuApW_zuIFQ';
		map.current = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mickt/ck0rlk9834i721clibn70ajsa',
      zoom: 3,
      hash: true,
      center: center
		});
    map.current.on('load', _ => {

      map.current.addSource('locations', {
        "type": "geojson",
        "data": {type: 'FeatureCollection', features: []}
      });


      map.current.addLayer({
        "id": "event-locations",
        "source": "locations",
        "type": "symbol",
        "layout": {
          "icon-allow-overlap": true,
          "icon-image": "w-marker-icon",
          "icon-anchor": "bottom",
          "icon-size": 0.5
        },
        "filter": ["!=", "highlight", true]
      });
      map.current.addLayer({
        "id": "event-locations-highlight",
        "source": "locations",
        "type": "symbol",
        "layout": {
          "icon-allow-overlap": true,
          "icon-image": "w-marker-icon-highlighted",
          "icon-anchor": "bottom",
          "icon-size": 0.6
        },
        "filter": ["==", "highlight", true]
      });

      // Center the map on the coordinates of any clicked symbol from the 'symbols' layer.
      map.current.on('click', 'event-locations', function (e) {
        console.log(e.features)
        if (e.features && e.features.length > 0) {
          props.selectLoc(e.features[0].properties.locKey);
        }
        map.current.flyTo({center: e.features[0].geometry.coordinates});
      });

      // Change the cursor to a pointer when the it enters a feature in the 'symbols' layer.
      map.current.on('mouseenter', 'event-locations', function () {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.current.on('mouseleave', 'event-locations', function () {
        map.current.getCanvas().style.cursor = '';
      });

      setMapReady(true)
    })
  }, []);


  useEffect(() => {

    console.log(props.hoverMarker, props.locFilt)
    var key = props.hoverMarker ||  props.locFilt
    var newlocs = locations.map(l => {
      l.properties.highlight = (l.properties.locKey === key)
      return l;
    })
    setLocations(newlocs);

  }, [props.hoverMarker, props.locFilt])

  useEffect(() => {
    if (mapReady === false) return;

    var geojson = {type: 'FeatureCollection', features: locations};
    map.current.getSource('locations').setData(geojson);
  }, [locations, mapReady])

  //Iterates through new events
  useEffect(() => {
    if (props.events === null) return;

    var places = props.events.map(e => {
      return {
        type: 'Feature',
        properties:{
          "highlight": false,
          "locKey": e.location.location.longitude + '&' + e.location.location.latitude
        },
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(e.location.location.longitude),
            parseFloat(e.location.location.latitude)
          ]
        }
      }
    })
    setLocations(places);
  }, [props.events]);


  return(
    <div id="map"></div>
  );
}

export default Map;
