/* global __dirname */

function Page2() {}

module.exports = Page2;

Page2.view = __dirname;
Page2.style = __dirname;

Page2.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};