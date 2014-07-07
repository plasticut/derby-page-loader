function extend(from, to) {
    for (var key in from) {
        if (from.hasOwnProperty(key)) {
            to[key] = from[key];
        }
    }
}

/**
    PAGE COMPONENT
*/

function PageComponent() {
}

PageComponent.prototype.getPage = function(ns) {
    return this.page.thisPage.getPage(ns);
};

PageComponent.prototype.getHref = function(ns) {
    return this.page.thisPage.getHref(ns);
};

PageComponent.prototype.getPages = function(ns) {
    return this.page.thisPage.getPages(ns);
};

PageComponent.prototype.getParent = function() {
    return this.page.thisPage.getParent();
};

/**
    PAGE
*/

function Page(options, parent, app) {
    var page, i, l, href,
        reg = app.__reg,
        component = (typeof options === 'function') && options;

    extend(options.exports, this);

    this.app = app;
    this.pages = {};

    this.name = component ? options.name.toLowerCase() : '';
    this.ns = (parent && parent.ns ? (parent.ns + ':') : '') + this.name;

    href = this.href || this.name;

    this.href = ((href[0] === '/') ? href : ((parent && parent.href ? ((parent.href !== '/') ? parent.href : '') : '') + '/' + href));

    if (this.imports) {
        for (i=0, l=this.imports.length; i<l; i++) {
            page = new Page(this.imports[i], this, app);
            this.pages[page.name] = page;
        }
    }

    if (this.model) {
        reg.models.push([ this.ns, this.model ]);
    }

    if (this.style) {
        reg.styles.push(this.style);
    }

    if (this.setup) {
        reg.setup.push(this);
    }

    if (component) {
        delete options.exports;

        component.prototype.name = this.ns;
        component.prototype.view = this.view;
        extend(PageComponent.prototype, component.prototype);
        reg.components.push(component);
    } else {
        if (this.view) {
            reg.views.push(this.view);
        }
    }
}

Page.prototype.getPage = function getPage(ns) {

    if (!ns) {
        return this;
    }

    var i=0, page, parent, names = ns.split(':');

    parent = this;

    if (names[0] === this.name) { names.shift(); }

    while (page = parent.pages[names[i++]]) { parent = page; }

    return (i !== names.length) && parent;
};

Page.prototype.getParent = function getParent() {
    var ns = this.ns.split(':');
    ns.pop();
    return this.app.rootPage.getPage(ns.join(':'));
};

Page.prototype.getHref = function getHref(path) {
    var page = this.getPage(path);
    return page ? page.href : '/';
};

Page.prototype.getPages = function(ns) {
    var page = this.getPage(ns);
    var pages = []; var n = [];
    for (var name in page.pages) {
        if (page.pages.hasOwnProperty(name)) {
            n.push(name);
            pages.push(page.pages[name]);
        }
    }
    return pages;
};

Page.prototype.fn = function(name) {
    return this.ns + '.' + name;
};

Page.prototype.setup = function(app) {
    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });
};

Page.prototype.attachTo = function(page) {
    page.thisPage = this;
};

function setup(app, options) {

    var reg = {
        setup: [],
        views: [],
        styles: [],
        models: [],
        components: []
    };
    var i, l, item, items;

    app.__reg = reg;

    if (options.components) {
        items = options.components;
        for (i=0, l=items.length; i<l; i++) {
            item = items[i];
            item.prototype.name = item.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            if (item.exports) {
                if (item.exports.model) {
                    reg.models.push([item.prototype.name, item.exports.model]);
                }
                if (item.exports.style) {
                    reg.styles.push(item.exports.style);
                }
                if (item.exports.view) {
                    item.prototype.view = item.exports.view;
                }
            }

            reg.components.push(item);
        }
    }

    if (options.rootPage) {
        app.rootPage = new Page({ exports: options.rootPage }, null, app);
    }

    items = reg.components;
    for (i=0, l=items.length; i<l; i++) {
        app.component(items[i]);
    }

    if (reg.styles.length) {
        reg.importStyle = options.importStyle;
        app.serverUse(module, './load-styles', reg);
    }

    items = reg.views;
    for (i=0, l=items.length; i<l; i++) {
        app.loadViews(items[i]);
    }

    // extend router methods
    ['get', 'post', 'put', 'del'].forEach(function(method) {
        app['orig_' + method] = app[method];
        app[method] = function(pattern, callback) {
            var thisPage = this.thisPage;
            var _callback = function(page) {
                thisPage.attachTo(page);
                callback.apply(this, arguments);
            };
            return this['orig_' + method].call(this, pattern, _callback);
        };
    });

    app.on('ready', function(page) {
        var thisPage = page.app.rootPage;
        thisPage = thisPage && thisPage.getPage(page.model.get('$render.ns'));
        if (thisPage) {
            thisPage.attachTo(page);
        }
    });

    // REGISTER MODEL FUNCTIONS
    if (reg.models.length) {
        app.on('model', function(model) {
            var i, l, items = reg.models, fns, ns;
            for (i=0, l=items.length; i<l; i++) {
                ns = items[i][0];
                fns = items[i][1];
                for (var key in fns) {
                    if (fns.hasOwnProperty(key)) {
                        model.fn(ns + '.' + key, fns[key]);
                    }
                }
            }
        });
    }

    items = reg.setup;
    for (i=0, l=items.length; i<l; i++) {
        app.thisPage = items[i];
        items[i].setup(app, app.thisPage);
    }
    delete app.thisPage;

    function empty() {}

    // extend app page
    var isServer = app.derby.util.isServer;
    var AppPage = app.Page;

    AppPage.prototype.renderClient =  isServer ? empty : function() {
        this.render(this.thisPage.ns);
    };

    AppPage.prototype.renderServer = (!isServer) ? empty : function() {
        this.render(this.thisPage.ns);
    };

    AppPage.prototype.renderAll = function() {
        this.render(this.thisPage.ns);
    };

    app.proto.getPages = function(ns) {
        return app.rootPage.getPages(ns);
    };

    app.proto.getPage = function(ns) {
        return app.rootPage.getPage(ns);
    };

    delete app.__reg;
}

module.exports = setup;