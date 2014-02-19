//requestAnimationFrame polyfill 的极限压缩版
//https://gist.github.com/paulirish/1579671
//https://gist.github.com/globalaubee/6991570
(function() {
    var lastTime = 0,
        vendors = ['ms', 'moz', 'webkit', 'o'],
        _KEY_AnimationFrame = 'AnimationFrame',
        _KEY_equest = 'equest',
        _KEY_ancel = 'ancel',
        _KEY_requestAnimationFrame = 'r' + _KEY_equest + _KEY_AnimationFrame,
        _KEY_cancelAnimationFrame = 'c' + _KEY_ancel + _KEY_AnimationFrame,
        now = Date.now || function() {
            return +new Date
        };
    for (var x = 0; x < vendors.length && !global[_KEY_requestAnimationFrame]; ++x) {
        global[_KEY_requestAnimationFrame] = global[vendors[x] + 'R' + _KEY_equest + _KEY_AnimationFrame];
        global[_KEY_cancelAnimationFrame] = global[vendors[x] + 'C' + _KEY_ancel + _KEY_AnimationFrame] || global[vendors[x] + 'C' + _KEY_ancel + 'R' + _KEY_equest + _KEY_AnimationFrame];
    }

    if (!global[_KEY_requestAnimationFrame]) {
        global[_KEY_requestAnimationFrame] = function(callback, element) {
            var currTime = now(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                id = global.setTimeout(function() {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        global[_KEY_cancelAnimationFrame] = function(id) {
            clearTimeout(id);
        };
    }

}());
