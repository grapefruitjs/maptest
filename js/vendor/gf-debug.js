/**
 * @license
 * GrapeFruit Debug Plugin - v0.0.1
 * Copyright (c) 2013, Chad Engler
 * https://github.com/grapefruitjs/gf-debug
 *
 * Compiled: 2013-07-31
 *
 * GrapeFruit Debug Plugin is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function(window, undefined) {
    var document = window.document;

var d = {
    //the version of this plugin. Placed in by grunt when built you can change
    //this value in the package.json (under version)
    version: '0.0.1',

    //the version of gf that is required for this plugin to function correctly.
    //Placed in by grunt when built you can change this value in the package.json (under engines.gf)
    gfVersion: '0.0.x'
};

//register the plugin to grapefruit
gf.plugin.register(d, 'debug');

/**
 * Shows the debug bar using the specified game information
 *
 * @method show
 * @param game {gf.Game} the game to debug
 */
gf.debug.show = function(game) {
    if(!game || !(game instanceof gf.Game))
        throw 'Please pass a game instance to gf.debug.show!';

    if(this.game)
        throw 'Already debugging a game instance!';

    this.game = game;
    this.game.on('beforetick', this._beforeTick.bind(this));
    this.game.on('aftertick', this._afterTick.bind(this));

    this.panels = {
        world: new gf.debug.WorldPanel(game),
        sprites: new gf.debug.SpritesPanel(game),
        gamepad: new gf.debug.GamepadPanel(game),
        performance: new gf.debug.PerformancePanel(game)
    };

    this.logSpriteCount = false;

    //add element to the page
    document.body.appendChild(this.createElement());

    this.bindEvents();
};

/**
 * Shows some event occuring on the timeline of the performance graph
 * which makes it easy to see what is impacting performance and when
 *
 * @method logEvent
 * @param name {String} the event name to show on the graph
 */
gf.debug.logEvent = function(name) {
    if(this.panels && this.panels.performance)
        this.panels.performance.logEvent(name);
};

gf.debug.bindEvents = function() {
    var activePanel,
        self = this;

    this.ui.bindDelegate(this._bar, 'click', 'gf_debug_menu_item', function(e) {
        var panel = self.panels[e.target.className.replace(/gf_debug_menu_item|active/g, '').trim()];

        if(!panel)
            return;

        if(activePanel) {
            activePanel.toggle();
            self.ui.removeClass(activePanel._menuItem, 'active');

            if(activePanel.name === panel.name) {
                activePanel = null;
                return;
            }
        }

        self.ui.addClass(e.target, 'active');
        panel.toggle();
        activePanel = panel;
    });
};

gf.debug.createElement = function() {
    var c = this._container = document.createElement('div'),
        bar = this._bar = document.createElement('div');

    //container
    this.ui.addClass(c, 'gf_debug');
    c.appendChild(bar);

    //the menu bar
    this.ui.addClass(bar, 'gf_debug_menu');
    bar.appendChild(this.createMenuHead());
    bar.appendChild(this.createMenuStats());

    //add the panels
    for(var p in this.panels) {
        bar.appendChild(this.panels[p].createMenuElement());
        c.appendChild(this.panels[p].createPanelElement());
    }

    return c;
};

gf.debug.createMenuHead = function() {
    var div = document.createElement('div');

    this.ui.addClass(div, 'gf_debug_menu_item gf_debug_head');
    this.ui.setText(div, 'Gf Debug:');

    return div;
};

gf.debug.createMenuStats = function() {
    this._stats = {};

    var div = document.createElement('div'),
        fps = this._stats.fps = document.createElement('div'),
        ms = this._stats.ms = document.createElement('div'),
        spr = this._stats.spr = document.createElement('div');

    this.ui.addClass(div, 'gf_debug_menu_item gf_debug_stats');

    this.ui.addClass(ms, 'gf_debug_stats_item ms');
    this.ui.setHtml(ms, '<span>0</span> ms');
    div.appendChild(ms);

    this.ui.addClass(fps, 'gf_debug_stats_item fps');
    this.ui.setHtml(fps, '<span>0</span> fps');
    div.appendChild(fps);

    this.ui.addClass(spr, 'gf_debug_stats_item spr');
    this.ui.setHtml(spr, '<span>0</span> sprites');
    div.appendChild(spr);

    return div;
};

gf.debug.timer = (window.performance && window.performance.now) ? window.performance : Date;

gf.debug._beforeTick = function() {
    this._tickStart = this.timer.now();
};

gf.debug._afterTick = function() {
    this.statsTick();
    this.panels.performance.tick();
    this.panels.gamepad.tick();
};

gf.debug.statsTick = function() {
    this._tickEnd = this.timer.now();

    var ms = this._tickEnd - this._tickStart,
        fps = 1000/ms;

    fps = fps > 60 ? 60 : fps;

    //update stats
    this.ui.setText(this._stats.ms.firstElementChild, ms.toFixed(2));
    this.ui.setText(this._stats.fps.firstElementChild, fps.toFixed(2));
};

