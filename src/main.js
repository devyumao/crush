/**
 * @file 主程序
 * @author yumao [zhangyu38@baidu.com]
 * @create 2015-04-06
 */

define(function (require) {

    function init() {
        var game = new Phaser.Game(480, 800, Phaser.CANVAS, '');

        game.state.add('boot', require('boot'));
        game.state.add('preload', require('preload'));
        game.state.add('level', require('level/level'));

        game.state.start('boot');
    }

    return {
        init: init
    };

});
