/* global __dirname */

function SubPage1() {}

module.exports = SubPage1;

SubPage1.exports = {
    view: __dirname,
    // style: __dirname,
    imports: [
        require('./asub1')
    ]
};

SubPage1.exports.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};