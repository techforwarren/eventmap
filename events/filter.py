import json
import sys

events = []

if len(sys.argv) < 3:
    print("usage: filter.py <input file> <output file>")
    exit()

with open(sys.argv[1]) as f:
    events = json.loads(f.read())

slim_events = []

for e in events:

    # if the event doesnt have a location then we can skip it.
    if 'location' not in e['location'] or 'latitude' not in e['location']['location'] or e['location']['location']['latitude'] is None:
        continue

    # remove attributes we arent going to display.
    del e['location']['congressional_district']
    del e['location']['state_leg_district']
    del e['location']['state_senate_district']

    slim_events.append({
        'id': e['id'],
        'browser_url': e['browser_url'],
        'location': e['location'],
        'title': e['title'],
        'timeslots': e['timeslots'][0:3],
        'timeslot_count': len(e['timeslots']),
        'featured_image_url': e['featured_image_url'],
        'event_type': e['event_type']
    })

with open(sys.argv[2], 'w') as f:
    f.write(json.dumps(slim_events))