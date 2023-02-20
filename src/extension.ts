import * as vscode from "vscode";

const decorationType = vscode.window.createTextEditorDecorationType({
  isWholeLine: true,
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  overviewRulerColor: "rgba(255, 32, 21)",
  overviewRulerLane: vscode.OverviewRulerLane.Left,
  light: {
    backgroundColor: "rgba(255, 105, 97)",
    color: "white",
  },
  dark: {
    backgroundColor: "rgb(255, 105, 97)",
    color: "white",
  },
});

function validateLine(
  lineText: string,
  lineNumber: number,
  regex: RegExp
): vscode.Diagnostic | null {
  const r = new RegExp(regex);

  if (r.test(lineText)) {
    const range = new vscode.Range(lineNumber, 0, lineNumber, lineText.length);

    return new vscode.Diagnostic(
      range,
      "Line does not match the required pattern",
      vscode.DiagnosticSeverity.Error
    );
  }

  return null;
}

function validateDocument(document: vscode.TextDocument) {
  const config = vscode.workspace.getConfiguration("lineGuardian");
  const regex = config.get("regex") as string;
  const { lineCount } = document;

  const diagnostics: vscode.Diagnostic[] = [];

  for (let lineNumber = 0; lineNumber < lineCount; lineNumber++) {
    const lineText = document.lineAt(lineNumber).text;
    const diagnostic = validateLine(lineText, lineNumber, regex);

    if (diagnostic) {
      diagnostics.push(diagnostic);
    }
  }

  const decorations = diagnostics.map((diagnostic) => diagnostic.range);

  vscode.window.activeTextEditor?.setDecorations(decorationType, decorations);
}

function validateAllOpenDocuments() {
  for (const document of vscode.workspace.textDocuments) {
    validateDocument(document);
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("activated");

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(({ document }) => {
      if (vscode.window.activeTextEditor?.document === document) {
        validateDocument(document);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      validateDocument(document);
    })
  );

  validateAllOpenDocuments();
}

export function deactivate() {}
