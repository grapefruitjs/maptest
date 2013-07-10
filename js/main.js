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
                gf.debug.show($('#game')[0], {
                    game: game,
                    fps: {
                        left: 'auto',
                        right: '5px',
                        top: '35px'
                    },
                    gamepad: false
                });
                window.GAME = game;

                var $sw = $('#switch');
                //create a game state for each of the worlds
                data.worlds.forEach(function(w) {
                    var state = new gf.GameState(w);
                    game.addState(state);
                    state.loadWorld(w);

                    //for interactive maps
                    state.world.on('tile.mouseover', tileOver);
                    state.world.on('tile.mouseout', tileOut);
                    state.world.on('tile.mousedown', tileDown);

                    state.world.on('object.mousedown', objDown);
                    state.world.on('object.mouseup', objUp);
                    state.world.on('object.mousemove', objMove);

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
            }
        });
    });

    var dragging = null;

    function tileOver(e) {
        e.tile.alpha = 0.5;

        if(dragging) {
            dragging.setPosition(
                //have to add 1/2 width to X because the anchor for an object is
                //at the bottom-center for isometric, but it is bottom-left for tiles
                e.tile.position.x + (GAME.world.orientation === 'isometric' ? ((dragging.width || dragging.frame.width) / 2) : 0),
                e.tile.position.y
            );
        }
    }

    function tileOut(e) {
        e.tile.alpha = 1.0;
    }

    function tileDown(e) {
        console.log(e.tile);
    }

    function objDown(e) {
        e.object.alpha = 0.5;
        //e.object.drag = e.data.getLocalPosition(e.object.parent);
        dragging = e.object;
    }

    function objUp(e) {
        e.object.alpha = 1.0;
        //e.object.drag = null;
        dragging = null;
    }

    function objMove(e) {
        /* If I didn't want to do the tile snapping I'm doing above:

        if(e.object.drag) {
            var pos = e.data.getLocalPosition(e.object.parent),
                dx = (pos.x - e.object.drag.x),
                dy = (pos.y - e.object.drag.y);

            e.object.setPosition(
                e.object.position.x + dx,
                e.object.position.y + dy
            );

            e.object.drag = pos;
        }
        */
    }
});