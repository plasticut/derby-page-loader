/* global __dirname */

function Sub() {}

var define = {
    dirname: __dirname,
    cls: Sub
};

module.exports = define;

define.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};