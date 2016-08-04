const fs = require('fs');

function log(entry) {
 if (typeof entry !== 'string') {
  entry = JSON.stringify(entry);
 }
 logMessage = new Date().toISOString() + ' - ' + entry + '\n';
 console.log(logMessage);
 fs.appendFileSync('/tmp/sample-app.log', logMessage);
};

module.exports = {
 log: log,
}
