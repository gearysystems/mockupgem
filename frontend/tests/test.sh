# !/bin/bash

# This is a horrible way to test, but no time to do it the right way and this
# is enough to save my sanity and work quickly without messing stuff up.
URL=localhost:3000
if [ "$PRODUCTION" == "true" ]
then
 URL=mockupgemfrontend.zcqdhmpt6y.us-west-2.elasticbeanstalk.com
fi

SAMPLE_IMAGE=$1
if ["$SAMPLE_IMAGE" == ""]
then
  SAMPLE_IMAGE=screenshot.png
fi

echo "This should return all mockup metadata in an array"
curl $URL/api/mockup-metadata
echo ""

echo "This should return all mockup metadata by name"
curl $URL/api/mockup-metadata-by-name
echo ""

echo "This should return all mockup metadata by device"
curl $URL/api/mockup-metadata-by-device
echo ""

# Should be successful
echo "This should be successful"
curl -F "mockup_name=iphone6_on_rock" -F "overlay_image=@screenshot.png" $URL/api/upload
echo ""

# Should return an error
echo "This should return an error"
curl -F "mockup_name=iphone6_rough_texture" $URL/api/upload
echo ""

# Should return an error
echo "This should return an error"
curl -F "overlay_image=@screenshot.png" $URL/api/upload
echo ""

# Should return an error
echo "This should return an error"
curl -F "mockup_name=not_a_real_mockup" -F "overlay_image=@screenshot.png" $URL/api/upload
echo ""
