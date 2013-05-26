"use strict";

var t = new vividcode.nashorn.TestHarness();

t.defineTest("Always ok!", 1, function (asserts) {
    asserts.ok(true);
});

t.defineTest("You can change stacktrace depth", 2, function (asserts) {
    var myAssert = function () {
        asserts.changeDepthOffset(1);
        asserts.ok(true, "いいね");
        asserts.changeDepthOffset(-1);
    };
    asserts.ok(true);
    myAssert();
});

t.setupTapOutput();
t.runTests();
