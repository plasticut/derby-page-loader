var derby = require('derby');
var app = module.exports = derby.createApp('derby-app', __filename);

app.serverUse(module, 'derby-stylus');

app.use(require('../../index.js'), {
    root: require('./pages'),
    components: [
        require('./components/sample')
    ],
    importStyle: __dirname + '/../styles/import.styl'
});

app.loadStyles(__dirname + '/../styles');