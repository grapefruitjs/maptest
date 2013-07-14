var n = 0;
//require game dependencies
define([
    'game/data/main',
    'game/entities/main',
    'game/hud/main'
], function(data, entities, huditems) {
    var $win = $(window),
        $game,
        game;

    $win.on('resize', onWindowResize);

    function create(obj) {
        $game = $('#' + obj.containerId); 
        game = new gf.Game(obj.containerId, {
            gravity: obj.gravity || 0,
            friction: obj.friction || 0,
            width: $game.width() - 3,
            height: $game.height() - 3,
            background: 0x808080
        });

        game.loader.on('progress', function(evt) {
            //called on each load complete
            if(obj.onAssetsProgress)
                obj.onAssetsProgress.call(this, evt);
        });

        //called when all are done loading
        game.loader.on('complete', function() {
            if(obj.onAssetsComplete)
                obj.onAssetsComplete.call(this, game);

            if(obj.startWorld)
                game.loadWorld(obj.startWorld);

            //TODO: bind game keys
            //TODO: init HUD

            if(obj.onGameReady)
                obj.onGameReady.call(this, game);

            //render
            game.render();
        });

        game.loader.load(data.resources);
    }

    function onWindowResize() {
        var w = $game.width() - 3,
            h = $game.height() - 3;
        console.log('resize', w, h)

        if(game)
            game.resize(w, h);
    }

    return {
        start: create
    }
});