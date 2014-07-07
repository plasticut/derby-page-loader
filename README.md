derby-page-loader
=================

Sample page
```javascript
/* global __dirname */

function Page1() {}

module.exports = Page1;

Page1.exports = {
    view: __dirname,
    style: __dirname,
    href: '/',
    imports: [
        require('./sub1'),
        require('./sub2')
    ]
};
Page1.exports.setup = function(app) {

    app.get(this.href, function(page, model, params, next) {
        page.renderClient();
        $query = model.query('some_data', {});
        model.subscribe($query, function() {
            $query.ref('_page.some_data');
            page.renderServer();
        });
    });

};

Page1.prototype.create = function(model, dom) {
};

```

```javascript
app.use(require('derby-page-loader'), {
    rootPage: require('./pages'),
    components: [
        require('./components/sample')
    ],
    importStyle: __dirname + '/../styles/import.styl'
});
```

```javascript
    page.renderServer();
    page.renderClient();
    page.renderAll();
```