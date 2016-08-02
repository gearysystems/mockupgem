#!/bin/bash

# Sync clock before deploying because amazon signatures are sensitive to time skew
sudo ntpdate -u time.apple.com


FILENAME=overlay_image_lambda.zip

rm $FILENAME
zip -r $FILENAME *
aws lambda update-function-code \
  --function-name generateMockups \
  --zip-file fileb://$FILENAME \
  --publish
