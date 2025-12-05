const vscode = require('vscode');

const rules = [
    {
        id: 'no-goto',
        regex: /\b(GOTO)\b/gi,
        message: 'Atenção: O uso do GOTO não é recomendado',
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
                return false;
            }
            return true;
        }
    },

    {
        id: 'check-status-after-call',
        regex: /\b(activate|call)\b/gi,
        
        message: 'Ao usar um comando call ou activate, adicione a tratativa de erros',
        severity: vscode.DiagnosticSeverity.Error,

        validator: (match, text, startIndex) => {
            // match[0] é a palavra encontrada (activate ou call)
            //aqui, analisamos o término da linha atual e da próxima
            //procura o próximo "\n" a partir de onde a palavra foi encontrada
            const endOfCurrentLineIndex = text.indexOf('\n', startIndex);
            
            if (endOfCurrentLineIndex === -1) return false; //fim do arquivo

            //procura o término da próxima linha
            let endOfNextLineIndex = text.indexOf('\n', endOfCurrentLineIndex + 1);
            
            //se não tiver mais enter, assume o fim do texto
            if (endOfNextLineIndex === -1) endOfNextLineIndex = text.length;

            // extrair o texto da próxima linha
            const nextLineRaw = text.substring(endOfCurrentLineIndex + 1, endOfNextLineIndex);
            const nextLine = nextLineRaw.trim(); // remoção de espaços e tabs
            
            const temIf      = nextLine.toLowerCase().startsWith('if');
            const temStatus  = nextLine.toLowerCase().includes('$status');
            const temInclude = nextLine.toLowerCase().includes('#include LIB_COAMO:PFAT_VLDACTIVATE');
            if ((temIf && temStatus)| temInclude) {
                return false;
            }
            return true;
        }
    }
];

module.exports = rules;