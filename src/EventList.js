import React from 'react';
import moment from 'moment';
require('twix');

//Needs work
function getTime(time){
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var date = new Date(time*1000);

  var testTime = date.getTime();

  testTime += (3600000*-7)

  var newDate = new Date(testTime);

  return newDate.toLocaleString();
}

export function EventList(props){
  console.log('props.events in EventList: ',props.events);
  const listEvents = props.events.map((event) => {

    // Group the ranges by the day they happen on
    let slotRanges = event['timeslots'].map((timeslot) => {
      let start = moment(timeslot.start_date);
      let end = moment(timeslot.end_date);
      return {
        start, end,
        range : start.twix(end)
      }
    })

    // Sort each group by start date

    // Concat Weekday Day, Mo: start-end, start-end, start-end
    return (
      <a href={event['browser_url']} className="eventCard" target="_blank" key={event['id']} coord={('location' in event && 'location' in event['location'] && 'latitude' in event['location']['location']) ? "" + event['location']['location']['latitude'] + "&" + event['location']['location']['longitude'] : ""} onMouseEnter={(event) => {props.updatedHover(event['currentTarget'].getAttribute('coord'))}} onMouseLeave={(event) => {props.updatedHover(null)}}>
        <li>
          <div>
            <p>{/*getTime(event['timeslots'][0]['start_date'])*/}</p>
            <h3>{event['title']}</h3>
            <p></p>
            <p>{event['location']['venue']}</p>
            <p>{event['location']['locality']}</p>
            <p className="eventRSVP">Click to RSVP</p>
          </div>
        </li>
      </a>
  
    )
  });

  return(
    <ul className="eventList">{listEvents}</ul>
  );
}

export default EventList;