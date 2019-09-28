import React, {useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import Map from './Map';
import './App.scss';

function App() {
  //List of events
  const [events, setEvents] = useState([]);
  //Current zip code search - input by user
  const [currZip, setCurrZip] = useState(null);
  //Current event being hovered over
  const [hoverEvent, setHoverEvent] = useState(null);
  //Current selected location location filter
  const [locFilt, setLocFilt] = useState(null);

  const [nearby, setNearby] = useState(null);

  //Makes API call when zipcode entered
  useEffect(() => {

      fetch("https://gist.githubusercontent.com/mick/6c85985bbaee7419b6351501edd05de0/raw/f41482f485d3390516c390180c841c25b4213987/events.json")
      .then((res)=>res.json())
      .then((data)=>setEvents(data));

      //Reset states on new zipcode
      setHoverEvent(null);
      setLocFilt(null);

  }, []);

  return (
    <div className="app">
      <SearchBar nearby={nearby} currZip={currZip} updateZip={(newZip) => setCurrZip(newZip)} events={events} updatedHover={(newHover) => setHoverEvent(newHover)} locFilt={locFilt}/>
      <Map currZip={currZip} events={events} hoverMarker={hoverEvent} selectLoc={(newLoc) => setLocFilt(newLoc)} locFilt={locFilt}/>
    </div>
  );
}

export default App;
