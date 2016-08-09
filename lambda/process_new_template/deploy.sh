#!/bin/bash

# Sync clock before deploying because amazon signatures are sensitive to time skew
sudo ntpdate -u time.apple.com

FILENAME=process_new_template.zip

rm $FILENAME
zip -r $FILENAME *
aws lambda update-function-code \
  --function-name processNewTemplate \
  --zip-file fileb://$FILENAME \
  --publish
