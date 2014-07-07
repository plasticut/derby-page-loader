/* global __dirname */

function SubPage2() {}

module.exports = SubPage2;

SubPage2.exports = {
    view: __dirname,
    //style: __dirname,
    setup: function(app) {
        app.get(this.href, function(page, model, params, next) {
            page.renderAll();
        });
    }
};