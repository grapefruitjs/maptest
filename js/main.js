//require game dependencies
require([
    'game/main'
], function(Game) {
    $(function() {
        Game.start({
            containerId: 'game',
            startWorld: 'isosmall',
            assetsProgress: function(evt) {

            },
            assetsComplete: function(game) {
                window.GAME = game;
            }
        });
    });
});