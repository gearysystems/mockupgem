# !/bin/bash

URL=localhost:3000
if [ "$PRODUCTION" == "true" ]
then
 URL=http://mockupgem.gearysystems.com
fi

echo "This should return all mockup metadata in an array"
curl $URL/api/templates
echo ""

echo "This should return all mockup metadata by name"
curl $URL/api/templates-by-name
echo ""

echo "This should return all mockup metadata by device"
curl $URL/api/templates-by-device
echo ""
