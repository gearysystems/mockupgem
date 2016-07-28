module.exports = `
  window.hiddenCells = {};
  function showDevices(evt, deviceName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tab-content" and hide them
    tabcontent = flkty.getCellElements();
    if(!window.hiddenCells[deviceName]){
      window.hiddenCells[deviceName] = [];
    }
    if(deviceName === window.currentDevice){
      return;
    }
    for (i = 0; i < tabcontent.length; i++) {
        var device = tabcontent[i].attributes['data-device'].value;
        if(!window.hiddenCells[device]){
          window.hiddenCells[device] = [];
        }
        if(window.hiddenCells[device].indexOf(tabcontent[i] === -1)){
          window.hiddenCells[device].push(tabcontent[i]);
        }
        flkty.remove(tabcontent[i]);
    }
    window.currentDevice = deviceName;
    window.hiddenCells[deviceName].forEach(function(cell){
        flkty.append(cell);
    });
    flkty.reloadCells();

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    evt.currentTarget.className += " active";
  }
`;