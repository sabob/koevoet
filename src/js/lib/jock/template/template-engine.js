define(function(require) {
    var $ = require("jquery");
    //require("jquery.address");
    var utils = require("../utils/utils");
    var Handlebars = require("handlebars");
    var moment = require("moment");
    var numeral = require("numeral");

    function TemplateEngine() {

        var registered = false;

        var actionRegistryLength = 0;
        var actionRegistry = {};

        this.hasActions = function() {
            return actionRegistryLength > 0;
        };

        this.reset = function() {
            actionRegistry = {};
            actionRegistryLength = 0;
        };

        this.render = function(template, context, actions, options) {
            options = options || {};
            options.data = options.data || {};
            actions = actions || {};
            $.extend(options.data, actions);

            var html = template(context, options);
            return html;
        };

        this.bind = function(target) {
            if (!this.hasActions()) {
                return;
            }
            target = target || "body";
            //console.log("binding target:", target);

            // Select target with data-jock-attribute and all children with data-jock-attribute
            $("[data-jock-action]", target).addBack("[data-jock-action]").each(function(i, item) {
                var currentID = this.attributes["data-jock-action"].value;

                var actionArray = actionRegistry[currentID];
                delete actionRegistry[currentID];
                actionRegistryLength--;

                var $node = $(this);

                for (var i = 0; i < actionArray.length; i++) {
                    var currentAction = actionArray[i];

                    if (currentAction.action == null) {
                        continue;
                    }
                    bindAction(currentAction, $node);
                }

                // remove the action attribute
                $node.removeAttr("data-jock-action");
            });
        };

        function bindAction(action, $node) {
            $node.on(action.on, function(e) {
                if (action.on === "click") {
                    //e.preventDefault();
                }

                // Bind jQuery this to action
                action.action.call(this, e, action.objectRef, action.options);
            });

        }

        this.registerHelpers = function() {
            if (registered) {
                return;
            }
            registered = true;

            checkHelper('action');
            Handlebars.registerHelper('action', function(options) {
                if (options == null || options.hash == null) {
                    return;
                }

                var actionArray = [];
                var context = this;

                $.each(options.hash, function(key, value) {
                    if ($.isFunction(value)) {

                        var actionData = {
                            on: key,
                            action: value,
                            options: options,
                            objectRef: context
                        };
                        actionArray.push(actionData);
                    }
                });

                actionRegistry[actionRegistryLength] = actionArray;
                actionRegistryLength++;
                var id = actionRegistryLength - 1;

                return new Handlebars.SafeString("data-jock-action=\"" + id + "\"");
            });

            checkHelper('formatDate');
            Handlebars.registerHelper('formatDate', function(context, block) {

                var f = block.hash.format || "MMM Do, YYYY";
                var day = moment(context);
                return day.format(f);
            });

            checkHelper('formatNumber');
            Handlebars.registerHelper('formatNumber', function(context, block) {
                var f = block.hash.format || "#";
                var str = numeral(context).format(f);
                return str;

            });

            function checkHelper(name) {
                if (name in Handlebars.helpers) {
                    throw new Error('Helper, "' + name + '" is already registered as a Handlebars helper!');
                }
            }

        };
    }

    var engine = new TemplateEngine();
    engine.registerHelpers();

    return engine;
});