import React, { useState } from 'react';
import {isMobile} from 'react-device-detect';
import EventList from './EventList';
import History from './History';

export function SearchBar(props){
  const[input, setInput] = useState(props.currZip);

  function onlySetNumbers(event){
    let baseValue = event.target.value;
    let replacedVal = baseValue.replace(/\D*/g, '')
    console.log(`baseValue: ${baseValue}, replacedVal: ${replacedVal}`);
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
          console.log(data);
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
    setZip(input);
  }

  function setZip(input) {
    setInput(input);
    props.updateZip(input);
    History.push(window.location.pathname+'?zip='+input);
  }


  return(
    <div className={(props.events != null ? "searchBar activeList" : "searchBar") + (isMobile ? " mobileSearch" : "")}>
      <div className="userInput">
        <form onSubmit= {onSubmit} id = "zipForm">
          <input type="text" id="zipInput" value={input} onChange={onlySetNumbers} placeholder="ZIP" required minLength="5" maxLength="5"></input>
        </form>
        <button id="locateMe" onClick={geolocate}>{'\u25CE'}</button>
      </div>
      {props.events !== null && !isMobile &&
        <EventList events={props.events} locFilt={props.locFilt} updatedHover={(item) => props.updatedHover(item)}/>
      }
    </div>
  );
}

export default SearchBar;
