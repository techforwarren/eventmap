/*
 * A place to put stateless utility functions that we
 * want to be available generally
 */

export function eventHasValidLocation(event) {
    /*
     * Returns true iff the given event (returned by a call to the Mobilize API)
     * has a valid location - meaning that it has a value for latitude.  We assume
     * that if it has a value for latitude, then it also has one for longitude.
     */
    console.log("eventHasValidLocation called");
    return ('location' in event && 'location' in event['location'] && 'latitude' in event['location']['location']);
}

