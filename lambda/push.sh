#!/bin/bash
FILENAME=overlay_image_lambda.zip

rm $FILENAME
zip -r $FILENAME *
aws lambda update-function-code \
  --function-name overlayImage \
  --zip-file fileb://$FILENAME \
  --publish
