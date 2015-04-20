/**
 * @file 玩物
 * @author yumao [zhangyu38@baidu.com]
 * @create 2015-04-06
 */

define(function (require) {

    var TOP = 126;
    var LEFT = 32;

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

    // TODO: 动画状态不可移
    function onInputDown(target, pointer) {
        this.touchStart = {
            x: pointer.x,
            y: pointer.y
        };
        console.log(this);
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
        var size = 52;
        var x = LEFT + size * this.col;
        var y = TOP + size * this.row;

        // var tile = this.game.add.image(x, y, 'tile');
        // tile.scale.set(size);
        // this.tile = tile;

        var el = this.game.add.image(x, y, 'toy-' + this.type);
        el.scale.set(size);
        el.anchor.set(0.5);
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

    Toy.prototype._animateSwap = function (other, invalid, cb) {
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

        // 动画
        var moveA = game.add.tween(elA)
            .to(propA, duration, ease);
        var moveB = game.add.tween(elB)
            .to(propB, duration, ease);
        if (invalid) {
            // 无效交换 弹回动画
            var backA = game.add.tween(elA)
                .to(propB, duration, ease);
            var backB = game.add.tween(elB)
                .to(propA, duration, ease);
            moveA.chain(backA);
            moveB.chain(backB);
        }
        else {
            // 有效交换 动画完成处理其它
            cb && moveA.onComplete.add(cb);
        }

        moveA.start();
        moveB.start();
    };

    Toy.prototype.swapWith = function (other, cb) {
        this._animateSwap(other, false, cb);
    };

    // // 行列数据交换
    // Toy.prototype._swapPosWith = function (other) {
    //     var posB = other.getPos();
    //     other.setPos(this.getPos());
    //     this.setPos(posB);
    // };

    Toy.prototype.invalidSwapWith = function (other) {
        this._animateSwap(other, true);
    };

    Toy.prototype.remove = function (cb) {
        var game = this.game;

        var vanish = game.add.tween(this.el.scale)
            .to({x: 0, y: 0}, 400, Phaser.Easing.Quadratic.InOut);
        vanish.onComplete.add(function () {
            cb && cb();
            this._destroy();
        }, this);

        // 数据在动画开始前清除，防止此时用户触发的 swap 对遗留数据依然起效
        // 动画期间禁止操作，就不一定了
        this.matrix.removeToy(this.col, this.row);
        vanish.start();
    };

    Toy.prototype.fall = function (delay, cb) {
        var game = this.game;
        var el = this.el;
        var elHeight = el.height;
        var newY = TOP + elHeight * this.row;
        var duration = (newY - el.y) / elHeight * 100;

        var fall = game.add.tween(el)
            .to({y: newY}, duration, Phaser.Easing.Quadratic.In, false, delay);
        cb && fall.onComplete.add(cb);
        fall.start();
    };

    Toy.prototype._destroy = function () {
        this.el.destroy();
    };

    return Toy;

});
