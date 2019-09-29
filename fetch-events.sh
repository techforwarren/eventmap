#!/usr/bin/env bash

set -ex

python3 events/fetch.py all-events.json

python3 events/filter.py all-events.json events.json

gzip events.json

aws s3 cp events.json.gz $S3_PATH/events.json --acl public-read --metadata "Content-Encoding=gzip,Content-Type=application/json"

