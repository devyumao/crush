/**
 * @file 玩物
 * @author yumao [zhangyu38@baidu.com]
 * @create 2015-04-06
 */

define(function (require) {

    function Toy(game, options) {
        this.game = game;
        this.matrix = options.matrix;
        this.group = options.group;
        this.row = options.row;
        this.col = options.col;
        this.type = options.type;
        // this.tile = null;
        this.el = null;
        this.touchStart = null;
        this.move = {
            up: false,
            right: false,
            down: false,
            left: false
        };

        this._init();
    }

    function onInputDown(target, pointer) {
        this.touchStart = {
            x: pointer.x,
            y: pointer.y
        };

        // console.log(this.matrix._checkMatchesOf(this.col, this.row));

        console.log(this.getMove());
    }

    function onInputUp(target, pointer) {
        var touchStart = this.touchStart;
        if (!touchStart) {
            return;
        }

        var threshold = 15;
        var deltaX = 0;
        var deltaY = 0;
        var offsetX = pointer.x - touchStart.x;
        var offsetY = pointer.y - touchStart.y;

        if (offsetX < -threshold) {
            deltaX = -1;
        }
        else if (offsetX > threshold) {
            deltaX = 1;
        }

        if (offsetY < -threshold) {
            deltaY = -1;
        }
        else if (offsetY > threshold) {
            deltaY = 1;
        }

        if (deltaX && deltaY) { // 都达到阈值，取其大
            if (Math.abs(offsetX) > Math.abs(offsetY)) {
                deltaY = 0;
            }
            else {
                deltaX = 0;
            }
        }

        if (deltaX || deltaY) {
            var matrix = this.matrix;
            matrix.swap(
                this.getPos(),
                {
                    col: this.col + deltaX,
                    row: this.row + deltaY
                }
            );
        }

        this.touchStart = null;
    }

    Toy.prototype._init = function () {
        var top = 100;
        var left = 6;
        var size = 52;

        var x = left + size * this.col;
        var y = top + size * this.row;

        // var tile = this.game.add.image(x, y, 'tile');
        // tile.scale.set(size);
        // this.tile = tile;

        var el = this.game.add.image(x, y, 'toy-' + this.type);
        el.scale.set(size);
        el.inputEnabled = true;
        // el.input.enableDrag();
        // el.input.allowHorizontalDrag = false;
        // el.input.allowVerticalDrag = false;
        el.events.onInputDown.add(onInputDown, this);
        el.events.onInputUp.add(onInputUp, this);
        // this.group.add(el);
        this.el = el;
    };

    Toy.prototype.getType = function () {
        return this.type;
    };

    Toy.prototype.getPos = function () {
        return {
            col: this.col,
            row: this.row
        };
    };

    Toy.prototype.setPos = function (pos) {
        if (typeof pos.col !== 'undefined') {
            this.col = pos.col;
        }
        if (typeof pos.row !== 'undefined') {
            this.row = pos.row;
        }
    };

    Toy.prototype.getEl = function () {
        return this.el;
    };

    Toy.prototype.getMove = function () {
        return this.move;
    };

    Toy.prototype.setMove = function (move) {
        if (typeof move.up !== 'undefined') {
            this.move.up = !!move.up;
        }
        if (typeof move.right !== 'undefined') {
            this.move.right = !!move.right;
        }
        if (typeof move.down !== 'undefined') {
            this.move.down = !!move.down;
        }
        if (typeof move.left !== 'undefined') {
            this.move.left = !!move.left;
        }
    };

    Toy.prototype.swapWith = function (other) {
        var game = this.game;

        var offset = this.el.width;
        var posB = other.getPos();
        var propA = {};
        var propB = {};

        if (this.col !== posB.col) {
            propA.x = ((this.col < posB.col) ? 1 : -1) * offset;
            propB.x = -propA.x;
            propA.x += '';
            propB.x += '';
        }
        else if (this.row !== posB.row) {
            propA.y = ((this.row < posB.row) ? 1 : -1) * offset;
            propB.y = -propA.y;
            propA.y += '';
            propB.y += '';
        }

        var ease = Phaser.Easing.Sinusoidal.InOut;
        var duration = 300;
        var elA = this.el;

        // 本体置顶
        elA.bringToTop();

        // 动画
        var moveA = game.add.tween(elA)
            .to(propA, duration, ease);
        var moveB = game.add.tween(other.getEl())
            .to(propB, duration, ease);
        moveA.start();
        moveB.start();

        // 行列数据交换
        other.setPos(this.getPos());
        this.setPos(posB);
    };

    Toy.prototype.detectValidMoves = function () {

    };

    return Toy;

});
