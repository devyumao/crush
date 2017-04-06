/**
 * @file 关卡 state
 * @author yumao [zhangyu38@baidu.com]
 * @create 2015-04-06
 */

define(function (require) {

    var game;

    // TODO: promises
    function fetch(cb) {
        require('common/ajax').get({
            url: 'data/level-1.json',
            success: function (res) {
                res = JSON.parse(res);
                cb(res);
            },
            failure: function (err) {
            }
        });
    }

    function init() {

    }

    function create() {
        game = this.game;

        fetch(function (data) {
            var Level = require('./Level');
            var level = new Level(game, data);
        });
    }

    function update() {
    }

    return {
        init: init,
        create: create,
        update: update
    };

});
