/* global __dirname */

function Page3() {}

module.exports = Page3;

Page3.view = __dirname;
// Page3.style = __dirname;
Page3.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};