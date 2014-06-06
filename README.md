derby-page-loader
=================

```javascript
function Page1() {}

module.exports = {
    href: '/',
    dirname: __dirname,
    cls: Page1,
    imports: [
        require('./sub')
    ]
};

module.exports.setup = function(app) {
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
    page.renderServer();
    page.renderClient();
    page.renderAll();
```