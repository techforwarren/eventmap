import React, { useState } from 'react';
import EventList from './EventList';

export function SearchBar(props){

  const[input, setInput] = useState(null);

  function onlySetNumbers(event){
    let baseValue = event.target.value;
    let replacedVal = baseValue.replace(/\D*/g, '')
    console.log(`baseValue: ${baseValue}, replacedVal: ${replacedVal}`);
    setInput(replacedVal)
  }

  function onSubmit(event){
    event.preventDefault();
    props.updateZip(input)
  }

  return(
    <div className={props.events != null ? "searchBar activeList" : "searchBar"}>
      <form onSubmit= {onSubmit} id = "zipForm">
        <input type="text" id="zipInput" value={input} onChange={onlySetNumbers} placeholder="ZIP" required minLength="5" maxLength="5"></input>
      </form>
      {props.events !== null &&
        <EventList events={props.events} locFilt={props.locFilt} updatedHover={(item) => props.updatedHover(item)}/>
      }
    </div>
  );
}

export default SearchBar;
