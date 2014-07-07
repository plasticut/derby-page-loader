/* global __dirname */

function SubPage2() {}

module.exports = SubPage2;

SubPage2.view = __dirname;
// SubPage.style = __dirname;
SubPage2.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};