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

    Chain.prototype.remove = function (cb) {
        var toys = this.toys;
        for (var i = 0, len = this.toys.length; i < len; ++i) {
            if (!cb || i !== len - 1) {
                toys[i].remove();
            }
            else {
                // 末元素动画结束回调
                toys[i].remove(cb);
            }
        }
    };

    return Chain;

});
