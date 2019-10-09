import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

require('mapbox-gl/dist/mapbox-gl.css');
export function Map(props){

  const [locations, setLocations] = useState({});
  const [mapReady, setMapReady] = useState(false);
  const map = useRef();
  const prevHighlightId = useRef()

  //First render
  useEffect(() => {
    // Create the map with US center
    mapboxgl.accessToken = 'pk.eyJ1IjoibWlja3QiLCJhIjoiY2sxam1xNmtsMHU5aTNob2N4YndlYXV0byJ9.LWG413QaYVY9bN4kAFu9eg';
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
          "icon-anchor": "bottom",
          "icon-size": 0.5,
          "icon-image": "w-marker-icon"
        },
        "paint": {
          "icon-opacity": [
            "match", ["feature-state", "highlight"],
            1, 0,
            1
          ]
        }
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
        "paint": {
          "icon-opacity": [
            "match", ["feature-state", "highlight"],
            1, 1,
            0
          ]
        }
      });

      // Center the map on the coordinates of any clicked symbol from the 'symbols' layer.
      map.current.on('click', function (e) {
          props.setLocationFilter(null);
      });

      map.current.on('click', 'event-locations', function (e) {
          props.setLocationFilter(e.features[0].properties.locationKey);
          if (map.current.getZoom() < 8) {
            map.current.jumpTo({center: e.features[0].geometry.coordinates, zoom: 10});
          } else {
            map.current.jumpTo({center: e.features[0].geometry.coordinates});
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

      function inViewFeatures(e) {
        var features = map.current.queryRenderedFeatures({ layers: ['event-locations', 'event-locations-highlight'] });
        var inView = {};
        features.forEach(f => {
          inView[f.properties.locationKey] = true;
        });
        props.inViewEvents(inView);
      }

      // once the map settles in a location, then reset the features in view
      map.current.on('idle', inViewFeatures);

      setMapReady(true);
    })
  }, []);

  function highlight(currentId, center) {
    if (prevHighlightId.current) map.current.setFeatureState({source: 'locations', id: prevHighlightId.current}, { highlight: 0});

    if (currentId) map.current.setFeatureState({source: 'locations', id: currentId}, { highlight: 1});

    prevHighlightId.current = currentId;
    if (center)
    map.current.jumpTo({center: center, zoom: 10});
  }

  useEffect(() => {
    if (mapReady === false) return;
    // if list is fitlered to a location that marker is highlighted,
    // otherwise if an event is hovered in the list.
    var locKey = props.locationFilter || props.highlightedEvent.locationKey;
    var id = (locations[locKey] && locations[locKey].id) || null;
    highlight(id, props.highlightedEvent.center);
  }, [ props.highlightedEvent, props.locationFilter, mapReady])


  useEffect(() => {
    if (mapReady === false) return;

    var geojson = {type: 'FeatureCollection', features: Object.values(locations)};
    map.current.getSource('locations').setData(geojson);
  }, [locations, mapReady])

  //Iterates through new events
  useEffect(() => {
    if (props.events === null) return;

    //deduped locations, so we dont need to render multiple pins for the same location.
    var locations = {};

    props.events.forEach((e, i) => {

      var locationKey = e.location.location.longitude + '&' + e.location.location.latitude;

      locations[locationKey] = {
        type: 'Feature',
        id: i+1, // id based on iterator used for feature state lookups to highlight markers.
        // 0 id doesnt work (bug)
        properties:{
          locationKey: locationKey
        },
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(e.location.location.longitude),
            parseFloat(e.location.location.latitude)
          ]
        }
      };
    });
    setLocations(locations);
  }, [props.events]);


  return(
    <div id="map"></div>
  );
}

export default Map;
