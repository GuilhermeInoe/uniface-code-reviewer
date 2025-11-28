const vscode = require('vscode');

/**
 @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Congratulations, your extension "uniface-code-reviewer" is now active!');
	
	const disposable = vscode.commands.registerCommand('uniface-code-reviewer.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from Uniface Code Reviewer!');
	});

	context.subscriptions.push(disposable);
}


function deactivate() {}

module.exports = {
	activate,
	deactivate
}
