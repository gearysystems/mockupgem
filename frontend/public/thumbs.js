function renderIndex(thumbnailURLs, devices) {
  var thumbnailList = renderThumbnailList(thumbnailURLs);
  var deviceTabs = renderTabs(devices);
  var fileUploadScript = require('./fileUpload');
  var filterImagesScript = require('./filterImages.js');
  var styles = require('./styles.js');
  return `<html>
    <head>
      <link rel="stylesheet" href="https://npmcdn.com/flickity@2.0/dist/flickity.css" media="screen">
      <style>${styles}</style>
    </head>
    <body>
      ${deviceTabs}
      <img src="" id="overlayed_image" onerror="this.style.display='none'"/>
      <div class="carousel" data-flickity>
          ${thumbnailList}
      </div>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      ${renderForm()}
      <script>
        ${fileUploadScript}
        ${filterImagesScript}
      </script>
      <script src="https://npmcdn.com/flickity@2.0/dist/flickity.pkgd.min.js"></script>
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
    return `<div class="carousel-cell tab-content ${thumbnailURL.device}"><img src="${thumbnailURL.url}"></img></div>`
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
