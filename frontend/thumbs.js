function renderIndex(thumbnailURLs) {
  var thumbnailList = renderThumbnailList(thumbnailURLs)
  return `<html>
    <head>
      <link rel="stylesheet" href="https://npmcdn.com/flickity@2.0/dist/flickity.css" media="screen">
    </head>
    <body>
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
        ${handleFileUpload()}
      </script>
      <script src="https://npmcdn.com/flickity@2.0/dist/flickity.pkgd.min.js"></script>
    </body>
  </html>
  `
}

function renderThumbnailList(thumbnailURLs) {
  return thumbnailURLs.map(function(thumbnailURL) {
    return `<div class="carousel-cell"><img src="${thumbnailURL}""</img></div>`
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

function handleFileUpload() {
  return `
    var form = document.forms.namedItem('overlay_upload');
    form.addEventListener('submit', function(submitEvent) {
      formData = new FormData(form);
      uploadRequest = new XMLHttpRequest();
      uploadRequest.addEventListener('load', function(loadEvent) {
        if (uploadRequest.status === 200) {
          uploadResponse = JSON.parse(uploadRequest.response);
          var overlayView = document.getElementById('overlayed_image');
          setInterval(function() {
            overlayView.src = uploadResponse.download_url;
            overlayView.style.display = "";
          }, 1000);
        }
      });
      uploadRequest.open('POST', 'api/upload');
      uploadRequest.send(formData);
      submitEvent.preventDefault();
    }, false);
  `
}

module.exports = {
  renderIndex: renderIndex,
}
