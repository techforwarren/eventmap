import React, {useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import Map from './Map';
import './App.scss';

function App() {
  //List of events
  const [events, setEvents] = useState([]);
  //Current zip code search - input by user
  const [currZip, setCurrZip] = useState(null);
  //Current selected event
  const [highlightedEvent, setHighlightedEvent] = useState({});
  //Events that are within the map viewport.  These should be shown in the list
  const [inViewEvents, setInViewEvents] = useState({});

  // Load all of the events
  useEffect(() => {
      fetch("https://warren-events.s3.amazonaws.com/data/events.json")
      .then((res)=>res.json())
      .then((data)=>{
        setEvents(data)
      });
  }, []);

  useEffect(() => {
    // Use the mobilizemaerica api to look up zipcode to nearest event.
    if(currZip == null) return;
    fetch("https://api.mobilize.us/v1/organizations/1316/events?timeslot_start=gte_now&zipcode=" + currZip)
    .then((res)=>res.json())
    .then(res => {
      if (res.data && res.data.length > 0){
        let event = res.data[0]
        setHighlightedEvent({id: event.id, center:true})
      }

    })

    // Reset states on new zipcode
    setHighlightedEvent({});
  }, [currZip])

  return (
    <div className="app">
      <SearchBar currZip={currZip} updateZip={(newZip) => setCurrZip(newZip)} events={events} inViewEvents={inViewEvents} updatedHover={(newHover) => setHighlightedEvent(newHover)} highlightedEvent={highlightedEvent}/>
      <Map events={events} selectEvent={(newLoc) => setHighlightedEvent(newLoc)} highlightedEvent={highlightedEvent} inViewEvents={(keys) => setInViewEvents(keys)}/>
    </div>
  );
}

export default App;
