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
                    state.world.on('object.mouseover', objOver);
                    state.world.on('object.mouseout', objOut);

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

    function tileOver(e) {
        e.tile.alpha = 0.5;
    }

    function tileOut(e) {
        e.tile.alpha = 1.0;
    }

    function objOver(e) {
        e.object.alpha = 0.5;
    }

    function objOut(e) {
        e.object.alpha = 1.0;
    }
});