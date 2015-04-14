/**
 * @file 消除链
 * @author yumao [zhangyu38@baidu.com]
 * @create 2015-04-06
 */

define(function (require) {

    function Chain(options) {
        this.matrix = options.matrix;
        this.toys = options.toys ? options.toys : [];
    }

    return Chain;

});