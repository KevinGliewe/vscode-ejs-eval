'use strict';

import * as vscode from 'vscode';
import * as ejs from 'ejs';

export function activate(context: vscode.ExtensionContext) {
    //console.log('"ejs-eval" is now active!');

    function extractCode(): string {
        let editor = vscode.window.activeTextEditor;
        let text = editor.document.getText();
        return ejs.render(text, {
            document : editor.document
        });
    }


    async function openInUntitled(content: string, language?: string) {
        const document = await vscode.workspace.openTextDocument({
            language,
            content,
        });
        vscode.window.showTextDocument(document);
    }


    let disposable = vscode.commands.registerCommand('extension.ejseval', () => {
        //console.log('"extension.ejseval" triggered!');
        try {
            openInUntitled(extractCode());
        } catch (error) {
            vscode.window.showErrorMessage(error.message);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}