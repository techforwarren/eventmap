import React, {useState, useEffect } from 'react';
import {isMobile} from 'react-device-detect';
import History from './History';
import SearchBar from './SearchBar';
import Map from './Map';
import MobileList from './MobileList';
import './App.scss';
import gMark from './img/w-marker-icon-2x.png';
import { eventHasValidLocation } from './Util';

import ReactGA from 'react-ga';
ReactGA.initialize('UA-149839620-1');
ReactGA.pageview(window.location.pathname + window.location.search);

const queryString = require('query-string');

/*
 * Overview of the entire app
 *
 * Global state is maintained in this file, App.js.  Other components
 * can update that state (via functions passed to those components), but 
 * for the most part, the other components are just expected to do what
 * they do and report back.  An example is the way the SearchBar works.
 * It gathers user input and then sets global state (such as the current
 * zip code) using routines passed in by App.js - in this case, setCurrZip().
 * The actual persistent global state is maintained in App.js.
 *
 * App.js does the API call to Mobilize to get events that match the current
 * search criteria - at the time of this writing (Dec. 2019), the criteria are 
 * zip code and distance away from that zip code in miles.
 *
 * Client side filtering of that list of events is also done in this 
 * code (App.js), such as filtering for a particular kind of event (like
 * canvassing or phone-banking).  The rest of the code is fed the filtered
 * list of events to display to the user.
 * 
 */

const deviceIsMobile = isMobile;        // HACK to allow easy mocking of isMobile for testing/debugging

