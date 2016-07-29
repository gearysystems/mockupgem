const fs = require('fs');
const path = require('path');

const style = fs.readFileSync(path.join(__dirname,'/style.css'));
const indexHTML = fs.readFileSync(path.join(__dirname,'/index.html'));
const fileUploadHandler = fs.readFileSync(path.join(__dirname,'/fileUpload.js'));
const s3ThumbnailPrefix = "https://s3-us-west-2.amazonaws.com/mockup-gem-mockup-images";

function renderIndex(mockupMetadataByDevice) {
  var devices = [];
  for (var deviceName in mockupMetadataByDevice) {
    devices.push(deviceName);
  }
  var thumbnailURLs = mockupMetadataByDevice[devices[0]].map(function(mockupMetdata) {
    return `${s3ThumbnailPrefix}/${mockupMetdata.mockup_name}.png`
  });
  var thumbnailList = renderThumbnailList(thumbnailURLs);
  var deviceTabs = renderTabs(['iphone6', 'ipad']);
  var filterImagesScript = require('./filterImages.js');
  var carouselScript = require('./carousel.js');
  return `<html>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/3.3.1/css/swiper.min.css">
      <style>
        ${style}
      </style>
    </head>
    <body>
      ${deviceTabs}
      <div id="mockup-preview-container">
        <img src="" id="mockup-preview" onerror="this.style.display='none'"/>
      </div>
      <div class="swiper-container">
        <div class="swiper-wrapper">
          ${thumbnailList}
        </div>
      </div>
      ${renderForm()}
      <script>
        ${fileUploadHandler}
      </script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/3.3.1/js/swiper.min.js"></script>
      <script>
        ${carouselScript}
      </script>
    </body>
  </html>
  `
}

function renderTabs(devices) {
  var tabs = [];
  devices.forEach(function(device){
    var li = `<li><a href="#" class="tablinks ${device}" onclick="showDevices(event, '${device}')">${device}</a></li>`;
    tabs.push(li);
  });
  return `<ul class="tab">
    ${tabs.join('')}
  </ul>`;
}

function renderThumbnailList(thumbnailURLs) {
  return thumbnailURLs.map(function(thumbnailURL) {
    return `<div class="carousel-cell tab-content swiper-slide">
              <img class="mockup-thumbnail" src="${thumbnailURL}"></img>
            </div>`
  }).join('\n');
}

function renderForm() {
  return `<form enctype="multipart/form-data" method="post" name="overlay_upload">
    <input type="text" name="mockup_name" value="iphone6_on_rock" required />
    <input type="file" name="overlay_image" required />
    <input type="submit" value="Stash the file!" />
  </form>
  `
}

module.exports = {
  renderIndex: renderIndex,
}
