var width = 1000;
var height = 800;


var audio = new webkitAudioContext();

var snapX = 10;
var snapY = 10;
var gridBounds = [1, 1, 99, 79];

var tgtPos = {x: 0, y: 0};
var curPos = {x: 0, y: 0};
var circle;

var graphics;

var grid = [];
var ngrid = [];

var inc = 0;
var woodcutter = {x:width/2,y:width/2,status:0,wood:0};

window.onload = function () {
    var game = new Phaser.Game(width, height, Phaser.AUTO, 'SiegeNation', {
        preload: preload,
        create: create,
        update: update
    });

    function preload() {
    }

    function create() {
        var gw = (gridBounds[2] - gridBounds[0]) * snapX;
        var gh = (gridBounds[3] - gridBounds[1]) * snapY;
        var gx = gridBounds[0] * snapX;
        var gy = gridBounds[1] * snapY;

        tgtPos.x = game.world.centerX;
        tgtPos.y = game.world.centerY;
        curPos.x = game.world.centerX;
        curPos.y = game.world.centerY;

        game.add.sprite(gx, gy, game.create.grid("bg", gw + 1, gh + 1, snapX, snapY, "#222277"));

        graphics = game.add.graphics(0, 0);

        game.input.onTap.add(onTap, this);

        for (var i = gridBounds[0]; i <= gridBounds[2]; i++) {
            grid[i] = [];
            ngrid[i] = [];
            for (var j = gridBounds[1]; j <= gridBounds[3]; j++) {
                grid[i][j] = {rock: 0, tree: 0, target: 0, hunter: 0};
                if (Math.random() < 0.1) {
                    grid[i][j].tree = 1;
                } else if (Math.random() < 0.05) {
                    grid[i][j].rock = 1;
                }

                ngrid[i][j] = grid[i][j];
            }
        }


    }

    function onTap(pointer, doubleTap) {
        console.log("pointer: ", pointer);
    } //

    function getGridValue(grid, x, y, property) {
        if (!grid[x]) return 0;
        if (!grid[x][y]) return 0;

        return grid[x][y][property] ? grid[x][y][property] : 0;
    }


    function updateTarget(tx,ty) {

        var stink = 400;
        if ( getGridValue( grid, tx, ty, "rock" ) ) stink /= 4;
        else if ( getGridValue( grid, tx, ty, "tree" ) ) stink /= 8;

        if (grid[tx] && grid[tx][ty]) grid[tx][ty].target = stink;

        for (var i = gridBounds[0]; i <= gridBounds[2]; i++) {
            for (var j = gridBounds[1]; j <= gridBounds[3]; j++) {
                var tv = 0;

                if ( i == tx && j == ty ) continue;

                tv += getGridValue(grid, i + 1, j, "target");
                tv += getGridValue(grid, i - 1, j, "target");
                tv += getGridValue(grid, i, j + 1, "target");
                tv += getGridValue(grid, i, j - 1, "target");

                if (grid[i][j].rock > 0) {
                    tv = 0;
                } else if ( grid[i][j].tree > 0 ) {
                    tv /= 4;
                } //
                ngrid[i][j].target = tv / 4;

            }
        }

    }

    function update() {
        inc ++;
        tgtPos.x = game.input.x;
        tgtPos.y = game.input.y;

        graphics.clear();

        var tx = Math.floor(tgtPos.x / snapX);
        var ty = Math.floor(tgtPos.y / snapY);

        var hx = Math.floor(curPos.x / snapX);
        var hy = Math.floor(curPos.y / snapY);

        if ( ( inc % 3 ) == 1 ) updateTarget( tx, ty );
        if ( ( inc % 3 ) == 1 ) updateHunter( hx, hy );

        for (var i = gridBounds[0]; i <= gridBounds[2]; i++) {
            for (var j = gridBounds[1]; j <= gridBounds[3]; j++) {
                var tv = 0;

                if (grid[i][j].rock > 0 ) {
                    graphics.beginFill(0x9999AA, 0.7);
                    graphics.drawRect(i * snapX, j * snapY, snapX, snapY);
                    graphics.endFill();
                } else if (grid[i][j].tree > 0 ) {
                    graphics.beginFill(0x11FF11, 0.7);
                    graphics.drawRect(i * snapX, j * snapY, snapX, snapY);
                    graphics.endFill();
                }

                var targetColor = Phaser.Color.interpolateColor(0x000000, 0x770000, 300, 10 * Math.log(ngrid[i][j].target));
                //var color = Phaser.Color.createColor( grid[i][j].target, grid[i][j].target*4, grid[i][j].target/4 );

                graphics.beginFill(targetColor, 0.3);
                graphics.drawRect(i * snapX, j * snapY, snapX, snapY);
                graphics.endFill();


                var hunterColor = Phaser.Color.interpolateColor(0x000000, 0x000077, 300, 10 * Math.log(ngrid[i][j].hunter));
                //var color = Phaser.Color.createColor( grid[i][j].target, grid[i][j].target*4, grid[i][j].target/4 );

                graphics.beginFill(hunterColor, 0.3);
                graphics.drawRect(i * snapX, j * snapY, snapX, snapY);
                graphics.endFill();



            }
        }

        var tmp = grid;
        grid = ngrid;
        ngrid = tmp;


        var dx = getGridValue( grid, hx+1, hy,   "target" ) - getGridValue( grid, hx-1, hy,   "target" );
        var dy = getGridValue( grid, hx,   hy+1, "target" ) - getGridValue( grid, hx,   hy-1, "target" );

        var norm = Math.sqrt(dx * dx + dy * dy);

        if (norm > 0) {
            dx = dx / norm;
            dy = dy / norm;
        } else {
            dx = 0;
            dy = 0;
        }

        curPos.x += dx;
        curPos.y += dy;

        graphics.beginFill(0x333333, 0.7);
        graphics.drawRect(hx * snapX, hy * snapY, snapX, snapY);
        graphics.endFill();

        graphics.beginFill(0x0000FF, 1);
        graphics.drawCircle(curPos.x - 0.5, curPos.y - 0.5, 20);
        graphics.endFill();

        graphics.beginFill(0xFF0000, 1);
        graphics.drawCircle(curPos.x - 0.5, curPos.y - 0.5, 10);
        graphics.endFill();

        graphics.lineStyle(2, 0x00FF00, 1);
        graphics.moveTo(curPos.x, curPos.y);
        graphics.lineTo(curPos.x + 10 * dx, curPos.y + 10 * dy);

        graphics.beginFill(0x003366, 0.7);
        graphics.drawRect(tx * snapX, ty * snapY, snapX, snapY);
        graphics.endFill();


    }

    function playNote(frequency, volume, duration) {
        var hp = 1 / (frequency / 2);
        duration = duration + hp - (duration % hp);
        var g = audio.createGain();
        var o = audio.createOscillator();
        console.log("audio: ", audio);
        console.log("oscillator: ", o);
        o.connect(g);
        g.connect(audio.destination);
        o.frequency.value = frequency;
        g.gain.value = volume;
        //o.noteOn(0);
        o.start();
        o.stop(audio.currentTime + duration);
    }


}
;


