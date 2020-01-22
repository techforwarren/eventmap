import React, { useState } from 'react';
import EventList from './EventList';
import locateImage from './img/icon_512x512.png';


export function SearchBar(props){

  const [input, setInput] = useState(props.currZip || '');
  const[rangeInput, setRangeInput] = useState(props.currRange);

  // filters what events are displayed according to the kind of event
  const [eventKindInput, setEventKindInput] = useState(props.currEventKind || 'ALLEVENTS');

  function onlySetNumbers(event){
    let baseValue = event.target.value;
    let replacedVal = baseValue.replace(/\D*/g, '')
    setInput(replacedVal)
  }

  function geolocate(event) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // limit accuracy to 3 decimial points (~100m), for user privacy
        fetch("https://nominatim.openstreetmap.org/reverse?"+
          "lat="+position.coords.latitude.toFixed(3)+
          "&lon="+position.coords.longitude.toFixed(3)+
          '&format=jsonv2')
      .then((res)=>res.json())
      .then((data)=>{
          if(data.address && data.address.postcode) {
            setZip(data.address.postcode);
          }
        });
      }, (error) => {
        console.error(error);

      });
    }
  }

  function onSubmit(event){
    event.preventDefault();
    props.updateRange(rangeInput);  // calls setCurrRange() in App.js triggering a Mobilize API call and  a re-render
    setZip(input);
    /* ??? frm: Should I add a call to setEventKind() here?
     *          I don't think it necessary until I put the event kind in the URL...
     */         
  }

  function setRange(input){
    setRangeInput(input);       // updates local global state
    props.updateRange(input);   // calls setCurrRange() in App.js triggering a Mobilize API call and a re-render
  }

  function setEventKind(input) {
    setEventKindInput(input);       // update local global
    props.updateEventKind(input);   // update App.js global - triggering re-render of list of events
  }

  function setZip(input) {
    setInput(input);            // updates local state
    props.updateZip(input);     // calls setCurrZip() in App.js - triggering a Mobilize API call and a re-render
  }

  /* TODO: Decide on what kinds of events we should allow users to filter on.
   *
   * The list below is probably adequate, but it would make sense for some
   * product minded folks to think about what the right set of events
   * should be.
   *
   * Here is the list of events from the Mobilize API documentation:
   *
   * https://github.com/mobilizeamerica/api#event-object
   *
   *    The type of the event, one of:
   *        CANVASS, PHONE_BANK, TEXT_BANK, MEETING, COMMUNITY, FUNDRAISER,
   *        MEET_GREET, HOUSE_PARTY, VOTER_REG, TRAINING, FRIEND_TO_FRIEND_OUTREACH,
   *        DEBATE_WATCH_PARTY, ADVOCACY_CALL, RALLY, TOWN_HALL, OFFICE_OPENING,
   *        BARNSTORM, SOLIDARITY_EVENT, COMMUNITY_CANVASS, SIGNATURE_GATHERING,
   *        CARPOOL, OTHER.
   *    This list may expand.
   *
   * The subset of these events that I (Fred Mueller) chose to put in the code are:
   *
   *              CANVASS
   *              PHONE_BANK
   *              TEXT_BANK
   *              FUNDRAISER
   *              MEET_GREET
   *              HOUSE_PARTY
   *              TRAINING
   *              FRIEND_TO_FRIEND_OUTREACH
   *              DEBATE_WATCH_PARTY
   *              RALLY
   *              TOWN_HALL
   *              COMMUNITY_CANVASS
   *              CARPOOL
   *
   * Note that the events are not always categorized properly - for instance,
   * I found a couple of user generated events that were categorized as TRAINING
   * when they were actually for CANVASS, but I suppose there is nothing to be
   * done about that.
   *
   */

  return(
    <div className={(props.events != null ? "searchBar activeList" : "searchBar") + (props.deviceIsMobile ? " mobileSearch" : " desktopSearch")}>
      <div className="userInput">
        <form onSubmit={onSubmit} id="zipForm" data-has-input={!!input.length}>
          <label htmlFor="zipInput">ZIP</label>
          <input type="text" id="zipInput" defaultValue={input} onInput={onlySetNumbers} required minLength="5" maxLength="5"></input>
          <button id="submitZip" onClick={onSubmit}>GO</button>
        </form>
        <button id="locateMe" onClick={geolocate}><img src={locateImage} alt="Use my location"></img></button>
      </div>



      { props.events !== null &&

         <div className="userOptions">
           <div className="kindOfEvent">
             <select value={eventKindInput} onChange={(e) => setEventKind(e.target.value)}>
               <option value='ALLEVENTS'>All Events</option>
               <option value='CANVASS'>Canvass</option>
               <option value='PHONE_BANK'>Phone Bank</option>
               <option value='TEXT_BANK'>Text Bank</option>
               <option value='FUNDRAISER'>Fundraiser</option>
               <option value='MEET_GREET'>Meet and Greet</option>
               <option value='HOUSE_PARTY'>House Party</option>
               <option value='TRAINING'>Training</option>
               <option value='FRIEND_TO_FRIEND_OUTREACH'>Friend to Friend</option>
               <option value='DEBATE_WATCH_PARTY'>Watch Party</option>
               <option value='RALLY'>Rally</option>
               <option value='TOWN_HALL'>Town Hall</option>
               <option value='COMMUNITY_CANVASS'>Community Canvass</option>
               <option value='CARPOOL'>Car Pool</option>
             </select>
           </div>
           <div className="searchRange">
             <select value={rangeInput} onChange={(event) => setRange(event.target.value)}>
               <option value='5'>5 miles</option>
               <option value='10'>10 miles</option>
               <option value='20'>20 miles</option>
               <option value='50'>50 miles</option>
               <option value='75'>75 miles</option>
               <option value='120'>120 miles&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>
               {/* HACK: padding with spaces so that the visual width of searchRange matches that of kindOfEvent */}
             </select>
           </div>
         </div>
      }
      {props.events !== null && !props.deviceIsMobile &&
        <EventList events={props.events} locFilt={props.locFilt} eventKind={eventKindInput} updatedHover={(item) => props.updatedHover(item)}/>
      }
    </div>
  );
}

export default SearchBar;
