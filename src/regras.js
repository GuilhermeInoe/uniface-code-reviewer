const vscode = require('vscode');

const rules = [
    {
        id: 'no-goto',
        regex: /\b(GOTO)\b/gi,
        message: 'Atenção: O uso do GOTO não é recomendado!',
        severity: vscode.DiagnosticSeverity.Warning
    },
    {
        id: 'scan-check',
        regex: /\b(scan)\b/gi,
        message: 'Atenção: Remova comandos deprecados (scan). Utilize $scan()',
        severity: vscode.DiagnosticSeverity.Warning,
        
        // se retornar true, cria o erro. Se retornar false, ignora.
        validator: (match, text, startIndex) => {
            //verifica se o caractere anterior é um '$'
            if (startIndex > 0 && text.charAt(startIndex - 1) === '$') {
                return false; //função $scan()
            }
            return true; //scan puro
        }
    }
];

module.exports = rules;