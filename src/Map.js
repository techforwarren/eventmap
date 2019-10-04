import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

require('mapbox-gl/dist/mapbox-gl.css');
export function Map(props){

  const [locations, setLocations] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const map = useRef();

  //First render
  useEffect(() => {
    // Create the map with US center
    mapboxgl.accessToken = 'pk.eyJ1IjoibWlja3QiLCJhIjoiLXJIRS1NbyJ9.EfVT76g4A5dyuApW_zuIFQ';
		map.current = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mickt/ck0rlk9834i721clibn70ajsa',
      zoom: 3,
      hash: true,
      center: [-98.5795, 39.8283]
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
        if (e.features && e.features.length > 0) {
          props.selectLoc(e.features[0].properties.locKey);
        }
      });

      // Change the cursor to a pointer when the it enters a feature in the 'symbols' layer.
      map.current.on('mouseenter', 'event-locations', function () {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.current.on('mouseleave', 'event-locations', function () {
        map.current.getCanvas().style.cursor = '';
      });

      function inViewFeatures() {
        var features = map.current.queryRenderedFeatures({ layers: ['event-locations', 'event-locations-highlight'] });
        var keys = features.map(f => {
          return f.properties.locKey;
        });
        props.inViewEvents(keys);
      }

      // if the map moves, update the list of features in view.
      map.current.on('moveend', inViewFeatures);
      map.current.on('idle', inViewFeatures);


      setMapReady(true)
    })
  }, []);

  function highlight(key, flyto) {
    var newlocs = locations.map(l => {
      l.properties.highlight = (l.properties.locKey === key)
      if (flyto && l.properties.locKey === key)
        map.current.flyTo({center: l.geometry.coordinates, zoom: 10});
      return l;
    })
    setLocations(newlocs);
  }

  useEffect(() => {
    highlight(props.locFilt, true);
  }, [ props.locFilt])

  useEffect(() => {
    highlight(props.hoverMarker, false);
  }, [props.hoverMarker])


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
