# !/bin/bash

URL=localhost:3000
if [ "$PRODUCTION" == "true" ]
then
 URL=http://mockupgem.gearysystems.com
fi

echo "This should return all mockup metadata in an array"
curl $URL/api/v1/templates
echo ""

echo "This should return all mockup metadata by name"
curl $URL/api/v1/templates-by-name
echo ""

echo "This should return all mockup metadata by device"
curl $URL/api/v1/templates-by-device
echo ""
