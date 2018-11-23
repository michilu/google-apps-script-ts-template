// TypeScript Google Apps Script template

let debug = true;

class JSONPHelper {
    public static response(error, result, prefix) {
        const ret = [];
        if (prefix) {
            ret.push(prefix);
            ret.push("(");
        }

        ret.push(Utilities.jsonStringify(error ? { error } : { success: result }));

        if (prefix) {
            ret.push(")");
        }

        return ContentService.createTextOutput(ret.join("")).setMimeType(ContentService.MimeType.JSON);
    }
}

class MyClass {

    public static setup() {
        if (debug) {
            Logger.log("Setting up...");
        }

        // Uncomment this if your script needs to publish itself as a service.
        // Logger.log 'Enabling as a WebApp...' if debug
        // @enable()

        // Your other initializations here - for example setting triggers, etc.
    }

    constructor() { }

    public echo(text) {
        return text;
    }

    public uninstall(automatic) {
        const base = ScriptApp.getService().getUrl();
        if (!automatic && base) {
            // Only if no automatic uninstall (e.g. the user has to confirm) and the script is published as a WebApp
            const target = base.substring(0, base.lastIndexOf("/"));

            return HtmlService.createHtmlOutput(`Click here to <a href="${target}/manage/uninstall">uninstall</a>.`);
        } else {
            // Fallback, if this is not a published WebApp or automatic uninstall is wanted
            // remove all triggers, so there are no errors when we invalidate the authentification
            for (const trigger of Array.from(ScriptApp.getScriptTriggers())) {
                ScriptApp.deleteTrigger(trigger);
            }

            // invalidate authentication
            ScriptApp.invalidateAuth();
            return ContentService.createTextOutput("Application successfully uninstalled.");
        }
    }
}

// Uncomment this if your script needs to publish itself as a service.
// You don't need this if yourself published this script as a service from within the Google Apps Script edtior.
//
// @enable: ->
// 	svc = ScriptApp.getService()
// 	unless svc.isEnabled()
// 		svc.enable svc.Restriction.MYSELF
// 		Logger.log "The app is now available under '#{svc.getUrl()}'" if debug
// 	return
//
// @disable: ->
// 	ScriptApp.getService().disable()
// 	return

// WebApp-specific events:

let doGet = function(request) {
    MyClass.setup();

    const m = new MyClass();

    switch (request.parameter.action) {
        case "jsonp":
            return JSONPHelper.response(null, { hello: "World!" }, request.parameter.callback);
        case "uninstall":
            return m.uninstall(request.parameter.automatic === "true");
        case "count":
            let current = Number(UserProperties.getProperty("count")) || 0;
            UserProperties.setProperty("count", ++current);
            return ContentService.createTextOutput(current);
        case "dump":
            return JSONPHelper.response(null, { properties: UserProperties.getProperties() });
        default:
            const url = ScriptApp.getService().getUrl();
            const ret = HtmlService.createHtmlOutput();
            ret.append(m.echo("Works."));
            ret.append("<ul>");
            ret.append(`<li><a href='${url}?action=jsonp'>Check out JSON</a></li>`);
            ret.append(`<li><a href='${url}?action=jsonp&callback=alert'>Check out JSONP</a></li>`);
            ret.append(`<li><a href='${url}?action=bump'>Bump count</a></li>`);
            ret.append(`<li><a href='${url}?action=dump'>Get all user properties</a></li>`);
            ret.append(`<li><a href='${url}?action=uninstall&automatic=true'>Or uninstall the service</a></li>`);
            ret.append("</ul>");
            return ret;
    }
};

let doPost = (request) => ContentService.createTextOutput("POST worked!");

// Spreadsheet-specific events:

let onOpen = function() { };

let onEdit = function(event) { };

let onInstall = function() { };

// Event that can be run from the Script Editor
// This is just a helper until the Google Apps Script Code Editor can deal with 'bla = function() {}' definitions and/or static methods
function setup() {
    MyClass.setup.apply(MyClass, arguments);
}
