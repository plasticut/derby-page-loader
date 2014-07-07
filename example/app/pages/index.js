/* global __dirname */

module.exports = {
    view: __dirname,
    style: __dirname,
    imports: [
        require('./page1'),
        require('./page2'),
        require('./page3')
    ]
};
