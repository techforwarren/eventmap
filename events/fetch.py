import requests
import time
import json
import sys

if len(sys.argv) < 2:
    print('usage: fetch.py <output file>')
    exit()

mobilize_api_events_url = 'https://api.mobilize.us/v1/organizations/1316/events?timeslot_start=gte_now&is_virtual=false&per_page=100'

next = mobilize_api_events_url

events = []

while next is not None:

    r = requests.get(next)
    resp = r.json()
    events += resp['data']
    next = resp['next']
    print('requested {}  next {}'.format(r.url, next))
    # be nice to the api
    time.sleep(5)


with open(sys.argv[1], 'w') as f:
    f.write(json.dumps(events))