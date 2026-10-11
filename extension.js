
const vscode = require('vscode');
const path = require('path');
const { spawn } = require('child_process');

function obtenerMensaje(error) {
  switch (error.message) {
    case 'Expected identifier':
      return 'Error de sintaxis: falta el nombre de la variable.';

    case "Esperado '='":
      return "Error de sintaxis: falta el operador de asignación '='.";

    case 'Token cannot appear after previous tokens':
      return 'Error de sintaxis: hay un elemento que no puede aparecer en esta posición.';

    default:
      return 'Error de sintaxis: la instrucción no tiene una estructura válida.';
  }
}

function activate(context) {
  const diagnostics =
    vscode.languages.createDiagnosticCollection('brasic');

  const timers = new Map();
  const processes = new Map();

  const analyzer = path.join(
    context.extensionPath,
    'runtime',
    'analyzer.py'
  );

  function cancelAnalysis(uri) {
    const key = uri.toString();

    if (timers.has(key)) {
      clearTimeout(timers.get(key));
      timers.delete(key);
    }

    if (processes.has(key)) {
      processes.get(key).kill();
      processes.delete(key);
    }
  }

  function analyzeDocument(document) {
    if (document.languageId !== 'brasic') {
      return;
    }

    const uri = document.uri;
    const key = uri.toString();

    cancelAnalysis(uri);

    const version = document.version;
    const source = document.getText();

    console.log(
      'Brasic: analizando documento:',
      JSON.stringify({ version, source })
    );

    const timer = setTimeout(() => {
      timers.delete(key);

      const child = spawn('python3', [analyzer]);
      processes.set(key, child);

      let stdout = '';
      let stderr = '';

      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');

      child.stdout.on('data', data => {
        stdout += data;
      });

      child.stderr.on('data', data => {
        stderr += data;
      });

      child.on('error', error => {
        if (processes.get(key) === child) {
          processes.delete(key);
        }

        console.error(
          'Brasic: no se pudo iniciar el analizador:',
          error
        );
      });

      child.on('close', code => {
        if (processes.get(key) !== child) {
          return;
        }

        processes.delete(key);

        if (code !== 0) {
          console.error('Brasic:', stderr);
          return;
        }

        const currentDocument =
          vscode.workspace.textDocuments.find(
            item => item.uri.toString() === key
          );

        if (
          !currentDocument ||
          currentDocument.version !== version
        ) {
          return;
        }

        try {
          const result = JSON.parse(stdout);
          const error = result.error;

          console.log('Brasic: error recibido:', error);
          console.log(
            'Brasic: mensaje traducido:',
            error ? obtenerMensaje(error) : null
          );
          console.log('Brasic: versión analizada:', version);

          if (!error) {
            diagnostics.set(uri, []);
            return;
          }

          const start = new vscode.Position(
            error.start.line,
            error.start.character
          );

          const end = new vscode.Position(
            error.end.line,
            error.end.character
          );

          const diagnostic = new vscode.Diagnostic(
            new vscode.Range(start, end),
            obtenerMensaje(error),
            vscode.DiagnosticSeverity.Error
          );

          diagnostic.source = 'Brasic';

          console.log('Brasic: publicando diagnóstico:', {
            version,
            mensaje: diagnostic.message,
            lineaInicio: diagnostic.range.start.line,
            columnaInicio: diagnostic.range.start.character,
            lineaFin: diagnostic.range.end.line,
            columnaFin: diagnostic.range.end.character
          });

          diagnostics.set(uri, [diagnostic]);
        } catch (error) {
          console.error(
            'Brasic: respuesta del analizador inválida:',
            error
          );
        }
      });

      child.stdin.on('error', error => {
        console.error(
          'Brasic: error al enviar el código al analizador:',
          error
        );
      });

      child.stdin.end(
        JSON.stringify({
          filename: uri.fsPath,
          source
        })
      );
    }, 300);

    timers.set(key, timer);
  }

  const onOpen = vscode.workspace.onDidOpenTextDocument(
    analyzeDocument
  );

  const onChange = vscode.workspace.onDidChangeTextDocument(
    event => analyzeDocument(event.document)
  );

  const onSave = vscode.workspace.onDidSaveTextDocument(
    analyzeDocument
  );

  const onClose = vscode.workspace.onDidCloseTextDocument(
    document => {
      cancelAnalysis(document.uri);
      diagnostics.delete(document.uri);
    }
  );

  context.subscriptions.push(
    diagnostics,
    onOpen,
    onChange,
    onSave,
    onClose
  );

  for (const document of vscode.workspace.textDocuments) {
    analyzeDocument(document);
  }

  const command = vscode.commands.registerCommand(
    'brasic.runFile',
    () => {
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

      document.save().then(saved => {
        if (!saved) {
          vscode.window.showErrorMessage(
            'No se pudo guardar el archivo.'
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

        terminal.show();

        const runner = path.join(
          context.extensionPath,
          'runtime',
          'runner.py'
        );

        const file = document.uri.fsPath;

        terminal.sendText(
          `python3 "${runner}" "${file}"`,
          true
        );
      });
    }
  );

  context.subscriptions.push(command);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
