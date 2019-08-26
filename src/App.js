import React, {useState, useEffect, useRef} from 'react';
import L from 'leaflet';
import moment from 'moment';
import SearchBar from './SearchBar';
import Map from './Map';
import './App.scss';

export function App() {
  const [events, setEvents] = useState(null);
  const [currZip, setCurrZip] = useState(null);
  const [hoverEvent, setHoverEvent] = useState(null);

  //Makes API call when zipcode entered
  useEffect(() => {

    if(currZip != null){
      fetch("https://api.mobilize.us/v1/organizations/1316/events?timeslot_start=gte_now&zipcode=" + currZip)
      .then((res)=>res.json())
      .then((data)=>setEvents(data['data']));
    }


  }, [currZip]);

  return (
    <div className="app">
      <SearchBar currZip={currZip} updateZip={(newZip) => setCurrZip(newZip)} events={events} updatedHover={(newHover) => setHoverEvent(newHover)}/>
      <Map currZip={currZip} events={events} hoverMarker={hoverEvent}/>
    </div>
  );
}

export default App;
