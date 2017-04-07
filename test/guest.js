var Status = require("../src/lib/status.js").default;
var expect = require("chai").expect;
var sinon = require("sinon");
var helpers = require("./helpers");

// Populate window.name with fake meta data
var SAFEFRAME_SECRET = "/* @echo SECRET_KEY */";
var meta = {
    boolean: true,
    number: 1,
    conf: {
        "exp-ovr": true,
        "exp-push": true,
        "read-cookie": true,
        "write-cookie": true
    }
};
var privateData = {
    magicWord: {
        privateKey: "let me tell you a secret"
    }
};
meta[SAFEFRAME_SECRET] = privateData;
helpers.setMetadata(meta, SAFEFRAME_SECRET);

require("../src/guest/index.js");

describe("DeviantArt SafeFrames Guest", function() {
    describe("window.$sf", function() {
        it("should be defined globally", function() {
            expect(window.$sf).to.exist;
        });
        it("should have the correct version", function() {
            expect(window.$sf.ver).to.equal("1-1-0");
        });
        it("should have the correct specification version", function() {
            expect(window.$sf.specVersion).to.equal("1.1");
        });
        it("should expose the ext namespace", function() {
            expect(window.$sf.ext).to.exist;
        });
    });
    describe("window.$sf.ext", function() {
        it("should expose the meta endpoint", function() {
            expect(window.$sf.ext.meta).to.be.a("function");
        });
        it("should expose the status endpoint", function() {
            expect(window.$sf.ext.status).to.be.a("function");
        });
        it("should expose the cookie endpoint", function() {
            expect(window.$sf.ext.cookie).to.be.a("function");
        });
        it("should expose the supports endpoint", function() {
            expect(window.$sf.ext.supports).to.be.a("function");
        });
        it("should expose the inViewPercentage endpoint", function() {
            expect(window.$sf.ext.inViewPercentage).to.be.a("function");
        });
        it("should expose the winHasFocus endpoint", function() {
            expect(window.$sf.ext.winHasFocus).to.be.a("function");
        });
        it("should expose the expand endpoint", function() {
            expect(window.$sf.ext.expand).to.be.a("function");
        });
        it("should expose the collapse endpoint", function() {
            expect(window.$sf.ext.collapse).to.be.a("function");
        });
        it("should expose the register endpoint", function() {
            expect(window.$sf.ext.register).to.exist;
        });
        it("should expose the geom endpoint", function() {
            expect(window.$sf.ext.geom).to.be.a("function");
        });
    });
    describe("window.$sf.ext.meta", function() {
        it("should return correct values", function() {
            expect(window.$sf.ext.meta("boolean"), 'meta("boolean")').to.be.true;
            expect(window.$sf.ext.meta("number"), 'meta("number")').to.be.a("number");
            expect(window.$sf.ext.meta("number"), 'meta("number")').to.equal(1);
            expect(window.$sf.ext.meta("conf"), 'meta("conf")').to.be.an("object");
        });
        it("should not expose private metadata", function() {
            expect(window.$sf.ext.meta("privateKey"), "privateKey").to.be.undefined;
        });
        it("unless you know the magic word", function() {
            expect(window.$sf.ext.meta("privateKey", "magicWord"), "privateKey", ).to.equal(meta[SAFEFRAME_SECRET].magicWord.privateKey);
        });
    });
    describe("window.$sf.ext.status", function() {
        const statuses = Object.keys(Status).map(function(key) {
            return Status[key];
        });
        it("should return a valid status", function() {
            expect(window.$sf.ext.status()).to.be.oneOf(statuses);
        });
        it("should update status", function() {
            helpers.simulateHostMessage("status.update", {status: Status.READY});
            expect(window.$sf.ext.status()).to.equal(Status.READY);
        });
    });
    describe("window.$sf.ext.supports", function() {
        it("should support everything since we explicitely told it to in the conf", function() {
            const features = [
                "exp-ovr",
                "exp-push",
                "read-cookie",
                "write-cookie",
            ];

            features.forEach(function(feature) {
                expect(window.$sf.ext.supports(feature)).to.be.true;
            });
        });
    });
    describe("window.$sf.ext.geom", function() {
        var geom = window.$sf.ext.geom();
        it("should expose the win endpoint", function() {
            // Identifies the location, width, and height (in pixels) of the
            // browser or application window boundaries relative to the device
            // screen
            expect(geom.win).to.exist;
            expect(geom.win.t).to.exist;
            expect(geom.win.b).to.exist;
            expect(geom.win.l).to.exist;
            expect(geom.win.r).to.exist;
            expect(geom.win.w).to.exist;
            expect(geom.win.h).to.exist;
        });
        it("should expose the exp endpoint", function() {
            // Identifies the expected distance available for expansion
            // within the host content along with information about whether
            // controls allow the end user to scroll the page. If
            // “scrollable,” the SafeFrame content can expand to
            // dimensions greater than those provided.
            expect(geom.exp).to.exist;
            expect(geom.exp.t).to.exist;
            expect(geom.exp.b).to.exist;
            expect(geom.exp.l).to.exist;
            expect(geom.exp.r).to.exist;
            expect(geom.exp.xs).to.exist;
            expect(geom.exp.yx).to.exist;
        });
        it("should expose the self endpoint", function() {
            // Identifies the z-index and location, width, and height 
            // (in pixels) of the SafeFrame container relative to the
            // browser or application window (win). 
            expect(geom.self).to.exist;
            expect(geom.self.t).to.exist;
            expect(geom.self.b).to.exist;
            expect(geom.self.l).to.exist;
            expect(geom.self.r).to.exist;
            expect(geom.self.w).to.exist;
            expect(geom.self.h).to.exist;
            expect(geom.self.xiv).to.exist;
            expect(geom.self.yiv).to.exist;
            expect(geom.self.iv).to.exist;
            expect(geom.self.z).to.exist;
        });
    });
});

