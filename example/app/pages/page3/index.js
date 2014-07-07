/* global __dirname */

function Page3() {}

module.exports = Page3;

Page3.exports = {
    view: __dirname
    // style: __dirname
};

Page3.exports.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};