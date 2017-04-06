/**
 * @file 颜色
 * @author yumao [zhangyu38@baidu.com]
 * @create 2015-04-06
 */

define(function () {

    var colors = {
        'bg': '#fff7ef'
    };

    function get(color) {
        return colors[color];
    }

    return {
        get: get
    };

});
