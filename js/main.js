//require game dependencies
require([
    'game/data/main',
    'game/main'
], function(data, Game) {
    $(function() {
        Game.start({
            containerId: 'game',
            onAssetsProgress: function(evt) {

            },
            onAssetsComplete: function(game) {
            },
            onGameReady: function(game) {
                gf.debug.show(game);
                window.GAME = game;

                var $sw = $('#switch'),
                    $dirty = $('#dirty'),
                    $fullscreen = $('#fullscreen');

                //create a game state for each of the worlds
                data.worlds.forEach(function(w) {
                    var state = new gf.GameState(w);
                    game.addState(state);
                    state.loadWorld(w);

                    state.world.interactive = true;
                    state.world.mousedown = mapDown;
                    state.world.mouseup = mapUp;
                    state.world.mousemove = mapMove;

                    //for interactive maps
                    //state.world.on('tile.mousedown', tileDown);
                    //state.world.on('tile.mouseup', tileUp);

                    //state.world.on('object.mousedown', objDown);
                    //state.world.on('object.mouseup', objUp);

                    $('<option/>', {
                        value: w,
                        text: w.substring(w.lastIndexOf('/') + 1).replace('.json', '') //get the filename with no extension
                    }).appendTo($sw);
                });
                game.enableState(data.worlds[0]);

                $sw.on('change', function() {
                    var world = $sw.find(':selected').val();
                    game.enableState(world);
                });

                $dirty.on('click', function() {
                    game.stage.dirty = true;
                });

                $fullscreen.on('click', function() {
                    game.requestFullscreen();
                });
            }
        });
    });

    function mapDown(e) {
        this.drag = e.getLocalPosition(this.parent);
    }

    function mapUp(e) {
        this.drag = null;
    }

    function mapMove(e) {
        if(this.drag) {
            var pos = e.getLocalPosition(this.parent),
                dx = (pos.x - this.drag.x),
                dy = (pos.y - this.drag.y);

            //tile.layer.map.pan(dx, dy);
            this.pan(dx, dy);

            this.drag = pos;
        }
    }

    function tileDown(e) {
        e.tile.alpha = 0.5;
    }

    function tileUp(e) {
        e.tile.alpha = 1.0;
    }

    function objDown(e) {
        e.object.alpha = 0.5;
    }

    function objUp(e) {
        e.object.alpha = 1.0;
    }
});