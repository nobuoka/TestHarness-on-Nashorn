"use strict";

var vividcode;
if (!vividcode) vividcode = {};
if (!vividcode.nashorn) vividcode.nashorn = {};
vividcode.nashorn.TestHarness = (function () {

var TestHarness = function () {
    this._tests = [];
    this._numAllAsserts = 0;
    this._numAllTests = 0;
};

var getStackElem = function (depthOffset) {
    try {
        throw new Error();
    } catch (err) {
        return err.stack[2+depthOffset];
    }
};

var observers = {};
var Observer = function (type, callbackFunc) {
    if (!observers[type]) observers[type] = [];
    this._type = type;
    this._callbackFunc = callbackFunc;
    observers[type].push(this);
};
Observer.prototype.stop = function () {
};
TestHarness.prototype.createObserver = function (type, callbackFunc) {
    return new Observer(type, callbackFunc);
};
var notify = function (type, detailData) {
    if (!observers[type]) {
        return;
    }
    var obj = {
        type: type,
        detail: detailData,
    };
    var oo = Array.prototype.slice.call(observers[type]);
    oo.forEach(function (o) {
        o._callbackFunc.call(null, obj);
    });
};

TestHarness.prototype.runTests = function () {
    notify("runnerstart", { numAllTests: this._numAllTests, numAllAsserts: this._numAllAsserts });
    this._tests.forEach(function (test) {
        var testDesc = test.desc;
        var testFunc = test.func;
        var numAsserts = test.numAsserts;
        notify("teststart", { desc: testDesc, numAsserts: numAsserts });
        var asserts = new Asserts();
        testFunc.call(void 0, asserts);
        notify("testend", {});
    });
    notify("runnerend", {});
};

TestHarness.prototype.defineTest = function (testDesc, arg2, arg3) {
    var numAsserts;
    var testFunc;
    if (arg3) {
        numAsserts = arg2;
        testFunc = arg3;
    } else {
        numAsserts = void 0;
        testFunc = arg2;
    }
    this._numAllTests += 1;
    if (typeof this._numAllAsserts === "number" && typeof numAsserts === "number") {
        this._numAllAsserts += numAsserts;
    } else {
        this._numAllAsserts = void 0;
    }
    this._tests.push({ desc: testDesc, numAsserts: numAsserts, func: testFunc });
};

var Asserts = function () {
    this._depthOffset = 0;

};
Asserts.prototype.changeDepthOffset = function (depthDelta) {
    this._depthOffset += depthDelta;
};
Asserts.prototype.ok = function (actVal, msg) {
    var stackElems = [];
    for (var sdo = this._depthOffset; sdo >= 0; --sdo) {
        stackElems.push(getStackElem(0 + sdo));
    }
    notify("assert", {
        isPass: (actVal ? true : false),
        stackElems: stackElems,
        assertDesc: msg,
    });
};

TestHarness.prototype.setupTapOutput = function () {
    new TapOutput(this);
};
var TapOutput = function (testManager) {
    var numAsserts = 0;
    this._testNumber = 0;
    var outputNumAssertsBeforeRunning = false;
    testManager.createObserver("runnerstart", function (info) {
        var numAsserts = info.detail.numAllAsserts;
        if (typeof numAsserts === "number") {
            outputNumAssertsBeforeRunning = true;
            print("1.." + numAsserts);
        }
    });
    testManager.createObserver("runnerend", function (info) {
        if (!outputNumAssertsBeforeRunning) {
            print("1.." + numAsserts);
        }
    });
    testManager.createObserver("assert", function (info) {
        numAsserts++;
        var firstline = [];
        firstline.push(info.detail.isPass ? "ok" : "not ok");
        firstline.push(numAsserts);
        var testDesc = info.detail.assertDesc;
        if (testDesc) firstline.push(testDesc);
        print(firstline.join(" "));

        var stackElems = info.detail.stackElems;
        var stackStr = stackElems.map(function (s) {
            return (s.fileName + ", line " + s.lineNumber);
        }).join(" > ");
        print("# " + stackStr);
    });
};

return TestHarness;
}).call(this);
