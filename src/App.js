import React, {useState, useEffect } from 'react';
import {isMobile} from 'react-device-detect';
import SearchBar from './SearchBar';
import Map from './Map';
import MobileList from './MobileList';
import './App.scss';

function App() {
  //List of events
  const [events, setEvents] = useState(null);
  //Current zip code search - input by user
  const [currZip, setCurrZip] = useState(null);
  //Current event being hovered over
  const [hoverEvent, setHoverEvent] = useState(null);
  //Current selected location location filter
  const [locFilt, setLocFilt] = useState(null);
  //For mobile, the current card
  const [cardIndex, setCardIndex] = useState(null);

  //Makes API call when zipcode entered
  useEffect(() => {
    if(currZip != null){
      fetch("https://api.mobilize.us/v1/organizations/1316/events?timeslot_start=gte_now&zipcode=" + currZip)
      .then((res)=>res.json())
      .then((data)=>setEvents(data['data']));

      //Reset states on new zipcode
      setHoverEvent(null);
      setLocFilt(null);
      setCardIndex(0);

    }
  }, [currZip]);

  //Card index utilizes the hoverEvent to highlight the card's respective marker
  useEffect(() => {
    if(isMobile && events != null){
      setHoverEvent((('location' in events[cardIndex] && 'location' in events[cardIndex]['location'] && 'latitude' in events[cardIndex]['location']['location']) ? "" + events[cardIndex]['location']['location']['latitude'] + "&" + events[cardIndex]['location']['location']['longitude'] : null));
    }
  }, [cardIndex]);


  return (
    <div className="app">
      <SearchBar currZip={currZip} updateZip={(newZip) => setCurrZip(newZip)} events={events} updatedHover={(newHover) => setHoverEvent(newHover)} locFilt={locFilt}/>
      {events !== null && isMobile &&
        <MobileList events={events} updatedHover={(newHover) => setHoverEvent(newHover)} locFilt={locFilt} cardIndex={cardIndex} updateCardIndex={(update) => setCardIndex(update)}/>
      }
      <Map currZip={currZip} events={events} hoverMarker={hoverEvent} selectLoc={(newLoc) => setLocFilt(newLoc)} locFilt={locFilt}/>
    </div>
  );
}

export default App;
