const vscode = require('vscode');
const linter = require('./motor');

function activate(context) {
    console.log('Uniface Code Reviewer foi iniciado');

    const diagnosticCollection = vscode.languages.createDiagnosticCollection('uniface-engine');
    context.subscriptions.push(diagnosticCollection);

    //função que conecta o VS Code ao motor
    const handleDocument = (document) => {

        if (document?.languageId !== "uniface") {
            return;
        }

        const diagnostics = linter.getDiagnostics(document);
        diagnosticCollection.set(document.uri, diagnostics);
    };

    //registra os eventos
    if (vscode.window.activeTextEditor) {
        handleDocument(vscode.window.activeTextEditor.document);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) handleDocument(editor.document);
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => handleDocument(e.document))
    );
}

function deactivate() {}

module.exports = { activate, deactivate };