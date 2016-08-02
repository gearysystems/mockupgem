# !/bin/bash

URL=localhost:3000
if [ "$PRODUCTION" == "true" ]
then
 URL=http://mockupgem.gearysystems.com
fi

SAMPLE_IMAGE=$1
if ["$SAMPLE_IMAGE" == ""]
then
  SAMPLE_IMAGE=screenshot.png
fi

VALID_UUID=1c9e7312-f519-48cf-a3b0-664677a0d3e1

# TODO: Tests for error cases.
echo "This should be successful."
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"templates": ["iphone6_iwatch_businessman"]}' \
  $URL/api/v1/screenshots/0a80d315-8470-46e2-9bf8-1e6010823c34/mockups
echo ""
