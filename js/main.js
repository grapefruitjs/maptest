//require game dependencies
require([
    'game/main'
], function(Game) {
    $(function() {
        Game.start({
            containerId: 'game',
            startWorld: 'isosmall',
            onAssetsProgress: function(evt) {

            },
            onAssetsComplete: function(game) {
            },
            onGameReady: function(game) {
                window.GAME = game;

                game.world.on('tile_mouseover', function(e) {
                    e.tile.alpha = 0.5;
                });

                game.world.on('tile_mouseout', function(e) {
                    e.tile.alpha = 1.0;
                });
            }
        });
    });
});