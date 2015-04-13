/**
 * @file 预加载
 * @author yumao [zhangyu38@baidu.com]
 * @create 2015-04-06
 */

define(function (require) {

    function preload() {
        var game = this.game;

        var path = 'src/img/';

        game.load.image('tile', path + 'tile.png');

        game.load.image('toy-1', path + 'toy-1.png');
        game.load.image('toy-2', path + 'toy-2.png');
        game.load.image('toy-3', path + 'toy-3.png');
        game.load.image('toy-4', path + 'toy-4.png');
        game.load.image('toy-5', path + 'toy-5.png');
        game.load.image('toy-6', path + 'toy-6.png');
    }

    function create() {
        this.state.start('level');
    }

    return {
        preload: preload,
        create: create
    };

});
