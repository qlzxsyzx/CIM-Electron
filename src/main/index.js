import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'

function createLoginWindow() {
  const loginWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 500,
    // frame:false,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  loginWindow.on('ready-to-show', () => {
    loginWindow.show()
  })

  loginWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    loginWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/login')
  } else {
    loginWindow.loadFile(join(__dirname, '../renderer/index.html/login'))
  }

  // 窗口最小化
  ipcMain.on('window-min', () => {
    loginWindow.minimize()
  })

  // 窗口关闭
  ipcMain.on('window-close', () => {
    loginWindow.close()
  })
}

// function createWindow() {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 1000,
//     height: 500,
//     minWidth: 1000,
//     minHeight: 500,
//     // frame:false, //隐藏google标题栏
//     // titleBarStyle : 'hidden',
//     show: false,
//     autoHideMenuBar: true,
//     ...(process.platform === 'linux' ? { icon } : {}),
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false,
//     }
//   })

//   mainWindow.on('ready-to-show', () => {
//     mainWindow.show()
//     mainWindow.webContents.openDevTools ()
//   })

//   mainWindow.webContents.setWindowOpenHandler((details) => {
//     shell.openExternal(details.url)
//     return { action: 'deny' }
//   })

//   // HMR for renderer base on electron-vite cli.
//   // Load the remote URL for development or the local html file for production.
//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
//   } else {
//     mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
//   }

//   // 窗口最小化
//   ipcMain.on('main-min',() => {
//     mainWindow.minimize()
//   })

//   // 窗口关闭
//   ipcMain.on('main-close',() => {
//     mainWindow.close()
//   })

//   // 全屏
//   ipcMain.on('window-max',() => {
//     if(mainWindow.isMaximized()){ // 为true表示窗口已最大化
//       mainWindow.restore();// 将窗口恢复为之前的状态.
//     }else{
//       mainWindow.maximize();
//     }
//   })
// }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createLoginWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createLoginWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
// 打开主窗口
// ipcMain.on('login-success',() => {
//   createWindow()
// })

// 下载文件
ipcMain.handle('download', (e, res, fileName) => {
  return new Promise((resolve, reject) => {
    const downLoadPath = path.join(app.getPath('downloads'), fileName)
    fs.writeFileSync(downLoadPath, Buffer.from(res))
    resolve('success')
  })
})

// 合并文件
ipcMain.handle('mergeFile', (e, fileName, recordName, count) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(app.getPath('downloads'), fileName)
    // 合并文件
    const fileWriter = fs.createWriteStream(filePath)
    fileWriter.on('error', (err) => {
      reject(err)
    })
    for (let i = 0; i < count; i++) {
      const partPath = path.join(app.getPath('downloads'), recordName + '_' + i + '.part')
      const partData = fs.readFileSync(partPath)
      fileWriter.write(partData)
      fs.unlinkSync(partPath)
    }
    fileWriter.end()
    resolve('success')
  })
})
