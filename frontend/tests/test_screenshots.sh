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

LARGE_IMAGE=IMG_0576.PNG

VALID_UUID=5415ee81-e5ce-4e84-892f-ae85e4e76d0b

# TODO: Handle case where they submit empty form
echo "This should return an invalid upload request error."
curl -X POST $URL/api/v1/screenshots
echo ""

echo "This should return a UUID and url."
curl -F "screenshot=@$SAMPLE_IMAGE" $URL/api/v1/screenshots
echo ""

# TODO: This image is not big enough
echo "This should return a UUID and url - Test large upload."
curl -F "screenshot=@$LARGE_IMAGE" $URL/api/v1/screenshots
echo ""

echo "This should return an invalid create mockup request error"
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"templates": ["iphone6_white_minimal_outdoor_holding"]}' \
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
  -d '{"templates": "iphone6_white_minimal_outdoor_holding"}' \
  $URL/api/v1/screenshots/invalid_uuid/mockups
echo ""

echo "This should return a list of mockup URLs"
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"templates": ["test"]}' \
  $URL/api/v1/screenshots/$VALID_UUID/mockups
echo ""
