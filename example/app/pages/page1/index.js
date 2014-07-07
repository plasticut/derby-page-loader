/* global __dirname */

function Page1() {}

module.exports = Page1;

Page1.view = __dirname;
// Page1.style = __dirname;
Page1.href = '/';
Page1.imports = [
    require('./sub1'),
    require('./sub2')
];
Page1.setup = function(app) {

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