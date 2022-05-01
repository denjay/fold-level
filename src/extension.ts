// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

const myStatusBarlist: Array<vscode.StatusBarItem> = []; // 用于保存新增的状态栏项
const allLevelList = ["∞", "1", "2", "3", "4", "5", "6", "7"];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {
  allLevelList.forEach((level) => {
    const myCommandId = `fold-level.changeFoldLevel${level}`;
    subscriptions.push(
      vscode.commands.registerCommand(myCommandId, async () => {
        const editor = vscode.window.activeTextEditor as vscode.TextEditor;
        // 获取可视区域中间行
        const middleLine = Math.round(
          (editor.visibleRanges[0].start.line +
            editor.visibleRanges[editor.visibleRanges.length - 1].end.line) /
            2
        );
        // 将光标定位到文件的最后,避免对折叠结果有影响
        editor.selection = new vscode.Selection(
          new vscode.Position(editor.document.lineCount, 0),
          new vscode.Position(editor.document.lineCount, 0)
        );
        // 先展开所有,再按层级进行折叠
        await vscode.commands.executeCommand("editor.unfoldAll");
        if (level !== "∞") {
          await vscode.commands.executeCommand(`editor.foldLevel${level}`);
        }
        // 窗口滚动回中间行
        editor.revealRange(
          new vscode.Range(
            new vscode.Position(middleLine, 0),
            new vscode.Position(middleLine, 0)
          ),
          vscode.TextEditorRevealType.InCenter
        );
      })
    );
    // create a new status bar item that we can now manage
    const myStatusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    myStatusBarItem.command = myCommandId;
    myStatusBarItem.text = String(level);
    myStatusBarItem.tooltip =
      level !== "∞" ? `Fold Level ${level}` : "Unfold All";
    myStatusBarlist.push(myStatusBarItem);
    subscriptions.push(myStatusBarItem);
  });

  updateStatusBarItem();
  subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(() => {
      updateStatusBarItem();
    })
  );
}

function updateStatusBarItem() {
  let levelList = vscode.workspace.getConfiguration("foldLevel").get("level");
  if (Array.isArray(levelList) && levelList.length === 0) {
    levelList = allLevelList;
  }
  myStatusBarlist.forEach((item) => {
    if ((levelList as string[]).includes(item.text)) {
      item.show();
    } else {
      item.hide();
    }
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
