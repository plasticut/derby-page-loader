/* global __dirname */

function Page1() {}

var define = {
    href: '/',
    dirname: __dirname,
    cls: Page1,
    imports: [
        require('./sub')
    ]
};

module.exports = define;

define.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });

};

Page1.prototype.create = function() {
    console.log('CREATE');
};

Page1.prototype.openModal = function() {
    this.testModal.show();
};

Page1.prototype.hideModal = function(action, cancel) {
    if (action === 'cancel') {
        cancel();
    }
};