describe("DeviantArt Safeframe Guest Integration Tests", function() {
    let postMessageSpy;
    before(function() {
        postMessageSpy = sinon.spy(window, "postMessage");
    });
    after(function() {
        postMessageSpy.restore();
    });

    describe("$sf.ext.expand()", function() {
        beforeEach(function(){
            postMessageSpy.reset();
        });
        it("should trigger a postMessage once", function() {
            window.$sf.ext.expand({t:100});
            expect(postMessageSpy.callCount).to.equal(1);
        });
        it("should send the valid 'expand' message", function() {
            window.$sf.ext.expand({t:100});
            const message = JSON.parse(postMessageSpy.getCall(0).args[0]);
            expect(message.id).to.be.a("number");
            expect(message.ts).to.be.a("number");
            expect(message.namespace).to.equal("dasf");
            expect(message.type).to.equal("expand");
            expect(message.data.t).to.equal(100);
        });
    });

    describe("$sf.ext.collapse()", function() {
        beforeEach(function(){
            postMessageSpy.reset();
            // Change the status to expanded so that we can collapse
            helpers.simulateHostMessage("status.update", {status: Status.EXPANDED});
        });
        it("should trigger a postMessage once", function() {
            window.$sf.ext.collapse();
            expect(postMessageSpy.callCount).to.equal(1);
        });
        it("should send the valid 'expand' message", function() {
            window.$sf.ext.collapse();
            const message = JSON.parse(postMessageSpy.getCall(0).args[0]);
            expect(message.id).to.be.a("number");
            expect(message.ts).to.be.a("number");
            expect(message.namespace).to.equal("dasf");
            expect(message.type).to.equal("collapse");
        });
    });

    describe("$sf.ext.geom()", function() {
        it("should update the geom", function() {
            const newGeom = {
                win: {
                    t: 0,
                    l: 0,
                    r: 800,
                    b: 600,
                    w: 800,
                    h: 600
                },
                exp: {
                    t: 100,
                    l: 100,
                    r: 100,
                    b: 100,
                    xs: 1,
                    yx: 1
                },
                self: {
                    t: 100,
                    l: 100,
                    r: 700,
                    b: 500,
                    w: 600,
                    h: 400,
                    xiv: 1,
                    yiv: 1,
                    iv: 1,
                    z: 1
                }
            };
            const oldGeom = window.$sf.ext.geom();
            expect(oldGeom).to.not.eql(newGeom);
            helpers.simulateHostMessage("geom.update", {g: newGeom});
            const geom = window.$sf.ext.geom();
            expect(geom).to.eql(newGeom);
            helpers.simulateHostMessage("geom.update", {g: oldGeom});
        });
    });
    describe("$sf.ext.inViewPercentage()",  function() {
        it("should return the correct view percentage", function() {
            const oldGeom = window.$sf.ext.geom();
            expect(window.$sf.ext.inViewPercentage()).to.equal(0);
            oldGeom.self.iv = 1;
            helpers.simulateHostMessage("geom.update", {g: oldGeom});
            expect(window.$sf.ext.inViewPercentage()).to.equal(100);
            oldGeom.self.iv = 0;
            helpers.simulateHostMessage("geom.update", {g: oldGeom});
        });
    });
    describe("$sf.ext.winHasFocus()",  function() {
        it("should return the correct window focus", function() {
            helpers.simulateHostMessage("focus");
            expect(window.$sf.ext.winHasFocus()).to.be.true;
            helpers.simulateHostMessage("blur");
            expect(window.$sf.ext.winHasFocus()).to.be.false;
        });
    });
    describe("$sf.ext.cookie()",  function() {
        beforeEach(function(){
            postMessageSpy.reset();
        });
        it("should trigger a postMessage once", function() {
            window.$sf.ext.cookie('test');
            expect(postMessageSpy.callCount).to.equal(1);
        });
    });
    describe("$sf.ext.register()",  function() {
        it("should register a callback to trigger on each and every update from the host", function() {
            const callback = sinon.spy();
            window.$sf.ext.register(300, 250, callback);
            
            const geom = window.$sf.ext.geom();
            const status = window.$sf.ext.status();
            const events = [
                "registered",
                 "geom.update",
                 "status.update",
                 "geom.update",
                 "resize",
                 "resize",
                 "resize",
                 "focus",
                 "status.update",
                 "status.update",
                 "status.update",
                 "blur",
                 "cookie",
                 "cookie"
            ];
            events.map((eventType) => {
                helpers.simulateHostMessage(eventType, {g: geom, status: status});
            });
            expect(callback.callCount).to.equal(events.length);
        });
    });
});
