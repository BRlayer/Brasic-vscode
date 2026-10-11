const vscode = require('vscode');
const path = require('path');
const { spawn } = require('child_process');

async function detectarPython() {
  const opciones = [
    { comando: 'python3', argumentos: [] },
    { comando: 'python', argumentos: [] },
    { comando: 'py', argumentos: ['-3'] }
  ];

  for (const opcion of opciones) {
    const disponible = await new Promise(resolve => {
      const proceso = spawn(
        opcion.comando,
        [...opcion.argumentos, '--version'],
        { stdio: 'ignore' }
      );

      proceso.once('error', () => resolve(false));
      proceso.once('close', codigo => resolve(codigo === 0));
    });

    if (disponible) {
      return opcion;
    }
  }

  return null;
}

function activate(context) {
  const command = vscode.commands.registerCommand(
    'brasic.runFile',
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage(
          'No hay ningún archivo abierto.'
        );
        return;
      }

      const document = editor.document;

      if (document.languageId !== 'brasic') {
        vscode.window.showErrorMessage(
          'El archivo activo no es un archivo Brasic.'
        );
        return;
      }

      if (document.isUntitled) {
        vscode.window.showErrorMessage(
          'Guarda el archivo antes de ejecutarlo.'
        );
        return;
      }

      const saved = await document.save();

      if (!saved) {
        vscode.window.showErrorMessage(
          'No se pudo guardar el archivo.'
        );
        return;
      }

      const python = await detectarPython();

      if (!python) {
        vscode.window.showErrorMessage(
          'No se encontró Python 3. Instálalo y comprueba ' +
          'que funciona mediante python3, python o py -3.'
        );
        return;
      }

      const workspaceFolder =
        vscode.workspace.getWorkspaceFolder(document.uri);

      const cwd = workspaceFolder
        ? workspaceFolder.uri.fsPath
        : path.dirname(document.uri.fsPath);

      const terminal = vscode.window.createTerminal({
        name: 'Brasic',
        cwd
      });

      const runner = path.join(
        context.extensionPath,
        'runtime',
        'runner.py'
      );

      const file = document.uri.fsPath;

      terminal.show();

      const argumentos = [
        ...python.argumentos,
        `"${runner}"`,
        `"${file}"`
      ].join(' ');

      terminal.sendText(
        `${python.comando} ${argumentos}`,
        true
      );
    }
  );

  context.subscriptions.push(command);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};