//update the number of sprites every seconds (instead of every frame)
//since it is so expensive
setInterval(function() {
    if(gf.debug._stats && gf.debug._stats.spr) {
        //count sprites in active state
        var c = 0,
            s = gf.debug.game.activeState,
            wld = s.world,
            cam = s.camera;

        while(wld) {
            c++;
            wld = wld._iNext;
        }

        while(cam) {
            c++;
            cam = cam._iNext;
        }

        gf.debug.ui.setText(gf.debug._stats.spr.firstElementChild, c);

        //log the event to the performance graph
        if(gf.debug.logSpriteCount)
            gf.debug.logEvent('debug_count_sprites');
    }
}, 1000);
gf.debug.Panel = function(game) {
    this.game = game;
    this.name = '';
    this.title = '';
};

gf.inherits(gf.debug.Panel, Object, {
    //builds the html for a panel
    createPanelElement: function() {
        var div = this._panel = document.createElement('div');
        gf.debug.ui.addClass(div, 'gf_debug_panel');

        return div;
    },
    //builds the html for this panels menu item
    createMenuElement: function() {
        var div = this._menuItem = document.createElement('div');
        gf.debug.ui.addClass(div, 'gf_debug_menu_item ' + this.name);
        gf.debug.ui.setText(div, this.title);

        return div;
    },
    toggle: function() {
        if(this._panel.style.display === 'block')
            this.hide();
        else
            this.show();
    },
    show: function() {
        gf.debug.ui.setStyle(this._panel, 'display', 'block');
    },
    hide: function() {
        gf.debug.ui.setStyle(this._panel, 'display', 'none');
    }
});
gf.debug.GamepadPanel = function(game) {
    gf.debug.Panel.call(this, game);

    this.name = 'gamepad';
    this.title = 'Gamepad';
};

gf.inherits(gf.debug.GamepadPanel, gf.debug.Panel, {
    createPanelElement: function() {
        var div = gf.debug.Panel.prototype.createPanelElement.call(this);

        gf.debug.ui.setText(div, 'a gamepad image that shows the current gamepad state');

        return div;
    },
    tick: function() {
        
    }
});
gf.debug.PerformancePanel = function(game) {
    gf.debug.Panel.call(this, game);

    this.name = 'performance';
    this.title = 'Performance';
    this.eventQueue = [];
};

gf.inherits(gf.debug.PerformancePanel, gf.debug.Panel, {
    createPanelElement: function() {
        var div = gf.debug.Panel.prototype.createPanelElement.call(this);

        this.graph = new gf.debug.Graph(div, window.innerWidth, 200, {
            input: 'rgba(80, 80, 80, 1)',
            camera: 'rgba(80, 80, 220, 1)',
            physics: 'rgba(80, 220, 80, 1)',
            draw: 'rgba(220, 80, 80, 1)',
            event: 'rgba(200, 200, 200, 0.6)'
        });
        this.graph.max = 100;

        return div;
    },
    tick: function() {
        var t = this.game.timings,
            o = {
                input: t.inputEnd - t.inputStart,
                camera: t.cameraEnd - t.cameraStart,
                phys: t.physicsEnd - t.physicsStart,
                draw: t.renderEnd - t.renderStart
            },
            evt = this.eventQueue.shift();

        if(evt)
            o.event = evt;

        this.graph.addData(o);
    },
    logEvent: function(name) {
        this.eventQueue.push(name);
    }
});
gf.debug.SpritesPanel = function(game) {
    gf.debug.Panel.call(this, game);

    this.name = 'sprites';
    this.title = 'Sprites';
};

gf.inherits(gf.debug.SpritesPanel, gf.debug.Panel, {
    createPanelElement: function() {
        var div = gf.debug.Panel.prototype.createPanelElement.call(this),
            col = document.createElement('div');

        gf.debug.ui.addClass(col, 'checkbox');
        gf.debug.ui.setHtml(col,
            '<input type="checkbox" value="None" id="gf_debug_toggleCollisions" class="gf_debug_toggleCollisions" name="check" />' +
            '<label for="gf_debug_toggleCollisions"></label>' +
            '<span>Show sprite colliders</span>'
        );
        gf.debug.ui.bindDelegate(col, 'click', 'gf_debug_toggleCollisions', this.toggleCollisions.bind(this), 'input');
        div.appendChild(col);

        return div;
    },
    toggleCollisions: function() {
        var obj = this.game.stage,
            style = {
                color: 0xff2222,
                sensor: {
                    color: 0x22ff22
                }
            },
            show = !this.showing;

        while(obj) {
            if(obj.showPhysics) {
                if(show)
                    obj.showPhysics(style);
                else
                    obj.hidePhysics();
            }

            obj = obj._iNext;
        }

        this.game.world._showPhysics = this.showing = show;
    }
});
gf.debug.WorldPanel = function (game) {
    gf.debug.Panel.call(this, game);

    this.name = 'world';
    this.title = 'World';
};

