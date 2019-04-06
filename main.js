const { app, BrowserWindow, Tray, nativeImage, ipcMain } = require('electron')
const si = require('systeminformation')
const pretty = require('prettysize')

let cpuWindow, memWindow, diskWindow, cpuTray, memTray, diskTray

const singleInstanceLock = app.requestSingleInstanceLock()

if (!singleInstanceLock) {
  app.quit()
}

app.dock.hide()

app.on('ready', () => {
  createDiskWindow()
  createMemWindow()
  createCpuWindow()
  registerIPC()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (cpuWindow === null)
    createCpuWindow(cpuWindow, cpuTray)
  if (memWindow === null)
    createMemWindow(memWindow, memTray)
  if (diskWindow === null)
    createDiskWindow(diskWindow, diskTray)
})

function createCpuWindow() {
  cpuWindow = new BrowserWindow({
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

  cpuWindow.loadFile('cpu.html')

  cpuWindow.on('closed', function () {
    cpuWindow = null
  })

  cpuWindow.setResizable(false)

  cpuTray = new Tray(nativeImage.createFromDataURL(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=`))

  cpuTray.on('click', function (event) {
    toggleWindow(cpuWindow, cpuTray)
    memWindow.hide()
    diskWindow.hide()
  })
}

function createMemWindow() {
  memWindow = new BrowserWindow({
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

  memWindow.loadFile('mem.html')

  memWindow.on('closed', function () {
    memWindow = null
  })

  memWindow.setResizable(false)

  memTray = new Tray(nativeImage.createFromDataURL(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=`))

  memTray.on('click', function (event) {
    toggleWindow(memWindow, memTray)
    diskWindow.hide()
    cpuWindow.hide()
  })
}

function createDiskWindow() {
  diskWindow = new BrowserWindow({
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

  diskWindow.loadFile('disk.html')

  diskWindow.on('closed', function () {
    diskWindow = null
  })

  diskWindow.setResizable(false)

  diskTray = new Tray(nativeImage.createFromDataURL(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=`))

  diskTray.on('click', function (event) {
    toggleWindow(diskWindow, diskTray)
    memWindow.hide()
    cpuWindow.hide()
  })
}

function getWindowPosition(window, tray) {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()
  const x = Math.round(trayBounds.x + (trayBounds.width) - (windowBounds.width))
  const y = Math.round(trayBounds.y + trayBounds.height + 4)
  return { x, y }
}

function showWindow (window, tray) {
  const position = getWindowPosition(window, tray)
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

function toggleWindow(window, tray) {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow(window, tray)
  }
}

function setTrayImage(tray) {
  return function (event, dataURL) {
    tray.setImage(nativeImage.createFromDataURL(dataURL))
  }
}

function registerIPC() {
  ipcMain.on('cpu', setTrayImage(cpuTray))

  ipcMain.on('mem', setTrayImage(memTray))

  ipcMain.on('disk', setTrayImage(diskTray))

  ipcMain.on('ping', async function (event) {
    const cpu = await si.currentLoad()
    const mem = await si.mem()
    const disk = (await si.fsSize())[0]

    cpuTray.setTitle(cpu.currentload.toFixed(1).toString() + '%')
    memTray.setTitle(pretty(mem.available, true, true, "0"))
    diskTray.setTitle(pretty(disk.size - disk.used, true, true, "0"))

    event.sender.send('pong', { cpu, disk, mem })
  })
}
