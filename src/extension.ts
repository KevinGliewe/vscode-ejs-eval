'use strict';

import * as vscode from 'vscode';
import * as ejs from 'ejs';

export function activate(context: vscode.ExtensionContext) {
    console.log('"ejs-eval" is now active!');


    let previewUri = vscode.Uri.parse('ejs-preview://ejs-eval/ejs-preview');

    class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

		public update(uri: vscode.Uri) {
			this._onDidChange.fire(uri);
		}

		get onDidChange(): vscode.Event<vscode.Uri> {
			return this._onDidChange.event;
		}

        public provideTextDocumentContent(uri: vscode.Uri): string {
            if(vscode.window.activeTextEditor === undefined)
                return "No Active Editor!";

            try {
                return this.magic(this.extractCode());
            }
            catch(err) {
                return '<p style="color:#FF0000">' + this.magic(err.message) +'</p>';
            }
		}

        private extractCode(): string {
			let editor = vscode.window.activeTextEditor;
			let text = editor.document.getText();
            return ejs.render(text, {
                document : editor.document
            });
        }

        private magic(input: string): string {
            input = input.replace(/&/g, '&amp;');
            input = input.replace(/</g, '&lt;');
            input = input.replace(/>/g, '&gt;');
            input = input.replace(/\n/g, '<br/>');
            return input;
        }
    }

    let provider = new TextDocumentContentProvider();
	let registration = vscode.workspace.registerTextDocumentContentProvider('ejs-preview', provider);

    let disposable = vscode.commands.registerCommand('extension.ejseval', () => {
		return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'EJS Output').then((success) => {
            provider.update(previewUri);
		}, (reason) => {
			vscode.window.showErrorMessage(reason);
		});
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}