gf.inherits(gf.debug.WorldPanel, gf.debug.Panel, {
    createPanelElement: function() {
        var div = gf.debug.Panel.prototype.createPanelElement.call(this);

        gf.debug.ui.setText(div, 'A minimap of the world, outline your current viewport, stats about the world');

        return div;
    }
});
gf.debug.Graph = function(container, width, height, dataStyles) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    this.label = 'ms';
    this.labelPrecision = 0;
    this.labelStyle = 'rgba(200, 200, 200, 0.6)';
    this.max = 50;
    this.dataLineWidth = 1;
    this.padding = 5;

    this.keySize = 80;

    this.data = [];
    this.styles = dataStyles || {};

    if(!this.styles._default)
        this.styles._default = 'red';

    if(!this.styles.event)
        this.styles.event = 'gray';
};

gf.inherits(gf.debug.Graph, Object, {
    addData: function(values) {
        this.data.push(values);

        if(this.data.length > ((this.canvas.width - this.keySize) / this.dataLineWidth))
            this.data.shift();

        this.redraw();
    },
    redraw: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBg();
        this.drawKey();
        this.drawData();
    },
    drawBg: function() {
        var ctx = this.ctx,
            minX = this.keySize,
            maxX = this.canvas.width,
            maxY = this.canvas.height,
            step = maxY / 3;

        ctx.strokeStyle = ctx.fillStyle = this.labelStyle;

        //draw top marker line
        ctx.beginPath();
        ctx.moveTo(minX, step);
        ctx.lineTo(maxX, step);
        ctx.stroke();

        //draw the second marker line
        ctx.beginPath();
        ctx.moveTo(minX, step*2);
        ctx.lineTo(maxX, step*2);
        ctx.stroke();

        //draw baseline marker
        ctx.beginPath();
        ctx.moveTo(minX, maxY);
        ctx.lineTo(maxX, maxY);
        ctx.stroke();

        //draw marker line text
        ctx.fillText(((this.max / 3)*2).toFixed(this.labelPrecision) + this.label, minX + this.padding, step-this.padding);
        ctx.fillText((this.max / 3).toFixed(this.labelPrecision) + this.label, minX + this.padding, (step*2)-this.padding);
    },
    drawKey: function() {
        var ctx = this.ctx,
            i = 0,
            box = 10,
            pad = this.padding,
            lbl = this.labelStyle;

        for(var k in this.styles) {
            var style = this.styles[k],
                y = (box * i) + (pad * (i+1));

            ctx.fillStyle = style;
            ctx.fillRect(pad, y, box, box);
            ctx.fillStyle = lbl;
            ctx.fillText(k, pad + box + pad, y + box);

            i++;
        }
    },
    drawData: function() {
        var ctx = this.ctx,
            maxX = this.canvas.width,
            maxY = this.canvas.height,
            lw = this.dataLineWidth,
            len = this.data.length;

        //iterate backwards through the data drawing from right to left
        for(var i = len - 1; i > -1; --i) {
            var vals = this.data[i],
                x = maxX - ((len - i) * lw),
                y = maxY,
                v,
                step;

            for(var k in vals) {
                ctx.beginPath();
                ctx.strokeStyle = ctx.fillStyle = this.styles[k] || this.styles._default;
                ctx.lineWidth = lw;

                v = vals[k];
                if(k === 'event') {
                    ctx.moveTo(x, maxY);
                    ctx.lineTo(x, 0);
                    ctx.fillText(v, x+this.padding, this.padding*2);
                } else {
                    step = ((v / this.max) * maxY);
                    step = step < 0 ? 0 : step;

                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y-=step);
                }

                ctx.stroke();
            }
        }
    }
});
//Some general dom helpers
gf.debug.ui = {
    bindDelegate: function(dom, evt, cls, fn, name) {
        name = name ? name.toUpperCase() : 'DIV';

        dom.addEventListener(evt, function(e) {
            if(e.target && e.target.nodeName.toUpperCase() === name) {
                var classes = e.target.className.split(' ');

                if(classes && classes.indexOf(cls) !== -1) {
                    if(fn) fn(e);
                }
            }
        });
    },

    removeClass: function(dom, cls) {
        var classes = dom.className.split(' '),
            i = classes.indexOf(cls);

        if(i !== -1) {
            classes.splice(i, 1);
            dom.className = classes.join(' ').trim();
        }
    },

    addClass: function(dom, cls) {
        var classes = dom.className.split(' ');

        classes.push(cls);
        dom.className = classes.join(' ').trim();
    },

    setText: function(dom, txt) {
        dom.textContent = txt;
    },

    setHtml: function(dom, html) {
        dom.innerHTML = html;
    },

    setStyle: function(dom, style, value) {
        if(typeof style === 'string') {
            dom.style[style] = value;
        } else {
            for(var key in style) {
                dom.style[key] = style[key];
            }
        }
    }
};

})(window);