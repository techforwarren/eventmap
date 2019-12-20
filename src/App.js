import React, {useState, useEffect } from 'react';
import {isMobile} from 'react-device-detect';
import History from './History';
import SearchBar from './SearchBar';
import Map from './Map';
import MobileList from './MobileList';
import './App.scss';
import gMark from './img/w-marker-icon-2x.png';

import ReactGA from 'react-ga';
ReactGA.initialize('UA-149839620-1');
ReactGA.pageview(window.location.pathname + window.location.search);

const queryString = require('query-string');

const deviceIsMobile = isMobile;        // HACK to allow easy mocking of isMobile for testing/debugging
// const deviceIsMobile = true;        // uncomment this line to force app to render as if on a mobile device

function App() {
  //List of events
  const [events, setEvents] = useState(null);
  // Current range 
  const [currRange, setCurrRange] = useState(75);

  //Current zip code search
  const [currZip, setCurrZip] = useState(() => {
    // check URL parameter on initialization
    const qs = queryString.parse(History.location.search);
    return qs.zip;
  });

  //Current event being hovered over
  const [hoverEvent, setHoverEvent] = useState(null);
  //Current selected location location filter
  const [locFilt, setLocFilt] = useState(null);
  //For mobile, the current card
  const [cardIndex, setCardIndex] = useState(null);

  //Makes API call when zipcode entered
  useEffect(() => {
    if(currZip != null){
      fetch("https://api.mobilize.us/v1/organizations/1316/events?timeslot_start=gte_now&per_page=200&zipcode=" + currZip + "&max_dist=" + currRange)
      .then((res)=>res.json())
      .then((data)=>setEvents(data['data']));

      //Reset states on new zipcode
      setHoverEvent(null);
      setLocFilt(null);
      setCardIndex(0);

      //Tracks zip input

      ReactGA.event({
        category: 'Search',
        action: 'User Searched',
        label: `${currZip}`
      });

    }
  }, [currZip, currRange]);

  // If the cardIndex changes, reset the event whose marker is highlighted, by calling setHoverEvent()
  useEffect(() => {
    if(deviceIsMobile && events != null){
      setHoverEvent((('location' in events[cardIndex] && 'location' in events[cardIndex]['location'] && 'latitude' in events[cardIndex]['location']['location']) ? "" + events[cardIndex]['location']['location']['latitude'] + "&" + events[cardIndex]['location']['location']['longitude'] : null));
    }
  }, [cardIndex]);

  return (
    <div className="app">
      <SearchBar currZip={currZip} currRange={currRange} updateZip={(newZip) => setCurrZip(newZip)} updateRange={(newRange) => setCurrRange(newRange)} events={events} updatedHover={(newHover) => setHoverEvent(newHover)} locFilt={locFilt} deviceIsMobile={deviceIsMobile}/>
      {events === null && currZip == null &&
        <div id="startLoad">
          <h1 id="firstLine">SHE HAS</h1><h1 id="secondLine">EVENTS</h1><h1 id="thirdLine">FOR THAT <img src={gMark} alt=""></img></h1>
          <h3 id="searchCTA">Enter your zipcode to find events near you!</h3>
        </div>
      }
      {events !== null && deviceIsMobile &&
        <MobileList events={events} updatedHover={(newHover) => setHoverEvent(newHover)} locFilt={locFilt} cardIndex={cardIndex} updateCardIndex={(update) => setCardIndex(update)}/>
      }
      <Map currZip={currZip} events={events} hoverMarker={hoverEvent} selectLoc={(newLoc) => setLocFilt(newLoc)} locFilt={locFilt}/>
    </div>
  );
}

export default App;
