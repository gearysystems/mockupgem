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


echo "This should return an invalid upload request error."
curl -X POST $URL/api/v1/screenshots
echo ""

echo "This should return a UUID."
curl -F "screenshot=@$SAMPLE_IMAGE" $URL/api/v1/screenshots
echo ""

echo "This should return an invalid create mockup request error"
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"templates": ["iphone6_rough_texture"]}' \
  $URL/api/v1/screenshots/invalid_uuid/mockups
echo ""

echo "This should return an invalid create mockup request error"
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"templates": ["invalid_template"]}' \
  $URL/api/v1/screenshots/invalid_uuid/mockups
echo ""

echo "This should return an invalid create mockup request error"
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"templates": "iphone6_rough_texture"}' \
  $URL/api/v1/screenshots/invalid_uuid/mockups
echo ""

echo "This should return a list of mockup URLs"
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"templates": ["iphone6_rough_texture"]}' \
  $URL/api/v1/screenshots/$VALID_UUID/mockups
echo ""
