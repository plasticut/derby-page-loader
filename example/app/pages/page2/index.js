/* global __dirname */

function Page2() {}

var define = {
    dirname: __dirname,
    cls: Page2
};

module.exports = define;

define.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};