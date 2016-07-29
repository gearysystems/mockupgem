var form = document.forms.namedItem('overlay_upload');
form.addEventListener('submit', function(submitEvent) {
  console.log(form);
  formData = new FormData(form);
  uploadRequest = new XMLHttpRequest();
  uploadRequest.addEventListener('load', function(loadEvent) {
    if (uploadRequest.status === 200) {
      uploadResponse = JSON.parse(uploadRequest.response);
      console.log(uploadResponse);
      var overlayView = document.getElementById('mockup-preview');
      setInterval(function() {
        overlayView.src = uploadResponse.download_url;
        overlayView.style.display = "";
      }, 1000);
    }
  });
  // TODO: Don't hardcode this;
  uploadRequest.open('POST', 'api/upload?mockup_name=iphone6_on_rock');
  uploadRequest.send(formData);
  submitEvent.preventDefault();
}, false);
