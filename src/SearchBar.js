import React, { useState } from 'react';
// import {isMobile} from 'react-device-detect';  // commented out because this is now passed in via props.deviceIsMobile
import EventList from './EventList';
import History from './History';
import locateImage from './img/icon_512x512.png';


export function SearchBar(props){
  const [input, setInput] = useState(props.currZip || '');
  const[rangeInput, setRangeInput] = useState(props.currRange);

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
    props.updateRange(rangeInput);
    setZip(input);
  }

  function setRange(input){
    setRangeInput(input);
    props.updateRange(input);
  }

  function setZip(input) {
    setInput(input);
    props.updateZip(input);
    History.push(window.location.pathname+'?zip='+input);
  }

  return(
    <div className={(props.events != null ? "searchBar activeList" : "searchBar") + (props.deviceIsMobile ? " mobileSearch" : "")}>
      <div className="userInput">
        <form onSubmit={onSubmit} id="zipForm" data-has-input={!!input.length}>
          <label for="zipInput">ZIP</label>
          <input type="text" id="zipInput" value={input} onInput={onlySetNumbers} required minLength="5" maxLength="5"></input>
          <button id="submitZip" onClick={onSubmit}>GO</button>
        </form>
        <button id="locateMe" onClick={geolocate}><img src={locateImage} alt="Use my location"></img></button>
      </div>
      
      { props.events !== null &&
            <div className="searchRange">
            <p>Showing events within
              <select value={rangeInput} onChange={(event) => setRange(event.target.value)}>
                <option value='5'>5 mi</option>
                <option value='10'>10 mi</option>
                <option value='20'>20 mi</option>
                <option value='50'>50 mi</option>
                <option value='75'>75 mi</option>
                <option value='120'>120 mi</option>
              </select>
            </p>
        </div>

      }

     
      {props.events !== null && !props.deviceIsMobile &&
        <EventList events={props.events} locFilt={props.locFilt} updatedHover={(item) => props.updatedHover(item)}/>
      }
    </div>
  );
}

export default SearchBar;
