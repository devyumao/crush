/**
 * @file 矩阵
 * @author yumao [zhangyu38@baidu.com]
 * @create 2015-04-06
 */

define(function (require) {

    var Toy = require('./Toy');
    var Chain = require('./Chain');

    function Matrix(game, data) {
        this.game = game;
        this.tiles = data.tiles;
        this.size = this.tiles.length;
        this.toyGroup = game.add.group();
        this.toys = [];
        this.chains = [];
        this.numTypes = 6;
        this.minMatches = 3;

        this._initTiles();
        this._fillToys();
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

    Matrix.prototype._fillToys = function () {
        var tiles = this.tiles;
        var size = this.size;

        for (var row = 0; row < size; ++row) {
            for (var col = 0; col < size; ++col) {
                if (tiles[row][col]) {
                    this._createToy(col, row);
                }
            }
        }
    };

    Matrix.prototype._createToy = function (col, row) {
        var type = this._generateToyType(col, row);
        var toy = new Toy(this.game, {
            matrix: this,
            group: this.toyGroup,
            row: row,
            col: col,
            type: type
        });
        this.toys[row][col] = toy;
        return toy;
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
        toy.setPos({col: col, row: row});
        this.toys[row][col] = toy;
    };

    Matrix.prototype.removeToy = function (col, row) {
        this.toys[row][col] = null;
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

        var me = this;
        // TODO: promises
        toyA.swapWith(toyB, function () {
            me.setToy(posA.col, posA.row, toyB);
            me.setToy(posB.col, posB.row, toyA);
            me._handleMatches();
        });
    };

    Matrix.prototype._handleMatches = function () {
        this._detectMatches();
        if (this.chains.length) {
            var me = this;
            this._removeMatches(function () {
                me._fillHoles(function () {
                    me._addNewToys();
                    me._handleMatches();
                });
            });
        }
        else {
            this._detectValidSwaps();
        }
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

        var matched = this._checkMatchOf(posA.col, posA.row) || this._checkMatchOf(posB.col, posB.row);

        this.setToy(posA.col, posA.row, toyA);
        this.setToy(posB.col, posB.row, toyB);

        return matched;
    };

    Matrix.prototype._checkMatchOf = function (col, row) {
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

    Matrix.prototype._detectMatches = function () {

        var me = this;

        // 水平检测
        this._detectMatchesInOneDimen(function (col, row) {
            return me.getToy(col, row);
        });
        // 竖直检测
        this._detectMatchesInOneDimen(function (col, row) {
            return me.getToy(row, col);
        });
    };

    // 检测一个维度的消除
    Matrix.prototype._detectMatchesInOneDimen = function (getToy) {
        var size = this.size;
        var minMatches = this.minMatches;

        for (var row = 0; row < size; ++row) {
            for (var col = 0; col < size - minMatches + 1;) {
                var toy = getToy(col, row);
                if (!toy) {
                    ++col;
                    continue;
                }
                var type = toy.getType();
                var other;
                var chainLen = 0;
                do {
                    ++chainLen;
                    ++col;
                    other = getToy(col, row);
                } while (other && other.getType() === type);

                // 收集消除链
                if (chainLen >= minMatches) {
                    var chainToys = [];
                    for (var i = col - chainLen; i < col; ++i) {
                        chainToys.push(getToy(i, row));
                    }
                    var chain = new Chain({
                        matrix: this,
                        toys: chainToys
                    });

                    this.chains.push(chain);
                }

                !other && (++col); // 跳过空档
            }
        }
    };

    Matrix.prototype._removeMatches = function (cb) {
        var chains = this.chains;
        for (var i = 0, len = chains.length; i < len; ++i) {
            if (!cb || i !== len - 1) {
                chains[i].remove();
            }
            else {
                // 末元素动画结束回调
                chains[i].remove(cb);
            }
        }
        // 为下次清空
        this.chains = [];
    };

    Matrix.prototype._fillHoles = function (cb) {
        var size = this.size;
        var tiles = this.tiles;
        var columns = [];
        var maxFallens = 0; // 最长掉落数
        var maxIndex; // 最长掉落列的 index

        // 自下而上遍历每一纵列
        for (var col = 0; col < size; ++col) {
            var fallens = [];
            for (var row = size - 1; row >= 0; --row) {
                // 有 tile 而没 toy, 为 hole
                if (tiles[row][col] && !this.getToy(col, row)) {
                    // 向上找到首个 toy
                    for (var lookup = row - 1; lookup >= 0; --lookup) {
                        var toy = this.getToy(col, lookup);
                        if (toy) {
                            this.setToy(col, row, toy);
                            this.removeToy(col, lookup);
                            fallens.push(toy);
                            break;
                        }
                    }
                }
            }
            var fallensNum = fallens.length;
            if (fallensNum) {
                columns.push(fallens);
                if (fallensNum >= maxFallens) { // 等号可以保证：在个数相同的时候，取后初始化的
                    maxFallens = fallensNum;
                    maxIndex = columns.length - 1; // FIX: length 可优化
                }
            }
        }

        // 动画
        for (var c = 0, lenColumns = columns.length; c < lenColumns; ++c) {
            var column = columns[c];
            for (var i = 0, len = column.length; i < len; ++i) {
                var fallen = column[i];
                var delay = 50 + 150 * i;
                if (i === len - 1 && c === maxIndex && cb) {
                    fallen.fall(delay, cb);
                }
                else {
                    fallen.fall(delay);
                }
            }
        }
    };

    Matrix.prototype._addNewToys = function (cb) {
        var size = this.size;
        var tiles = this.tiles;
        var columns = [];

        // 自上而下遍历每一纵列
        for (var col = 0; col < size; ++col) {
            var newToys = [];
            for (var row = 0; row < size && !this.getToy(col, row); ++row) {
                if (tiles[row][col]) {
                    var toy = this._createToy(col, row);
                    newToys.push(toy);
                }
            }
            var newsNum = newToys.length;
            if (newsNum) {
                columns.push(newToys);
            }
        }

        console.log(columns);
    };

    return Matrix;

});
