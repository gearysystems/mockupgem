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

VALID_UUID=5415ee81-e5ce-4e84-892f-ae85e4e76d0b

# TODO: Tests for error cases.
echo "This should be successful."
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"templates": ["iphone6_iwatch_businessman"]}' \
  $URL/api/v1/screenshots/$VALID_UUID/mockups
echo ""
