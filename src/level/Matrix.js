/**
 * @file 矩阵
 * @author yumao [zhangyu38@baidu.com]
 * @create 2015-04-06
 */

define(function (require) {

    var Toy = require('./Toy');

    function Matrix(game, data) {
        this.game = game;
        this.tiles = data.tiles;
        this.size = this.tiles.length;
        this.toys = [];
        this.numTypes = 6;
        this.minMatches = 3;

        this._initTiles();
        this.fillToys();
        this._detectValidSwaps();
    }

    Matrix.prototype._initTiles = function () {
        var game = this.game;
        var tiles = this.tiles;
        var size = this.size;
        var toys = [];

        for (var row = 0; row < size; ++row) {
            var line = [];
            for (var col = 0; col < size; ++col) {
                if (tiles[row][col]) {
                    // TODO: init tile ...
                }
                line.push(null);
            }
            toys.push(line);
        }

        this.toys = toys;
    };

    Matrix.prototype.fillToys = function () {
        var game = this.game;
        var tiles = this.tiles;
        var size = this.size;
        var toyGroup = game.add.group();

        for (var row = 0; row < size; ++row) {
            for (var col = 0; col < size; ++col) {
                if (tiles[row][col]) {
                    var type = this._generateToyType(col, row);

                    // 创建实体
                    var toy = new Toy(game, {
                        matrix: this,
                        group: toyGroup,
                        row: row,
                        col: col,
                        type: type
                    });
                    this.setToy(col, row, toy);
                }
            }
        }
    };

    function random(lower, upper) {
        return Math.floor(lower + Math.random() * upper);
    }

    Matrix.prototype._getInterditType = function (type, col, row, direction) {
        var matches = this.minMatches;
        var interditType = 0;
        for (var delta = 1; delta < matches; ++delta) {
            var pToy;
            pToy = (direction === 'col')
                ? this.getToy(col - delta, row)
                : this.getToy(col, row - delta);
            if (!pToy) { // 不在『向前可消域』内，中断
                break;
            }
            if (type !== pToy.getType()) { // 任意不等，中断
                break;
            }
        }
        if (delta === matches) {
            interditType = type;
        }

        return interditType;
    };

    Matrix.prototype._generateToyType = function (col, row) {
        var numTypes = this.numTypes;

        var type = random(1, numTypes);

        var colType = this._getInterditType(type, col, row, 'col');
        var rowType = this._getInterditType(type, col, row, 'row');

        if (colType === type || rowType === type) {
            var types = []; // 可选 type 集合
            for (var t = 1; t <= numTypes; ++t) {
                if (t !== colType && t !== rowType) {
                    types.push(t);
                }
            }
            type = types[random(0, types.length - 1)];
        }

        return type;
    };

    Matrix.prototype.getToy = function (col, row) {
        var size = this.size;
        if (col < 0 || col >= size || row < 0 || row >= size) {
            return null;
        }
        return this.toys[row][col];
    };

    Matrix.prototype.setToy = function (col, row, toy) {
        this.toys[row][col] = toy;
    };

    Matrix.prototype.swap = function (posA, posB) {
        var toyA = this.getToy(posA.col, posA.row);
        if (!toyA) {
            return;
        }
        var toyB = this.getToy(posB.col, posB.row);
        if (!toyB) {
            return;
        }

        console.log('SWAP BEGIN');
        toyA.swapWith(toyB);

        this.setToy(posA.col, posA.row, toyB);
        this.setToy(posB.col, posB.row, toyA);

        this._detectValidSwaps();
    };

    Matrix.prototype.invalidSwap = function (posA, posB) {
        var toyA = this.getToy(posA.col, posA.row);
        if (!toyA) {
            return;
        }
        var toyB = this.getToy(posB.col, posB.row);
        if (!toyB) {
            return;
        }

        toyA.invalidSwapWith(toyB);
    };

    Matrix.prototype._detectValidSwaps = function () {
        var size = this.size;

        for (var row = 0; row < size; ++row) {
            for (var col = 0; col < size; ++col) {
                var toy = this.getToy(col, row);
                if (!toy) {
                    continue;
                }
                var moveRight = this._tryMatch(
                    {col: col, row: row},
                    {col: col + 1, row: row}
                );
                var moveDown = this._tryMatch(
                    {col: col, row: row},
                    {col: col, row: row + 1}
                );
                // 该 toy 可否向右、向下
                toy.setMove({
                    right: moveRight,
                    down: moveDown
                });
                // 右边的 toy 可否向左
                var rightToy = this.getToy(col + 1, row);
                rightToy && rightToy.setMove({
                    left: moveRight
                });
                // 下边的 toy 可否向上
                var downToy = this.getToy(col, row + 1);
                downToy && downToy.setMove({
                    up: moveDown
                });
            }
        }
    };

    Matrix.prototype._tryMatch = function (posA, posB) {
        var toyA = this.getToy(posA.col, posA.row);
        if (!toyA) {
            return false;
        }
        var toyB = this.getToy(posB.col, posB.row);
        if (!toyB || toyA.getType() === toyB.getType()) {
            return false;
        }

        this.setToy(posB.col, posB.row, toyA);
        this.setToy(posA.col, posA.row, toyB);

        var matched = this._checkMatchesOf(posA.col, posA.row) || this._checkMatchesOf(posB.col, posB.row);

        this.setToy(posA.col, posA.row, toyA);
        this.setToy(posB.col, posB.row, toyB);

        return matched;
    };

    Matrix.prototype._checkMatchesOf = function (col, row) {
        var toy = this.getToy(col, row);
        var type = toy.getType();

        var horzLen = 1;
        var c = col - 1;
        var other = this.getToy(c, row);
        while (other && other.getType() === type) {
            ++horzLen;
            other = this.getToy(--c, row);
        }

        c = col + 1;
        other = this.getToy(c, row);
        while (other && other.getType() === type) {
            ++horzLen;
            other = this.getToy(++c, row);
        }

        var vertLen = 1;
        var r = row - 1;
        other = this.getToy(col, r);
        while (other && other.getType() === type) {
            ++vertLen;
            other = this.getToy(col, --r);
        }

        r = row + 1;
        other = this.getToy(col, r);
        while (other && other.getType() === type) {
            ++vertLen;
            other = this.getToy(col, ++r);
        }

        var minMatches = this.minMatches;

        return horzLen >= minMatches || vertLen >= minMatches;
    };

    // Matrix.prototype._test = function (col, row, direction) {
    //     switch (direction) {
    //         case 'left':
    //             break;
    //         case 'right':
    //         case 'up':
    //         case 'down':
    //     }
    // };

    return Matrix;

});
