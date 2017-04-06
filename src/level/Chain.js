/**
 * @file 消除链
 * @author yumao [zhangyu38@baidu.com]
 * @create 2015-04-06
 */

define(function (require) {

    function Chain(game, options) {
        this.game = game;
        this.matrix = options.matrix;
        this.shape = options.shape;
        this.toys = options.toys ? options.toys : [];
        this.interToy = null; // 焦点
    }

    Chain.prototype.remove = function (points, cb) {
        var toys = this.toys;
        for (var i = 0, len = toys.length; i < len; ++i) {
            if (!cb || i !== len - 1) {
                toys[i].remove();
            }
            else {
                // 末元素动画结束回调
                toys[i].remove(cb);
            }
        }

        this._animatePoints(points);
    };

    Chain.prototype._animatePoints = function (points) {
        // 找位置中间的 toy
        var toys = this.toys;
        var chainLen = toys.length;
        var midToy;
        switch (this.shape) {
            case 'I':
                midToy = toys[Math.floor((chainLen - 1) * 0.5)];
                break;
            case 'L':
            case 'T':
                midToy = this.interToy;
                break;
        }

        var game = this.game;
        var pointsText = game.add.text(
            midToy.getX(), midToy.getY(),
            '' + points,
            {
                fill: '#fff'
            }
        );
        pointsText.anchor.set(0.5);
        pointsText.alpha = 0;
        // pointsText.bringToTop(); // 要置顶哟

        var duration = 700;
        var show = game.add.tween(pointsText)
            .to({alpha: 1}, duration * 0.5, Phaser.Easing.Quadratic.Out, false);
        var hide = game.add.tween(pointsText)
            .to({alpha: 0}, duration * 0.5, Phaser.Easing.Quadratic.In, false);
        var rise = game.add.tween(pointsText)
            .to({y: '-20'}, duration, Phaser.Easing.Quadratic.InOut, false);
        rise.onComplete.add(function () {
            pointsText.destroy();
        });
        show.chain(hide);
        show.start();
        rise.start();
    };

    Chain.prototype.count = function () {
        return this.toys.length;
    };

    Chain.prototype.getToys = function () {
        return this.toys;
    };

    Chain.prototype.getShape = function () {
        return this.shape;
    };

    // 是否与某链相较
    Chain.prototype.mergeWith = function (other) {
        if (this.shape !== 'I' || other.getShape() !== 'I') {
            return false;
        }

        var toysA = this.toys;
        var toysB = other.getToys();
        var lenA = toysA.length;
        var lenB = toysB.length;
        var mergedToys = toysA;
        var interacted = false;

        for (var indA = 0; indA < lenA; ++indA) {
            var posA = toysA[indA].getPos();
            for (var indB = 0; indB < lenB; ++indB) {
                var toyB = toysB[indB];
                var posB = toyB.getPos();
                if (posA.col !== posB.col || posA.row !== posB.row) {
                    mergedToys.push(toyB);
                }
                else {
                    interacted = true;
                    this.interToy = toyB;
                    if ((indA !== 0 && indA !== lenA - 1) || (indB !== 0 && indB !== lenB - 1)) {
                        this.shape = 'T';
                    }
                    else {
                        this.shape = 'L';
                    }
                }
            }
        }

        if (interacted) {
            this.toys = mergedToys;
        }

        return interacted;
    };

    return Chain;

});
