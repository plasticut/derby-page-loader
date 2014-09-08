function merge(from, to) {
    for (var key in from) {
        if (from.hasOwnProperty(key)) {
            to[key] = from[key];
        }
    }
}

function wrap(from, to, method) {
    var child = to[method];
    var parent = from[method];
    return !child ? parent : function() {
        parent.apply(this, arguments);
        return child.apply(this, arguments);
    };
}

function extend(Parent, Child, methods) {
    var from = Parent.prototype;
    var to = Child.prototype;

    methods.forEach(function(name) {
        to[name] = wrap(from, to, name);
    });

    for (var key in from) {
        if (from.hasOwnProperty(key) && !to.hasOwnProperty(key)) {
            to[key] = from[key];
        }
    }
}


function getName(func) {
    return func.name || func.toString().match(/^function\s*([^\s(]+)/)[1];
}

function dash(s) {
    return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
    PAGE COMPONENT
*/

function PageComponent() {
}

PageComponent.prototype.init = function(model) {
    var thisPage = this.page.thisPage;

    thisPage.init(model);
};

// PageComponent.prototype.getPage = function(ns) {
//     console.log('PAGE.GETPAGE', this.page.thisPage.ns, ns);
//     return this.page.thisPage.getPage(ns);
// };

// PageComponent.prototype.getHref = function(ns) {
//     console.log('PAGE.GETHREF', this.page.thisPage.ns, ns);
//     return this.page.thisPage.getHref(ns);
// };

// PageComponent.prototype.getPages = function(ns) {
//     return this.page.thisPage.getPages(ns);
// };

PageComponent.prototype.getParent = function() {
    return this.page.thisPage.getParent();
};

/**
    PAGE
*/

function Page(options, parent, app) {
    var page, i, l, href,
        reg = app.__reg,
        item,
        component = (typeof options === 'function') && options;

    merge(options.exports, this);

    this.app = app;
    this.pages = {};

    this.name = component ? dash(getName(options)) : '';
    this.ns = (parent && parent.ns ? (parent.ns + ':') : '') + this.name;

    href = (this.href === undefined) ? this.name : this.href;

    this.href = ((href[0] === '/') ? href : ((parent && parent.href ? ((parent.href !== '/') ? parent.href : '') : '') + (href ? '/' + href : '') ));

    if (this.model) {
        reg.models.push([ this.ns, this.model ]);
    }

    if (this.style) {
        reg.styles.push(this.style);
    }

    if (this.setup) {
        reg.setup.push(this);
    }

    if (this.middlewares) {
        reg.middlewares.push(this.middlewares);
    }

    if (this.components) {
        for (i=0, l=this.components.length; i<l; i++) {
            item = this.components[i];
            item.prototype.name = this.ns + ':' + dash(getName(item));
            reg.components.push(item);
        }
    }

    if (component) {
        delete options.exports;

        component.prototype.name = this.ns;
        component.prototype.view = this.view;
        extend(PageComponent, component, ['init']);

        reg.components.push(component);
    } else {
        if (this.view) {
            reg.views.push(this.view);
        }
    }

    if (this.imports) {
        for (i=0, l=this.imports.length; i<l; i++) {
            page = new Page(this.imports[i], this, app);
            this.pages[page.name] = page;
        }
    }
}

Page.prototype.getPage = function getPage(ns, fn) {
    if (!ns) {
        return this;
    }

    var i=0, page, parent, names = ns.split(':');

    parent = this;

    if (names[0] === this.name) { names.shift(); }

    while (page = parent.pages[names[i++]]) {
        parent = page;
        if (fn) {
            fn(page);
        }
    }

    return (i > names.length) && parent;
};

Page.prototype.getParent = function getParent() {
    var ns = this.ns.split(':');
    ns.pop();
    return this.app.rootPage.getPage(ns.join(':'));
};

Page.prototype.getHref = function getHref(path, params, prev) {
    var page = this.getPage(path);
    return page ? page.getFullHref(params, prev) : 'javascript:void(0)';
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

Object.defineProperty(Page.prototype, "isEnabled", {
    get: function() {
        return this.filter && this.filter(app.rootPage.pageModel || app.model) || !this.filter;
    }
});


// base on func mapRoute from derby track module
function fillParams(cur, params, prev) {
    var i, qs;
    if (prev) {
        i = ~prev.indexOf('?');
        qs = (~i) ? prev.slice(i) : '';
    } else {
        qs = '';
    }

    i = 0;
    function doReplace(match, key, optional) {
        var value = key ? params[key] : params[i++];
        return (optional && value == null) ? '' : '/' + encodeURIComponent(value);
    }
    return cur.replace(/\/(?:(?:\:([^?\/:*(]+)(?:\([^)]+\))?)|\*)(\?)?/g, doReplace) + qs;
}


Page.prototype.getFullHref = function(params, prev) {
    /**
        TODO fill params in href with defaults and input values
    */
    return params ? fillParams(this.href, params, prev) : this.href;
};

Page.prototype.fn = function(name) {
    return this.ns + '.' + name;
};

Page.prototype.setup = function(app) {
    app.get(this.href, function(page, model, params, next) {
        page.renderAll();
    });
};

Page.prototype.init = function(model) {
    model.set('_page.title', this.title || this.shortTitle);
    model.set('_page.shortTitle', this.shortTitle || this.title);
};

Page.prototype.attachTo = function(page) {
    page.thisPage = this;
    this.init(page.model);
};

function Middlewares() {
}

Middlewares.prototype.push = function(items) {
    for (var key in items) {
        if (items.hasOwnProperty(key)) {
            this[key] = items[key];
        }
    }
};

function setup(app, options) {

    var reg = {
        setup: [],
        views: [],
        styles: [],
        models: [],
        components: [],
        middlewares: new Middlewares()
    };
    var i, l, item, items;

    app.__reg = reg;

    if (options.components) {
        reg.components = reg.components.concat(options.components);
    }

    if (options.rootPage) {
        app.rootPage = new Page({ exports: options.rootPage }, null, app);
    }

    items = reg.components;
    for (i=0, l=items.length; i<l; i++) {
        item = items[i];
        if (!item.prototype.name) {
            item.prototype.name = dash(getName(item));
        }
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
        app.component(item);
    }

    if (reg.styles.length) {
        reg.importStyle = options.importStyle;
        app.serverUse(module, './load-styles', reg);
    }

    items = reg.views;
    for (i=0, l=items.length; i<l; i++) {
        app.loadViews(items[i]);
    }

    items = reg.middlewares;

    // extend router methods
    ['get', 'post', 'put', 'del'].forEach(function(method) {
        app['orig_' + method] = app[method];
        app[method] = function(pattern) {
            var thisPage = this.thisPage, callbacks = [], fn;
            for (var i=1, l=arguments.length; i<l; i++) {
                fn = arguments[i];
                if (typeof fn === 'string') {
                    fn = reg.middlewares[fn];
                }
                callbacks.push(fn);
            }
            function _callback(page, model, params, next, done) {
                app.rootPage.pageModel = model;

                thisPage.attachTo(page);
                var _callbacks = callbacks.slice(0);
                function _next() {
                    var cb = _callbacks.shift();
                    if (cb) {
                        cb.call(page, page, model, params, _callbacks.length ? _next : next, done);
                    }
                }
                _next();
            }
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
            var i, l, items = reg.models, fns, ns, name;
            for (i=0, l=items.length; i<l; i++) {
                ns = items[i][0];
                fns = items[i][1];
                for (var key in fns) {
                    if (fns.hasOwnProperty(key)) {
                        name = ns ? (ns + '.' + key) : key;
                        model.fn(name, fns[key]);
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
        return app.rootPage.getPages(ns || this.model.get('$render.ns'));
    };

    app.proto.getPage = function(ns) {
        return app.rootPage.getPage(ns || this.model.get('$render.ns'));
    };

    app.proto.getHref = function(ns, params, prev) {
        return app.rootPage.getHref(ns || this.model.get('$render.ns'), params, prev);
    };


    delete app.__reg;
}

module.exports = setup;