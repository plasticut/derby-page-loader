function defaultSetup(module, app) {
    app.get(module.href, function(page, model, params, next) {
        page.renderClient();
        page.renderServer();
    });
}

function getPage(path) {
    var i=0, page, parent, names = path.split(':');

    parent = this;
    while (page = parent.pages[names[i++]]) { parent = page; }

    return (i !== names.length) && parent;
}

function getHref(path) {
    var page = this.getPage(path);
    return page ? page.href : '/';
}

function loadPage(module, parent) {
    var i, l, cls, modules = [].concat(module);

    for (i=0, l=modules.length; i<l; i++) {
        module = modules[i];

        cls = module.cls;

        module.name = cls.name.toLowerCase();
        module.parent = parent;
        module.pages = {};
        module.getPage = getPage;
        module.getHref = getHref;

        if (parent) {
            parent.pages[module.name] = module;
            module.ns = parent.ns + ':' + module.name;
            if (!module.href) {
                module.href = ((parent.href !== '/') ? parent.href : '') + '/' + module.name;
            }
        } else {
            this.pages[module.name] = module;
            module.ns = module.name;
            if (!module.href) {
                module.href = '/' + module.name;
            }
        }

        cls.prototype.name = module.ns;
        cls.prototype.view = module.dirname;
        cls.prototype.style = module.dirname;

        this.component(cls);

        this.module = module;
        if (module.setup) {
            module.setup(this);
        } else {
            defaultSetup(module, this);
        }
        delete this.module;

        if (module.imports) {
            this.loadPage(module.imports, module);
        }
    }

}

function empty() {
}

module.exports = function(app, options) {

    var util = app.derby.util;

    app.pages = {};
    app.loadPage = loadPage;
    app.getPage = getPage;
    app.getHref = getHref;

    ['get', 'post', 'put', 'del'].forEach(function(method) {
        app['orig_' + method] = app[method];
        app[method] = function(pattern, callback) {
            var module = this.module;
            var _callback = function(page) {
                page.module = module;
                callback.apply(this, arguments);
            };
            return this['orig_' + method].call(this, pattern, _callback);
        }
    });

    util.mergeInto(app.Page.prototype, {
        renderClient: (util.isServer) ? empty : function() {
            this.render(this.module.ns);
        },
        renderServer: (!util.isServer) ? empty : function() {
            this.render(this.module.ns);
        },
        renderAll: function() {
            this.render(this.module.ns);
        }
    });

    if (options) {
        app.loadPage(options);
    }

};