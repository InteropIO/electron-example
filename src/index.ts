import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { Glue42Electron, initialize, Glue42 } from "@glue42/electron";

let glue: Glue42Electron.API;
let gdMainWindow: Glue42.Windows.GDWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = (file = "index.html"): BrowserWindow => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../dist/preload.js')
    }
  });
  // and load the index.html of the app.
  mainWindow.loadFile(join(__dirname, `../src/${file}`));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  subscribeForIPCMessages();
  glue = await initialize({
    inject: "fdc3",
    preload: true,
    appDefinition: {
      title: "Glue42 Electron Main Application",
      name: "My Electron Main App",
      details: {
        mode: "tab",
        tabGroupId: "myTabGroup",
        allowChannels: true,
        channelId: "Red"
      }
    }
  });
  registerGlue42ChildApps();
  const mainWindow = createWindow();
  gdMainWindow = await glue.registerStartupWindow(mainWindow);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const registerGlue42ChildApps = () => {
  glue.registerAppFactory(
    {
      name: "child-app-electron",
      title: "Glue42 Electron Child Application"
    }, (appDefinition, context, glue42electron) => {
      return createWindow("child.html");
    })
};

const subscribeForIPCMessages = () => {
  ipcMain.on("open-child-window", (event, type) => {
    const bw = createWindow("child.html");
    if (type === "relative") {
      glue.registerChildWindow(bw, {
        name: "child-app-electron-2",
        title: "Glue42 Electron Child Application",
        details: { relativeTo: gdMainWindow.id }
      })
    } else if (type === "tab") {
      glue.registerChildWindow(bw, {
        name: "child-app-electron-2",
        title: "Glue42 Electron Child Application",
        details: {
          mode: "tab",
          tabGroupId: "myTabGroup",
        }
      })
    } else {
      glue.registerChildWindow(bw, {
        name: "child-app-electron-2",
        title: "Glue42 Electron Child Application",
        details: {
          mode: "tab",
          left: 100,
          top: 100,
          width: 400,
          height: 400
        }
      })
    }
  });
}