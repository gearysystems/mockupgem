var form = document.forms.namedItem('overlay_upload');
form.addEventListener('submit', function(submitEvent) {
  formData = new FormData(form);
  uploadRequest = new XMLHttpRequest();
  uploadRequest.addEventListener('load', function(loadEvent) {
    if (uploadRequest.status === 200) {
      uploadResponse = JSON.parse(uploadRequest.response);
      var overlayView = document.getElementById('mockup-preview');
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
