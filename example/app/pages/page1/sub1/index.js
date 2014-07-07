/* global __dirname */

function SubPage1() {}

module.exports = SubPage1;

SubPage1.view = __dirname;
SubPage1.imports = [
    require('./asub1')
];
// SubPage1.style = __dirname;
SubPage1.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};