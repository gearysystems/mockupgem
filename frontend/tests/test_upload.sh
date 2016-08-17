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

echo "This should be successful"
curl -F "overlay_image=@screenshot.png" $URL/api/v1/upload?mockup_name=test
echo ""

echo "This should be successful"
curl --globoff -F "overlay_image=@screenshot.png" "$URL/api/v1/upload?mockup_names[]=test&mockup_names[]=test"
echo ""


echo "This should return an error"
curl -X POST $URL/api/v1/upload?mockup_name=test
echo ""

echo "This should return an error"
curl -F "overlay_image=@screenshot.png" $URL/api/v1/upload
echo ""

echo "This should return an error"
curl -F "overlay_image=@screenshot.png" $URL/api/v1/upload?mockup_name=not_a_real_mockup
echo ""

echo "This should return an error"
curl --globoff -F "overlay_image=@screenshot.png" "$URL/api/v1/upload?mockup_names[]=test&mockup_names[]=yolo"
echo ""
