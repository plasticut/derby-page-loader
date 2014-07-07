/* global __dirname */

function ASubPage1() {}

module.exports = ASubPage1;

ASubPage1.view = __dirname;
// ASubPage1.style = __dirname;
ASubPage1.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};