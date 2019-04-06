const { app, BrowserWindow, Tray, nativeImage, ipcMain } = require('electron')

const si = require('systeminformation')

const pretty = require('prettysize')

let mainWindow, cpuTry, memTray, diskTray

app.dock.hide()

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 600 / 3,
    height: 600,
    show: false,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false,
    },
  })

  mainWindow.loadFile('index.html')

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.setResizable(false)

  diskTray = new Tray(nativeImage.createFromDataURL(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAH0lEQVQ4T2NkoBAwUqifYdQAhtEwYBgNA1A+Gvi8AAAmmAARf9qcXAAAAABJRU5ErkJggg==`))
  memTray = new Tray(nativeImage.createFromDataURL(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAH0lEQVQ4T2NkoBAwUqifYdQAhtEwYBgNA1A+Gvi8AAAmmAARf9qcXAAAAABJRU5ErkJggg==`))
  cpuTray = new Tray(nativeImage.createFromDataURL(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAH0lEQVQ4T2NkoBAwUqifYdQAhtEwYBgNA1A+Gvi8AAAmmAARf9qcXAAAAABJRU5ErkJggg==`))

  cpuTray.on('click', function (event) {
    toggleWindow(cpuTray)
  })

  memTray.on('click', function (event) {
    toggleWindow(memTray)
  })

  diskTray.on('click', function (event) {
    toggleWindow(diskTray)
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin')
    app.quit()
})

app.on('activate', function () {
  if (mainWindow === null)
    createWindow()
})

const toggleWindow = (tray) => {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    showWindow(tray)
  }
}

const showWindow = (tray) => {
  const position = getWindowPosition(tray)
  mainWindow.setPosition(position.x, position.y, false)
  mainWindow.show()
  mainWindow.focus()
}

const getWindowPosition = (tray) => {
  const windowBounds = mainWindow.getBounds()
  const trayBounds = tray.getBounds()
  const x = Math.round(trayBounds.x + (trayBounds.width) - (windowBounds.width))
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return { x, y }
}

ipcMain.on('cpu', function (event, args) {
  cpuTray.setImage(nativeImage.createFromDataURL(args))
})

ipcMain.on('mem', function (event, args) {
  memTray.setImage(nativeImage.createFromDataURL(args))
})

ipcMain.on('disk', function (event, args) {
  diskTray.setImage(nativeImage.createFromDataURL(args))
})

ipcMain.on('ping', async function (event) {
  const cpu = await si.currentLoad()
  const mem = await si.mem()
  const disk = (await si.fsSize())[0]
  event.sender.send('info', { cpu, disk, mem })
  cpuTray.setTitle(cpu.currentload.toFixed(1).toString() + '%')
  memTray.setTitle(pretty(mem.available, true, true, "0"))
  diskTray.setTitle(pretty(disk.size - disk.used, true, true, "0"))
})
