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


/*
 * ORIGINAL CODE - I am leaving this in because the logic is tangled enough that I want to 
 *                 make sure that I am not inadvertently leaving something important out.
 *
 *                 When I have tested the new code, this should be deleted.
 *
 * 

   //Mobile's location filter doesn't filter but moves the currentIndex to the location's first event
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
 
 *
 *
 *
 * END OF ORIGINAL CODE
 *
 */

  //Mobile's location filter doesn't filter but moves the currentIndex to the location's first event
  useEffect(() => {

    /*
     * If the location filter (locFilt) has changed then reset the cardIndex global.
     *
     * The location filter changes when the user clicks on a marker on the map.  In this case we
     * set the cardIndex to the first event in the list of events that has the same lat/long
     * as the event the user clicked on (the click stores that event's lat/long in locFilt).
     *
     */

    /*
     * Implementation note (12/19/2019): I changed the logic - hopefully I improved it... (Fred Mueller)
     *
     * The logic before the changes I made today (pretty-printed and with comments) follows.

        if
          (   !('location' in props.events[props.cardIndex])                                                    // does nothing (1)
           || !('location' in event['location'])                                                                // does nothing (2)
           || props.events[props.cardIndex]['location']['location']['latitude'] !== props.locFilt['lat']        // lat/long differs
           || props.events[props.cardIndex]['location']['location']['longitude'] !== props.locFilt['lng']
          )
        {
          if('location' in event && 'location' in event['location'] && 'latitude' in event['location']['location'])
          {
            if
              (   event['location']['location']['latitude']  === props.locFilt['lat'] 
               && event['location']['location']['longitude'] === props.locFilt['lng'])
            {
              props.updateCardIndex(x);         // set cardIndex to first event that matches lat/long
              x = props.events.length;
            }
          }
        }

     * 
     * The line labeled "does nothing (1)" prevents this code from doing anything if the event identifiied by 
     * the current cardIndex does not have a valid location.  This seems clearly wrong - we WANT the event 
     * identified by the current cardIndex to have a valid location - it would be a bug if it did not have
     * a valid location.  I have checked the code and it seems to me that the code ensures that the cardIndex
     * always points to an event with a valid location, so this is benign, but also needless.  
     *
     * What "does nothing (1)" appears to be doing is acting as a guard for the following lines that extract
     * the lat/long from the event identified by the cardIndex.
     *
     * The line labeled "does nothing (2)" prevents the code from doing anything if the next event in the 
     * loop does not have a valid location.  However, this same condition is checked in the if-stmt below,
     * so the check for "does nothing (2)" is at best not necessary (but it is also not a complete check
     * because it does not check that there is a valid lat/long).  It also does not act as a guard for
     * anything later in the if-stmt condition.  Note that the lack of a full check for a lat/long ended
     * up being a crash bug - see the note at the end of this long comment below.
     * 
     * The line labeled "lat/long differs" (and the next line) prevent the code from doing anything if
     * the event currently identified by cardIndex has the same lat/long as the new location filter.
     * This could only happen if the user clicked on the map on the same marker.  This would be an odd
     * thing for the user to do, but it is possible - the question is what the code should do in this
     * case.  The original/existing code did not reset the cardIndex in this case, which means that 
     * the card displayed to the user would not change (and the effect of next/previous buttons would
     * also not change).  Stated differently, the original/existing code would make the user's click
     * be a no-op.  I intend to simplify the logic by removing this criteria with the change in 
     * behavior being that if a user clicks on the same marker, the cardIndex will be reset to the
     * first event at that location.  I don't think any users will notice the difference, but I would
     * argue that the new behavior is better - the click actually does something and it always does
     * the same thing, namely resetting to the first event at that marker.
     *
     * All of this boils down to me removing this entire condition.  The new code will just validate
     * that the new locFilt has valid lat/long and then reset the cardIndex to the first event in
     * the list that matches that lat/long.
     * 
     * Lastly, there was a bug in the code that caused a crash when the event identified by the current
     * cardIndex was private.  This can happen when you use the next and previous buttons to go through
     * the list of events (including both those that are private and those that are not).  If you 
     * happen to be looking at a private event (cardIndex identifying a private event) then if you
     * click on another marker, the code will try to access the lat/long of the existing event
     * and blow up when it realizes there isn't a lat/long.  The changes to the code above fix
     * that because the new code doesn't care what the existing cardIndex points at - it always
     * just resets the cardIndex to the newly clicked on event (which must have a lat/long because
     * in order to be clickable it is on the map, and it cannot be on the map without a lat/long).
     *
     */

    if (props.locFilt !== null) {

      let cardIndexEvent = props.events[props.cardIndex];  // the event that the cardIndex currently points to

      // Reset the cardIndex to the first event that matches the location of the locFilt location
      for(let x = 0; x < props.events.length; x++) {
        let event = props.events[x];

        if (
          ('location' in event && 'location' in event['location'] && 'latitude' in event['location']['location']) && 
            (event['location']['location']['latitude'] === props.locFilt['lat'] || 
             event['location']['location']['longitude'] === props.locFilt['lng']))
        {
          // We have found the first event in the list that has the sae lat/long as the new location filter
          props.updateCardIndex(x);         // set the cardIndex to the index of the matching event
          x = props.events.length;          // fast forward to exit the loop
        }
      }
    }
  }, [props.locFilt])


  let listEvents = {};
  if(props.events.length > 0){
    listEvents = props.events.map((event, index) => {

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
          rel="noopener"
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
  } else {
      return <div className="mobileList">
      <div className="eventCard">
        <div className="mobileInfo">
          <h3>Don't see an event near you?</h3>
          <p><a href="https://events.elizabethwarren.com/?is_virtual=true">Join a virtual event</a></p> 
          <p><a href="https://events.elizabethwarren.com/event/create/">Host your own event</a></p>
        </div>
      </div>
    </div>
      
  }

  //Conditional rendering for buttons, depending on position in list
  if(props.events.length > 0){
    return (
      <div className="mobileList">
        {listEvents[props.cardIndex]}
        {
          props.cardIndex > 0 &&
          <button id="leftIndex" onClick={() => props.updateCardIndex(props.cardIndex-1)}>← </button>
        }
        <button id="mobileRSVP"><a href={props.events[props.cardIndex]['browser_url']} target="_blank" rel="noopener">RSVP</a></button>
        {
          props.cardIndex < listEvents.length-1 &&
          <button id="rightIndex" onClick={() => props.updateCardIndex(props.cardIndex+1)}> →</button>
        }

      </div>
    );
  }
}

export default MobileList;
