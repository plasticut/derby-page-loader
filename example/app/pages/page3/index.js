/* global __dirname */

function Page3() {}

var define = {
    dirname: __dirname,
    cls: Page3
};

module.exports = define;

define.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};