/**
 * @file 关卡
 * @author yumao [zhangyu38@baidu.com]
 * @create 2015-05-03
 */

define(function (require) {

    function Level(game, data) {
        var Matrix = require('./Matrix');
        this.martix = new Matrix(game, {
            level: this,
            tiles: data.tiles
        });

        var Board = require('./Board');
        this.board = new Board(game, {
            target: data.target,
            moves: data.moves
        });
    }

    Level.prototype.addScore = function (value) {
        this.board.addScore(value);
    };

    Level.prototype.minusOneMove = function () {
        this.board.minusOneMove();
    };

    return Level;

});
