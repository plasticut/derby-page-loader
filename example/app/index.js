var derby = require('derby');
var app = module.exports = derby.createApp('derby-app', __filename);

app.loadViews(__dirname + '/pages');

app.use(require('../../index.js'), require('./pages'));