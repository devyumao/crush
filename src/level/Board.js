/**
 * @file 信息板
 * @author yumao [zhangyu38@baidu.com]
 * @create 2015-05-03
 */

define(function (require) {

    function Board(game, options) {
        this.game = game;
        this.target = options.target;
        this.moves = options.moves;
        this.score = 0;

        this._initElements();
    }

    // 该方法内元素位置、样式皆临时
    Board.prototype._initElements = function () {
        var game = this.game;

        var targetTitle = game.add.text(
            70, 20,
            '本关目标',
            {
                fill: '#666'
            }
        );
        targetTitle.anchor.set(0.5, 0);
        targetTitle.fontSize = 20;

        var movesTitle = game.add.text(
            game.width * 0.5, 20,
            '剩余步数',
            {
                fill: '#666'
            }
        );
        movesTitle.anchor.set(0.5, 0);
        movesTitle.fontSize = 20;

        var scoreTitle = game.add.text(
            game.width - 70, 20,
            '本关得分',
            {
                fill: '#666'
            }
        );
        scoreTitle.anchor.set(0.5, 0);
        scoreTitle.fontSize = 20;

        // 数值元素
        var targetEl = game.add.text(
            70, 55,
            '' + this.target,
            {
                fill: '#bbb'
            }
        );
        targetEl.anchor.set(0.5, 0);
        this.targetEl = targetEl;

        var movesEl = game.add.text(
            game.width * 0.5, 55,
            '' + this.moves,
            {
                fill: '#bbb'
            }
        );
        movesEl.anchor.set(0.5, 0);
        this.movesEl = movesEl;

        var scoreEl = game.add.text(
            game.width - 70, 55,
            '' + this.score,
            {
                fill: '#bbb'
            }
        );
        scoreEl.anchor.set(0.5, 0);
        this.scoreEl = scoreEl;
    };

    Board.prototype.addScore = function (value) {
        this.score += value;
        this.scoreEl.text = '' + this.score;
    };

    Board.prototype.minusOneMove = function () {
        this.moves -= 1;
        this.movesEl.text = '' + this.moves;
    };

    return Board;
});
