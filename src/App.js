import React, {useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import Map from './Map';
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

  //Makes API call when zipcode entered
  useEffect(() => {
    if(currZip != null){
      fetch("https://api.mobilize.us/v1/organizations/1316/events?timeslot_start=gte_now&zipcode=" + currZip)
      .then((res)=>res.json())
      .then((data)=>setEvents(data['data']));

      //Reset states on new zipcode
      setHoverEvent(null);
      setLocFilt(null);

    }
  }, [currZip]);

  return (
    <div className="app">
      <SearchBar currZip={currZip} updateZip={(newZip) => setCurrZip(newZip)} events={events} updatedHover={(newHover) => setHoverEvent(newHover)} locFilt={locFilt}/>
      <Map currZip={currZip} events={events} hoverMarker={hoverEvent} selectLoc={(newLoc) => setLocFilt(newLoc)} locFilt={locFilt}/>
    </div>
  );
}

export default App;
