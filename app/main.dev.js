/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  globalShortcut,
  clipboard
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import AutoLaunch from 'auto-launch';
// import MenuBuilder from './menu';
import callSnom from './callSnom';
import Store from './Store';

const path = require('path');

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;
let appIcon = null;
let isQuiting = false;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

app.setAsDefaultProtocolClient('tel');

// This will check if the app is already running
// https://github.com/electron/electron/blob/master/docs/api/app.md#appmakesingleinstancecallback
/*
let deeplinkingUrl;
const shouldQuit = app.makeSingleInstance((argv, workingDirectory) => {
  // Protocol handler for windows
  // argv: An array of the second instance’s (command line / deep linked) arguments
  if (process.platform == 'win32') {
    // Keep only command line / deep linked arguments
    deeplinkingUrl = argv.slice(1);

    store.set('loading', true);
    callSnom(
      {
        ip: store.get('ip'),
        user: store.get('user'),
        password: store.get('password'),
        number: deeplinkingUrl
      },
      response => {
        store.set('error', response.error);
        store.set('loading', false);
        if (mainWindow) {
          mainWindow.show();
        }
      }
    );
  }
});

if (shouldQuit) {
  app.quit();
  //return
}
*/
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.{app}.
    const store = new Store();
    store.set('loading', true);
    store.set('testnumber', commandLine + workingDirectory);

    let number = "";
    let pos = commandLine.toLowerCase().indexOf('tel:');

    if(pos != -1)
    {
      number = commandLine.substr(pos+4);
    }

    callSnom(
      {
        ip: store.get('ip'),
        user: store.get('user'),
        password: store.get('password'),
        number: number
      },
      response => {
        store.set('error', response.error);
        store.set('loading', false);
        if (mainWindow && response.error != '') {
          mainWindow.show();
        }
      }
    );
  });

  /**
   * Add event listeners...
   */

  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('ready', async () => {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      await installExtensions();
    }

    mainWindow = new BrowserWindow({
      show: false,
      width: 400,
      height: 500
    });

    mainWindow.loadURL(`file://${__dirname}/app.html`);

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    mainWindow.webContents.on('did-finish-load', () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      /*
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
    */
      const store = new Store();
      if (store.get('ip') == '') {
        mainWindow.show();
        mainWindow.focus();
      } else {
        mainWindow.hide();
      }
    });

    // mainWindow.on('closed', () => {
    //   mainWindow = null;
    // });

    mainWindow.on('minimize', event => {
      event.preventDefault();
      mainWindow.hide();
    });

    mainWindow.on('close', event => {
      if (!isQuiting) {
        event.preventDefault();
        mainWindow.hide();
      }

      return false;
    });

    //const menuBuilder = new MenuBuilder(mainWindow);
    //menuBuilder.buildMenu();

    const iconPath = path.join(__dirname, 'phone16.png');
    const trayIcon = nativeImage.createFromPath(iconPath);
    //trayIcon = trayIcon.resize({ width: 16, height: 16 });
    appIcon = new Tray(trayIcon);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show',
        click: () => {
          mainWindow.show();
        }
      },
      {
        label: 'Quit',
        click: () => {
          isQuiting = true;
          app.quit();
        }
      }
    ]);

    // Make a change to the context menu
    contextMenu.items[1].checked = false;

    // Call this again for Linux because we modified the context menu
    appIcon.setContextMenu(contextMenu);

    mainWindow.tray = appIcon;

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();

    const ret = globalShortcut.register('CommandOrControl+D', () => {
      const store = new Store();
      callSnom(
        {
          ip: store.get('ip'),
          user: store.get('user'),
          password: store.get('password'),
          number: clipboard.readText()
        },
        response => {
          store.set('error', response.error);
          store.set('loading', false);
          if (mainWindow && response.error != '') {
            mainWindow.show();
          }
        }
      );
    });
  });
}

const autoLauncher = new AutoLaunch({
  name: 'TheDialer'
});

autoLauncher.enable();

autoLauncher
  .isEnabled()
  .then(isEnabled => {
    if (isEnabled) {
      return;
    }
    return autoLauncher.enable();
  })
  .catch(() => {
    // handle error
  });
