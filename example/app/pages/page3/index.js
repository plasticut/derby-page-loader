/* global __dirname */

function Page3() {}

module.exports = Page3;

Page3.exports = {
    view: __dirname,
    middlewares: {
        auth: function(page, model, params, next) {
            console.log('auth check here', arguments);
            next();
        }
    }
    // style: __dirname
};

Page3.exports.setup = function(app) {

    app.get(this.href, 'auth', function(page, model, params, next) {
        page.renderAll();
    });

};