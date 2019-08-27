import React from 'react';
import moment from 'moment';
import groupBy from 'lodash.groupby';
import sortBy from 'lodash.sortby';
require('twix');


export function EventList(props) {
  const listEvents = props.events.map((event) => {

    // Convert the raw time into a 
    let rawTimes = event['timeslots'].map((timeslot) => {
      let start = moment(timeslot.start_date * 1000);
      let end = moment(timeslot.end_date * 1000);
      return {
        start, end,
        range: start.twix(end)
      }
    })

    let sortedTimes = groupBy(sortBy(rawTimes,
      // Sort all of the ranges by when they start
      // Unix returns the millisecond time, so all
      // events will be different
      (item) => { return item.start.unix() }),
      // Group the ranges by the day they happen on
      // date() returns the moment's day of the month,
      // so all options on the same day will come 
      // out the same
      (item) => { return item.start.date() }
    )

    // Build out times like "Monday Sep 16 | 6 - 8:30 PM"
    let timeElts = Object.keys(sortedTimes).sort().map((day) => {
      let times = sortedTimes[day];
      let dayStr = times[0].start.format('dddd MMM D')
      let timeStrs = times.map((time) => time.range.format({ hideDate : true })).join(', ')
      return (
        <p key={`time-${day}`}>
          { dayStr }{' | '}{ timeStrs }
        </p>
      )
    })

    return (
      <a href={event['browser_url']} className="eventCard" target="_blank" key={event['id']} coord={('location' in event && 'location' in event['location'] && 'latitude' in event['location']['location']) ? "" + event['location']['location']['latitude'] + "&" + event['location']['location']['longitude'] : ""} onMouseEnter={(event) => { props.updatedHover(event['currentTarget'].getAttribute('coord')) }} onMouseLeave={(event) => { props.updatedHover(null) }}>
        <li>
          <div>
            <h3>{event['title']}</h3>
            <p>{event['location']['venue']}</p>
            <p>{event['location']['locality']}</p>
            { timeElts }
            <p className="eventRSVP">Click to RSVP</p>
          </div>
        </li>
      </a>

    )
  });

  return (
    <ul className="eventList">{listEvents}</ul>
  );
}

export default EventList;