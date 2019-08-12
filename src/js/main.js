//https://api.mobilize.us/v1/organizations/1316/events?timeslot_start=gte_now&zipcode=03229

var map;



$(document).ready(function(){

  var center = [39.8283, -98.5795];

  // Create the map with US center
  map = L.map('map', {
    zoomControl:false
  }).setView(center, 4);

  // Set up the OSM layer
  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

  L.control.zoom({
       position:'topright'
  }).addTo(map);



  //On form input
  $("#zipForm").on("submit", function (e) {
    e.preventDefault();
    getEvents(e['currentTarget'][0]['value']);
  });

});

//Assumes valid zipcode input
function getEvents(zipCode){
  $.get("https://api.mobilize.us/v1/organizations/1316/events?timeslot_start=gte_now&zipcode="+zipCode)
    .then(data => mapEvents(data['data']));
}


/*

mapEvents clears the current map, takes {events} paramater (typically a JSON response of all events for a given zipcode), and creates markers for them on map.

Currently, for locations with multiple events over time, a marker for that location will list all events at that location.

Test Cases (need to write):

First item in {events} has no long or lat
Bunch of unique valid in {events}
Some have same address in {events}
Empty {events}
One item in {events}
Some have no address in {events}
All have no address in {events}
Some have junk data (no/incorrect lat long)
Some are too far away from zip code

*/

function mapEvents(events){
  //Resets map for new event map list
  map.remove();

  //Initiates map's focus at the first event (typically the closest to the provided zipcode) with a valid lat & long position
  let first = 0;
  if(!('location' in events[first]) || !('location' in events[first]['location']) || !('latitude' in events[first]['location']['location'])){
    first++;
  }
  var center = [events[first]['location']['location']['latitude'], events[first]['location']['location']['longitude']];
  map = L.map('map', {
    zoomControl:false
  }).setView(center, 8);


  //Sets up initial map with attribution
  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

  //Gets location dictionary ready
  var places = {};

  events.forEach(function(event, index){

    //If has longitude and latitute
    if('location' in event && 'location' in event['location'] && 'latitude' in event['location']['location']){

      //Creates string key for {places} dictionary
      let str = event['location']['location']['latitude'] + "&" + event['location']['location']['longitude'];
      console.log(event);
      //Creates or adds to a location - adds HTML code for event list for that location
      if(str in places){
        places[str] = places[str] + "\n<div class=\"eventCard\" id="+event['id']+"><a href="+ event['browser_url'] + "><div class=\"eventCard\">"+ "<h3>"+event['title']+"</h3></div></a></div>";
      } else {
        places[str] = "<div class=\"eventCard\" id="+event['id']+"><a href="+ event['browser_url'] + "><div>"+ "<h3>"+event['title']+"</h3></div></a></div>";
      }

    }


  });

  //Goes through all locations and plots them on the map
  for(prop in places){

    let cord = prop.split("&");

    L.marker([parseFloat(cord[0]), parseFloat(cord[1])]).addTo(map)
      .bindPopup(places[prop]);

  }


}