function App() {

  //List of events returned from the Mobilize API
  const [events, setEvents] = useState(null);

  // List of events after client-side filtering of the list of events returned from the Mobilize API
  const [filteredEvents, setFilteredEvents] = useState(null);  

  /*
   * URL parameters:
   *
   * At present, January 2020, there are three URL parameters:
   *    zip : the current zip code (default is null)
   *    eventkind : the current kind of event (default is ALLEVENTS)
   *    distance : the current distance/radius from current zip code (default is 75 miles)
   *
   * We initialize state variables from the URL, and we update the URL every time
   * the user changes one of the filter parameters.  Note that all of this logic
   * is contained in the App.js source.  Note also that we wrap the setXXX() useState
   * functions in updateXXX functions - so do NOT use the setXXX functions directly.
   */

  function updateURL(whichParam, newValue) {

    // Get the existing values
    const qs = queryString.parse(History.location.search);
    let zip = qs.zip;
    let eventKind = qs.eventkind;
    let distance = qs.distance;

    // Change the appropriate value
    switch(whichParam) {
      case 'zip':
        zip = newValue;
        break;
      case 'eventkind':
        eventKind = newValue;
        break;
      case 'distance':
        distance = newValue;
        break;
      default:
        // code block
        console.log("Warning: updateURL in App.js - bad value for whichParam: " + whichParam);
    }

    // Update the URL
    History.push(
      window.location.pathname 
      + "?zip=" + (zip ? zip : "") 
      + "&eventkind=" + (eventKind ? eventKind : "") 
      + "&distance=" + (distance ? distance : "")
      ); 
  }


  // Current range - distance in miles from the target zip code
  const [currRange, setCurrRange] = useState(() => {
    // check URL parameter on initialization
    const qs = queryString.parse(History.location.search);
    let distance = qs.distance;
    if (!distance) {
      distance = 75;  // default distance is 75 miles
      updateURL('distance', distance);
    }
    return distance;
  });

  function updateCurrRange(newDistance) {
    setCurrRange(newDistance);  // update useState global

    // Update URL
    updateURL('distance', newDistance);
  }

  // Current kinds of events to display
  const [currEventKind, setCurrEventKind] = useState(() => {
    // check URL parameter on initialization
    const qs = queryString.parse(History.location.search);
    let eventKind = qs.eventkind;
    if (!eventKind) {
      eventKind = 'ALLEVENTS';  // default is ALLEVENTS
      updateURL('eventkind', eventKind);
    }
    return eventKind;
  });

  function updateCurrEventKind(newEventKind) {
    setCurrEventKind(newEventKind); 
    updateURL('eventkind', newEventKind);
  }

  //Current zip code search
  const [currZip, setCurrZip] = useState(() => {
    // check URL parameter on initialization
    const qs = queryString.parse(History.location.search);
    return (qs.zip ? qs.zip : "");
  });

  function updateCurrZip(newZip) {
    setCurrZip(newZip); 
    updateURL('zip', newZip);
  }

  //Current event being hovered over (in the event list)
  const [hoverEvent, setHoverEvent] = useState(null);

  //Current selected location location filter
  //  When set, only events at the single location will be shown
  //  Set by a user clicking on a marker in the map, unset by a user clicking elsewhere on the map
  const [locFilt, setLocFilt] = useState(null);

  //For mobile, the current card
  const [cardIndex, setCardIndex] = useState(null);

  //Makes API call when zipcode entered or the range is updated
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

  /* 
   * Filters the events when there are new events from the API or 
   * when the user changes filtering criteria
   */
  useEffect(() => {

     if (!events){
         setCardIndex(null);             // no events, hence no valid cardIndex
         setFilteredEvents(null);        // no events, hence no filtered events
         return;
     }

     setCardIndex(0);   // reset to the first event in the list

     // if ALLEVENTS then return everything, otherwise filter on the current kind of event
     setFilteredEvents(events.filter((event) => {
         return ((currEventKind === 'ALLEVENTS') || (currEventKind === event['event_type']));
     }));
   }, [events, currEventKind]);
   

  /* 
   * If the cardIndex changes, then reset the event whose 
   * marker is highlighted, by calling setHoverEvent()
   */
  useEffect(() => {
    if (deviceIsMobile && filteredEvents != null) {
      setHoverEvent(
        eventHasValidLocation(filteredEvents[cardIndex]) 
        ? "" + filteredEvents[cardIndex]['location']['location']['latitude'] 
             + "&" + filteredEvents[cardIndex]['location']['location']['longitude'] 
        : null);
    }
  }, [cardIndex]);

  // Note that the code passes {filteredEvents} to other components rather than {events}.
  //      This shields the rest of the code from having to know and worry about client-side filtering - that
  //      code just operates on the list of events passed to it.

  return (
    <div className={deviceIsMobile ? "app appIsMobile" : "app appIsDesktop"}>
      <SearchBar 
        currZip={currZip} 
        currRange={currRange} 
        currEventKind={currEventKind} 
        updateZip={(newZip) => updateCurrZip(newZip)} 
        updateRange={(newRange) => updateCurrRange(newRange)} 
        updateEventKind={(newEventKind) => updateCurrEventKind(newEventKind)} 
        events={filteredEvents} 
        updatedHover={(newHover) => setHoverEvent(newHover)} 
        locFilt={locFilt} 
        deviceIsMobile={deviceIsMobile}
      />
      {events === null && currZip == null &&
        <div id="startLoad">
          <h1 id="firstLine">SHE HAS</h1><h1 id="secondLine">EVENTS</h1><h1 id="thirdLine">FOR THAT <img src={gMark} alt=""></img></h1>
          <h3 id="searchCTA">Enter your zipcode to find events near you!</h3>
        </div>
      }
      <Map currZip={currZip} events={filteredEvents} hoverMarker={hoverEvent} selectLoc={(newLoc) => setLocFilt(newLoc)} locFilt={locFilt}/>
      {filteredEvents !== null && deviceIsMobile &&
        <MobileList 
          events={filteredEvents} 
          updatedHover={(newHover) => setHoverEvent(newHover)} 
          locFilt={locFilt} 
          selectLoc={(newLoc) => setLocFilt(newLoc)} 
          cardIndex={cardIndex} 
          updateCardIndex={(update) => setCardIndex(update)} 
          />
      }
    </div>
  );
}

export default App;
