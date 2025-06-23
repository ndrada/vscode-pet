const vscode = require('vscode');

function activate(context) {
  const kittyStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  kittyStatus.text = '🐱 Sleeping...';
  kittyStatus.tooltip = 'Click to feed kitty!';
  kittyStatus.command = 'purrgrammer.feedKitty';
  kittyStatus.show();

  context.subscriptions.push(kittyStatus);

  let feedKittyCommand = vscode.commands.registerCommand('purrgrammer.feedKitty', () => {
    kittyStatus.text = '🐱 Mmm... yum!';
    setTimeout(() => {
      kittyStatus.text = '🐱 Sleeping...';
    }, 4000);
  });

  context.subscriptions.push(feedKittyCommand);
}
exports.activate = activate;
