var derby = require('derby');
var app = module.exports = derby.createApp('derby-app', __filename);

app.serverUse(module, 'derby-stylus');

app.use(require('../../index.js'), require('./pages'));

app.loadViews(__dirname + '/pages');
app.loadStyles(__dirname + '/pages')