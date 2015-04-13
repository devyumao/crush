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

        var move = this.move;
        var matrix = this.matrix;
        var posA = this.getPos();
        var posB = {
            col: this.col + deltaX,
            row: this.row + deltaY
        }
        if ((deltaX === -1 && move.left)
            || (deltaX === 1 && move.right)
            || (deltaY === -1 && move.up)
            || (deltaY === 1 && move.down)
        ) {
            matrix.swap(posA, posB);
        }
        else if ((deltaX || deltaY)) {
            matrix.invalidSwap(posA, posB);
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
        var thisMove = this.move;
        for (var d in thisMove) {
            if (thisMove.hasOwnProperty(d) && typeof move[d] !== 'undefined') {
                thisMove[d] = move[d];
            }
        }
    };

    Toy.prototype.canMove = function () {
        var move = this.move;
        for (var d in move) {
            if (move.hasOwnProperty(d) && move[d]) {
                return true;
            }
        }
        return false;
    };

    Toy.prototype._animateSwap = function (other, invalid) {
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
        var duration = invalid ? 200 : 300;
        var elA = this.el;
        var elB = other.el;

        // 本体置顶
        elA.bringToTop();

        console.log(propA, propB);

        // 动画
        var moveA = game.add.tween(elA)
            .to(propA, duration, ease);
        var moveB = game.add.tween(elB)
            .to(propB, duration, ease);
        if (invalid) {
            var backA = game.add.tween(elA)
                .to(propB, duration, ease);
            var backB = game.add.tween(elB)
                .to(propA, duration, ease);
            moveA.chain(backA);
            moveB.chain(backB);
        }
        moveA.start();
        moveB.start();
    };

    Toy.prototype.swapWith = function (other) {
        this._animateSwap(other);

        // 行列数据交换
        var posB = other.getPos();
        other.setPos(this.getPos());
        this.setPos(posB);
    };

    Toy.prototype.invalidSwapWith = function (other) {
        this._animateSwap(other, true);
    };

    return Toy;

});
