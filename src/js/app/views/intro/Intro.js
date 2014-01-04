define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./Intro.htm");
    require("domReady!");

    function Intro() {

        var that = this;

        this.getTemplate = function() {
            return template;
        };

        this.onInit = function(dom, args) {
            console.log("Cancelling intro")
            dom.cancel(this.getTemplate()).then(function() {
                
            });
        };
    }
    return Intro;
});