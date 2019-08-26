export function SearchBar(props){

  const[input, setInput] = useState(null);

  return(
    <div className={props.events != null ? "searchBar activeList" : "searchBar"}>
      <form onSubmit= {(event) => {
        event.preventDefault();
        props.updateZip(input)}} id = "zipForm">
        <input type="text" id="zipInput" value={props.currentSearch} onChange={(event) => setInput(event.target.value)} placeholder="ZIP" required minLength="5" maxLength="5"></input>
      </form>
      {props.events !== null &&
        <EventList events={props.events} updatedHover={(item) => props.updatedHover(item)}/>
      }
    </div>
  );
}

export default SearchBar;