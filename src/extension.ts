import * as vscode from "vscode";
import * as path from "path";

const INIT_VALIDATION_DELAY = 250;

const decorationType = vscode.window.createTextEditorDecorationType({
  isWholeLine: true,
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  overviewRulerColor: "rgba(255, 32, 21)",
  overviewRulerLane: vscode.OverviewRulerLane.Left,
  light: {
    textDecoration: "underline rgba(255, 105, 97, 0.8) 1px wavy",
  },
  dark: {
    textDecoration: "underline rgba(255, 105, 97, 0.8) 1px wavy",
  },
});

function shouldValidateDocument(
  activeEditor: vscode.TextEditor,
  config: vscode.WorkspaceConfiguration
) {
  const regex = config.get("regex") as string;
  const fileName = path.basename(activeEditor.document.fileName);
  const fileNameConf = (config.get("fileNames") as string).trim();

  const extension = fileName.substring(fileName.lastIndexOf(".") + 1);
  const extensionConf = (config.get("fileExtensions") as string).trim();

  const fileNames: string[] =
    fileNameConf === ""
      ? []
      : fileNameConf.split(",").map((fileName) => fileName.trim());
  const fileExtensions: string[] =
    extensionConf === ""
      ? []
      : extensionConf.split(",").map((fileName) => fileName.trim());

  const isRegexSet = regex !== "";
  const isFileNameMatch = fileNames.includes(fileName);
  const isExtensionMatch = fileExtensions.includes(`.${extension}`);

  if (!isRegexSet) {
    return false;
  }

  if (fileNames.length > 0) {
    if (fileNameConf === "*" || isFileNameMatch) {
      return true;
    } else {
      return false;
    }
  }

  if (fileExtensions.length > 0) {
    if (extensionConf === "*" || isExtensionMatch) {
      return true;
    } else {
      return false;
    }
  }

  return false;
}

function validateLine(
  lineText: string,
  lineNumber: number,
  regExp: RegExp
): vscode.Diagnostic | null {
  if (!regExp.test(lineText)) {
    const range = new vscode.Range(lineNumber, 0, lineNumber, lineText.length);

    return new vscode.Diagnostic(
      range,
      "Line does not match the required pattern",
      vscode.DiagnosticSeverity.Error
    );
  }

  return null;
}

function validateDocument(
  editor: vscode.TextEditor,
  document: vscode.TextDocument
) {
  const config = vscode.workspace.getConfiguration("lineGuard");
  const regex = config.get("regex") as string;

  if (regex === "") {
    vscode.window.showErrorMessage(
      "No validation regex set. Please set 'lineGuard.regex' configuration option."
    );
    return;
  }

  if (editor) {
    if (shouldValidateDocument(editor, config)) {
      try {
        const regExp = new RegExp(regex);

        const { lineCount } = document;
        const diagnostics: vscode.Diagnostic[] = [];

        for (let lineNumber = 0; lineNumber < lineCount; lineNumber++) {
          const lineText = document.lineAt(lineNumber).text;
          const diagnostic = validateLine(lineText, lineNumber, regExp);

          if (diagnostic) {
            diagnostics.push(diagnostic);
          }
        }

        const decorations = diagnostics.map((diagnostic) => diagnostic.range);
        editor.setDecorations(decorationType, decorations);
      } catch (error) {
        vscode.window.showErrorMessage(
          "Failed to parse file. Check plugin settings."
        );
      }
    }
  }
}

function validateAllOpenDocuments() {
  const editors = vscode.window.visibleTextEditors;

  for (const editor of editors) {
    validateDocument(editor, editor.document);
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(({ document }) => {
      setTimeout(() => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          validateDocument(editor, document);
        }
      }, INIT_VALIDATION_DELAY);
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(
      (editor: vscode.TextEditor | undefined) => {
        setTimeout(() => {
          if (editor) {
            validateDocument(editor, editor.document);
          }
        }, INIT_VALIDATION_DELAY);
      }
    )
  );

  validateAllOpenDocuments();
}

export function deactivate() {}
