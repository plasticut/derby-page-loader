
/**
    PAGE COMPONENT
*/

function PageComponent() {
}

function extend(from, to) {
    for (var key in from) {
        if (from.hasOwnProperty(key)) {
            to[key] = from[key];
        }
    }
}

PageComponent.extend = function(Ancestor) {
    extend(PageComponent.prototype, Ancestor.prototype);
    return Ancestor;
};

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
    var reg = app.__reg;
    this.app = app;
    this.pages = {};
    this.name = options.name ? options.name.toLowerCase() : 'main';
    this.ns = (parent && parent.ns ? (parent.ns + ':') : '') + this.name;

    var href = options.href || this.name;

    this.href = ((href[0] === '/') ? href : ((parent && parent.href ? ((parent.href !== '/') ? parent.href : '') : '') + '/' + href));

    if (options.imports) {
        for (var i=0, l=options.imports.length; i<l; i++) {
            var page = new Page(options.imports[i], this, app);
            this.pages[page.name] = page;
        }
    }

    if (options.style) {
        reg.styles.push(options.style);
        delete options.style;
    }

    if (options.setup) {
        this.setup = options.setup;
        delete options.setup;
    }
    reg.setup.push(this);

    var component = (typeof options === 'function') && options;

    if (component) {
        component.prototype.name = this.ns;
        component.prototype.view = options.view;
        delete options.view;
        reg.components.push(PageComponent.extend(component));
    } else {
        if (options.view) {
            reg.views.push(options.view);
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
    return this.app.mainPage.getPage(ns.join(':'));
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

Page.prototype.setup = function(app) {
    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });
};

function setup(app, options) {

    var reg = {
        styles: [],
        components: [],
        views: [],
        setup: []
    };
    var i, l, item, items;

    app.__reg = reg;

    if (options.components) {
        items = options.components;
        for (i=0, l=items.length; i<l; i++) {
            item = items[i];
            item.prototype.name = item.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();;
            reg.components.push(item);
        }
    }

    if (options.mainPage) {
        app.mainPage = new Page(options.mainPage, null, app);
        app.proto.mainPage = app.mainPage;
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
                page.thisPage = thisPage;
                callback.apply(this, arguments);
            };
            return this['orig_' + method].call(this, pattern, _callback);
        }
    });

    app.on('ready', function(page) {
        var ns = page.model.get('$render.ns');
        page.thisPage = page.app.mainPage.getPage(ns);
    });

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
        return app.mainPage.getPages(ns);
    };

    app.proto.getPage = function(ns) {
        return app.mainPage.getPage(ns);
    };

    delete app.__reg;
}

module.exports = setup;