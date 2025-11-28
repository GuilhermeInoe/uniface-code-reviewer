const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Uniface Code Reviewer está ativo!');

    const diagnosticCollection = vscode.languages.createDiagnosticCollection('uniface-lint');
    context.subscriptions.push(diagnosticCollection);

    const runLint = (document) => {
         if (document.languageId !== 'uniface') return;
        
        updateDiagnostics(document, diagnosticCollection);
    };

    if (vscode.window.activeTextEditor) {
        runLint(vscode.window.activeTextEditor.document);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                runLint(editor.document);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => runLint(e.document))
    );
}


function updateDiagnostics(document, collection) {
    const diagnostics = [];
    const text = document.getText();

    // REGRA 1: Proibir uso de "GOTO" 
    // O 'g' significa global (todos os encontrados) e 'i' case-insensitive (maísculo/minúsculo)
    const regexGoto = /\b(GOTO)\b/gi; 
    
    let match;
    while ((match = regexGoto.exec(text))) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        
        const diagnostic = new vscode.Diagnostic(
            new vscode.Range(startPos, endPos),
            `Code Review: O comando '${match[0]}' não é recomendado. Tente reestruturar a lógica.`,
            vscode.DiagnosticSeverity.Warning // Warning = Amarelo
        );
        
        diagnostic.source = 'Uniface Review';
        diagnostics.push(diagnostic);
    }

    // REGRA 2: Identificar comandos deprecados
    const regexDebug = /(?<!\$)\b(scan)\b/gi;
    while ((match = regexDebug.exec(text))) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);

        const diagnostic = new vscode.Diagnostic(
            new vscode.Range(startPos, endPos),
            `Atenção: Remova comandos deprecados (scan). Utilize $scan()`,
            vscode.DiagnosticSeverity.Error // Erro Vermelho
        );
        diagnostics.push(diagnostic);
    }

    collection.set(document.uri, diagnostics);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};