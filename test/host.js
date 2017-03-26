var Status = require("../src/lib/status.js").default;
var expect = require("chai").expect;
var sinon = require("sinon");
var helpers = require("./helpers");
require("../src/host/index.js");

var instance;
describe("DeviantArt SafeFrames Host", function(){
    describe("window.DeviantArtSafeFramesHost", function(){
        it("should be defined globally", function(){
            expect(window.DeviantArtSafeFramesHost).to.exist;
            instance = new window.DeviantArtSafeFramesHost();
        });
    });

    describe("window.$sf", function(){
        it("should be defined globally", function(){
            expect(window.$sf).to.exist;
        });
        it("should expose the host namespace", function(){
            expect(window.$sf.host).to.exist;
        });
        it("should expose the info namespace", function(){
            expect(window.$sf.info).to.exist;
        });
    });

    describe("window.$sf.host", function(){
        it("should expose the conf endpoint", function(){
            expect(window.$sf.host.conf).to.be.a("object");
        });
        it("should expose the nuke() method", function(){
            expect(window.$sf.host.nuke).to.be.a("function");
        });
        it("should expose the get() method", function(){
            expect(window.$sf.host.get).to.be.a("function");
        });
    });

    describe("window.$sf.host.conf", function(){
        it("should have the correct version", function(){
            expect(window.$sf.host.conf.ver).to.equal("1-1-0");
        });
        it("should have the correct specification version", function(){
            expect(window.$sf.host.conf.specVersion).to.equal("1.1");
        });
        it("should expose the needed properties", function(){
            const props = [
                "allowCookieReads",
                "allowCookieWrites",
                "auto",
                "debug",
                "hostFile",
                "onBeforePosMsg",
                "onEndPosRender",
                "onFailure",
                "onPosMsg",
                "onStartPosRender",
                "onSuccess",
                "renderFile",
                "specVersion",
                "ver",
            ];
            props.map((prop)=>{
                expect(window.$sf.host.conf[prop], prop).to.exist;
            });
        });
    });

    describe("window.$sf.info", function(){
        it("should expose $sf.info.errs array", function(){
            expect(window.$sf.info.errs).to.be.an('array');
        });
        it("should expose $sf.info.list array", function(){
            expect(window.$sf.info.list).to.be.an('array');
        });
    });

    describe("window.$sf.info.errs", function(){
        it("should trigger an error if a register message event has no source iframe", function(){
            instance.messages.trigger('register', {});
            expect(window.$sf.info.errs.length).to.equal(1);
        });
        it("should trigger an error if tried to get a safeframe with an invalid id", function() {
            window.$sf.host.get("some invalid id");
            expect(window.$sf.info.errs.length).to.equal(2);
        });
        it("should trigger an error if tried to nuke a safeframe with an invalid id", function() {
            window.$sf.host.nuke("some invalid id");
            expect(window.$sf.info.errs.length).to.equal(3);
        });
    });
});

describe("DeviantArt Safeframe Host Integration Tests", function(){

    const iframe = helpers.createIframe();
    let iframeMessageSpy;
    let windowMessageSpy;

    before(function(){
        iframeMessageSpy = sinon.spy(iframe.window, 'postMessage');
        windowMessageSpy = sinon.spy();
        window.addEventListener('message', windowMessageSpy);
    });

    after(function(){
        iframeMessageSpy.restore();
        window.removeEventListener('message', windowMessageSpy);
    });

    describe("$sf.ext.register()", function(){
        beforeEach(function(){
            iframeMessageSpy.reset();
            windowMessageSpy.reset();
        });
        it("should receive registered event upon registering", function(){
            iframe.send('register', {w:300, h:250});
            expect(windowMessageSpy.callCount).to.equal(1);
            expect(iframeMessageSpy.callCount).to.equal(1);
            const message = JSON.parse(iframeMessageSpy.getCall(0).args[0]);
            expect(message.type).to.equal('registered');
        });
        it("should now have one SafeFrame in $sf.info.list array", function(){
            expect(window.$sf.info.list.length).to.equal(1);
        });
    });

    describe("$sf.host", function(){
        describe("$sf.host.get()", function(){
            it("should return the safeframe object", function(){
                const safeframe = window.$sf.info.list[0];
                expect(window.$sf.host.get(safeframe.id)).to.eql(safeframe);
            });
        });
        describe("$sf.host.nuke()", function(){
            it("should destroy the safeframe object", function(){
                const safeframe = window.$sf.info.list[0];
                window.$sf.host.nuke(safeframe.id);
                expect(window.$sf.info.list.length).to.be.equal(0);
                expect(window.$sf.host.get(safeframe.id)).to.not.be.ok;
            });
        });
    });
});
