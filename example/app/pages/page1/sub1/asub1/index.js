/* global __dirname */

function ASubPage1() {}

module.exports = ASubPage1;

ASubPage1.exports = {
    view: __dirname
    //style: __dirname,
};

ASubPage1.exports.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};