const vscode = require('vscode');
const rules = require('./regras');

let diagnosticCollection;

function activate(context) {
    console.log('Extensão Uniface Code Reviewer ativada!');

    diagnosticCollection = vscode.languages.createDiagnosticCollection('uniface');
    context.subscriptions.push(diagnosticCollection);
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(updateDiagnostics),
        vscode.workspace.onDidOpenTextDocument(updateDiagnostics)
    );

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('uniface', new UnifaceFixer(), {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        })
    );
}

function updateDiagnostics(document) {
    if (document.languageId !== 'uniface') return;

    const diagnostics = [];
    const text = document.getText();

    rules.forEach(rule => {
        let match;
        const regex = new RegExp(rule.regex); 
        
        while ((match = regex.exec(text)) !== null) {
            const isValid = rule.validator ? rule.validator(match, text, match.index) : true;

            if (isValid) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);

                const diagnostic = new vscode.Diagnostic(
                    range,
                    rule.message,
                    rule.severity
                );
                
                diagnostic.code = rule.id; 
                diagnostic.source = 'Uniface Linter';
                
                diagnostics.push(diagnostic);
            }
        }
    });

    diagnosticCollection.set(document.uri, diagnostics);
}

class UnifaceFixer {
    provideCodeActions(document, range, context, token) {
        return context.diagnostics
            .filter(diagnostic => diagnostic.code === 'deprecated-commands')
            .map(diagnostic => this.createFix(document, diagnostic));
    }

    createFix(document, diagnostic) {
        const lineObject = document.lineAt(diagnostic.range.start.line);
        const lineText = lineObject.text;
        const parserRegex = /\b(fieldsyntax|fieldvideo)\s+([^,]+),\s*(.*)/i;
        const match = lineText.match(parserRegex);

        if (!match) return null;

        const command = match[1];        
        const field = match[2].trim();   
        const value = match[3].trim();   

        const newCode = `$${command} (${field}) = ${value}`;

        const fix = new vscode.CodeAction(`Corrigir para: ${newCode}`, vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();

        const startPos = new vscode.Position(lineObject.lineNumber, match.index);
        const endPos = new vscode.Position(lineObject.lineNumber, match.index + match[0].length);
        const fullRange = new vscode.Range(startPos, endPos);

        fix.edit.replace(document.uri, fullRange, newCode);
        fix.isPreferred = true;

        return fix;
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};