"use strict";
const vscode = require("vscode");
const request = require("request");
var roomList = [];
var configuration = vscode.workspace.getConfiguration('gitter');
var personalToken = configuration.get('personalToken');
var closeLine = '\n######[Sent from VSCode](https://marketplace.visualstudio.com/items?itemName=scrthq.vscode-gitter)';
var API_VERSION = '/v1';
var BASE_URL = 'https://api.gitter.im' + API_VERSION;
var API_ROOMS = '/rooms';
var API_MESSAGES = '/chatMessages';
class Gitter {
    GetRoomList(callback, data) {
        var params = '?access_token=' + personalToken;
        roomList.length = 0;
        var __request = function(urls, callback) {
            var results = {},
                t = urls.length,
                c = 0,
                handler = function(error, response, body) {
                    var url = response.request.uri.href;
                    results[url] = { error: error, response: response, body: body };
                    if (++c === urls.length) {
                        callback(results);
                    }
                };
            while (t--) {
                request(urls[t], handler);
            }
        };
        var urls = [BASE_URL + API_ROOMS + params];
        __request(urls, function(responses) {
            var url, response;
            for (url in responses) {
                // reference to the response object
                response = responses[url];
                // find errors
                if (response.error) {
                    console.log("Error", url, response.error);
                    return;
                }
                // render body
                if (response.body) {
                    let r = JSON.parse(response.body);
                    for (let i = 0; i < r.length; i++) {
                        if (r[i].oneToOne == false) {
                            roomList.push({ id: r[i].id, label: 'Room: ' + r[i].name, description: r[i].topic });
                        }
                    }
                    for (let i = 0; i < r.length; i++) {
                        if (r[i].oneToOne == true) {
                            roomList.push({ id: r[i].id, label: 'User: ' + r[i].name, description: r[i].user.username });
                        }
                    }
                }
            }
            callback && callback(data);
        });
    }
    ApiCall(roomId, data) {
        var that = this;
        if (!this._statusBarItem) {
            this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }
        var postUrl = BASE_URL + API_ROOMS + '/' + roomId + API_MESSAGES + '?access_token=' + personalToken;
        request.post({
            url: postUrl,
            form: data
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                that._statusBarItem.text = "$(comment) Message sent successfully!";
                that._statusBarItem.show();
                setTimeout(function() { that._statusBarItem.hide(); }, 5000);
            } else {}
        });
    }
    QuickPick() {
        return vscode.window.showQuickPick(roomList.sort(), { matchOnDescription: true, placeHolder: 'Select a room' });
    }
    Send(data) {
        var sendMsg = function(roomId, data) {
            if (data) {
                var g = new Gitter();
                g.ApiCall(roomId, data);
            } else {}
        };
        var gitter = new Gitter;
        var pick = gitter.QuickPick();
        pick.then(item => {
            if (item) {
                var roomId = item.id;
                sendMsg(roomId, data);
            }
        });
    }
    SendMessage() {
        var options = {
            prompt: "Please enter a message"
        };
        vscode.window.showInputBox(options).then(text => {
            if (text) {
                text = text + closeLine
                var data = {
                    text: text
                };
                this.GetRoomList(this.Send, data);
            }
        });
    };
    SendSelection() {
        var editor = vscode.window.activeTextEditor;
        var renderMarkdown = vscode.workspace.getConfiguration('gitter').get('renderMarkdown');
        var lang = editor.document.languageId;
        if (!editor) {
            return; // No open text editor
        }
        var selection = editor.selection;
        if (lang == "markdown" && renderMarkdown == "AsMarkdown") {
            var text = editor.document.getText(selection) + '\n######[Sent from VSCode](https://github.com/scrthq/vscode-gitter/)';
        } else {
            var text = '#####_' + lang + ' snippet_\n\n```' + lang + '\n' + editor.document.getText(selection) + '\n```' + closeLine;
        }
        var data = {
            text: text
        };
        this.GetRoomList(this.Send, data);
    }
    SendFile() {
        var editor = vscode.window.activeTextEditor;
        var renderMarkdown = vscode.workspace.getConfiguration('gitter').get('renderMarkdown');
        var lang = editor.document.languageId;
        if (!editor) {
            return; // No open text editor
        }
        var text = '';
        if (lang == "markdown" && renderMarkdown == "AsMarkdown") {
            text = editor.document.getText() + closeLine;
        } else {
            var fileName = editor.document.fileName.replace(/^.*[\\\/]/, '');
            text = '#####_' + fileName + ' [' + lang + ']_\n\n```' + lang + '\n' + editor.document.getText() + '\n```' + closeLine;
        }
        var data = {
            text: text
        };
        this.GetRoomList(this.Send, data);
    }
    dispose() {}
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    if (personalToken) {

        console.log('vscode-gitter is now active!');

        // create a new Gitter instance
        let gitter = new Gitter();

        // send typed message
        vscode.commands.registerCommand('gitter.gitterSendMsg', () => gitter.SendMessage());

        // send selected text as a message
        vscode.commands.registerCommand('gitter.gitterSendSelection', () => gitter.SendSelection());

        // send current file
        vscode.commands.registerCommand('gitter.gitterSendFile', () => gitter.SendFile());

        // Add to a list of disposables which are disposed when this extension is deactivated.
        context.subscriptions.push(gitter);
    } else {
        vscode.window.showErrorMessage('Please enter a token to use this extension. You can see your Personal Access Token here: https://developer.gitter.im/apps');
    }
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map