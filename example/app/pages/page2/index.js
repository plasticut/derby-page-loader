/* global __dirname */

function Page2() {}

module.exports = Page2;

Page2.exports = {
    view: __dirname,
    style: __dirname
};

Page2.exports.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};