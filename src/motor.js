const vscode = require('vscode');
const rules = require('./regras');

/**
 * Analisa o documento e retorna uma lista de diagnósticos
 * @param {vscode.TextDocument} document 
 */
function getDiagnostics(document) {
    const diagnostics = [];
    const text = document.getText();

    // itera sobre cada regra definida no regras.js
    rules.forEach(rule => {
        let match;
        //reinicialização do regex para garantir que comece do zero
        const regex = new RegExp(rule.regex); 

        while ((match = regex.exec(text))) {
            const startPosIndex = match.index;
            
            // Verifica validação extra (ex: o caso do $scan)
            if (rule.validator) {
                const shouldReport = rule.validator(match, text, startPosIndex);
                if (!shouldReport) continue;
            }

            const startPos = document.positionAt(startPosIndex);
            const endPos = document.positionAt(startPosIndex + match[0].length);

            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(startPos, endPos),
                rule.message,
                rule.severity
            );

            diagnostic.source = 'Uniface Code Reviewer';
            diagnostics.push(diagnostic);
        }
    });

    return diagnostics;
}

module.exports = { getDiagnostics };