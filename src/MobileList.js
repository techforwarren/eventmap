import React, { useEffect } from 'react';
import moment from 'moment';
import groupBy from 'lodash.groupby';
import sortBy from 'lodash.sortby';
require('twix');

const MAX_DAYS_IN_LIST = 1;

function EventTimes(props) {
  const { rawTimes } = props;
  let sortedTimesByDate = groupBy(sortBy(rawTimes,
    // Sort all of the ranges by when they start;
    // Unix returns the millisecond time, so all
    // events will be different
    (item) => { return item.start.unix() }),
    // Group the ranges by the day they happen on;
    // fully including the year, month, and day
    // in that order guarantees that normal sorting
    // will respect 9/31 v 10/1, and 2020/01 vs 2019/12
    (item) => { return item.start.format('YYYY-MM-DD') }
  )

  let sortedDates = Object.keys(sortedTimesByDate).sort();

  const dateRowFactory = (date) => {
    let times = sortedTimesByDate[date];
    let dayStr = times[0].start.format('ddd M/D')
    let timeStrs = times.map((time) => time.range.format({ hideDate : true })).join(', ')
    return (
      <p key={`time-${date}`}>
        { dayStr }{' | '}{ timeStrs }
      </p>
    )
  }

  if (sortedDates.length <= MAX_DAYS_IN_LIST) {
    return sortedDates.map(dateRowFactory)
  } else {
    let nextDay = sortedDates[MAX_DAYS_IN_LIST - 1];
    let lastDay = sortedDates[sortedDates.length - 1];
    let nextStart = sortedTimesByDate[nextDay][0].start;
    let lastStart = sortedTimesByDate[lastDay][0].start;
    return sortedDates.slice(0,MAX_DAYS_IN_LIST - 1).map(dateRowFactory).concat(
      <p>
        More Times from {nextStart.twix(lastStart, { allDay : true }).format()}
      </p>
    )
  }
}

export function MobileList(props){

  //Mobile's location filter doesn't filter but moves the currentIndex to the location's first event
  useEffect(() => {

    //Location filter
    if(props.locFilt != null){

      for(let x = 0; x < props.events.length; x++) {
        let event = props.events[x];
        if(!('location' in props.events[props.cardIndex]) || !('location' in event['location']) || props.events[props.cardIndex]['location']['location']['latitude'] !== props.locFilt['lat'] || props.events[props.cardIndex]['location']['location']['longitude'] !== props.locFilt['lng']){
          if('location' in event && 'location' in event['location'] && 'latitude' in event['location']['location']){
            if(event['location']['location']['latitude'] === props.locFilt['lat'] && event['location']['location']['longitude'] === props.locFilt['lng']){
              props.updateCardIndex(x);
              x = props.events.length;
            }
          }
        }
      }
    }
  }, [props.locFilt])



  const listEvents = props.events.map((event, index) => {

    // Normalize Mobilize's time formatting into
    // easy-to-use moments
    let rawTimes = event['timeslots'].map((timeslot) => {
      let start = moment(timeslot.start_date * 1000);
      let end = moment(timeslot.end_date * 1000);
      return {
        start, end,
        range: start.twix(end)
      }
    })

    return (
      <a href={event['browser_url']}
        className="eventCard"
        target="_blank"
        rel="noopener noreferrer"
        key={event['id']}
        coord={('location' in event && 'location' in event['location'] && 'latitude' in event['location']['location']) ? "" + event['location']['location']['latitude'] + "&" + event['location']['location']['longitude'] : ""}
        onMouseEnter={(event) => { props.updatedHover(event['currentTarget'].getAttribute('coord')) }}
        onMouseLeave={(event) => { props.updatedHover(null) }}>
        <div className="mobileInfo">
          <h3>{event['title']}</h3>
          <p><strong>{event['location']['venue']}</strong> in <strong>{event['location']['locality']}</strong></p>
          <EventTimes rawTimes={rawTimes} />
          <p className="eventRSVP">Click to RSVP</p>
        </div>

      </a>

    )
  }).filter((arrItem) => {
    return arrItem != null;
  });

  //Conditional rendering for buttons, depending on position in list
  return (
    <div className="mobileList">
      {listEvents[props.cardIndex]}
      {
        props.cardIndex > 0 &&
        <button id="leftIndex" onClick={() => props.updateCardIndex(props.cardIndex-1)}>← </button>
      }
      <button id="mobileRSVP"><a href={props.events[props.cardIndex]['browser_url']} target="_blank" rel="noopener noreferrer">RSVP</a></button>
      {
        props.cardIndex < listEvents.length-1 &&
        <button id="rightIndex" onClick={() => props.updateCardIndex(props.cardIndex+1)}> →</button>
      }

    </div>
  );
}

export default MobileList;
