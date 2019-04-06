const ipc = require('electron').ipcRenderer
const d3 = require('d3')

const { trySize, trayUpdate } = require('./draw')

const traySvg = d3.select(document.createElement('div'))
  .append('svg')
  .attr('width', trySize)
  .attr('height', trySize)
  .append('g')
  .attr("transform", `translate(${trySize / 2}, ${trySize / 2})`)

trayUpdate('cpu', traySvg, [])

setInterval(function () {
  ipc.send('ping', 'ping', 10)
}, 2000)

ipc.on('pong', function (event, args) {
  console.log(args)
  trayUpdate('cpu', traySvg, [{ count: args.cpu.currentload }, { count: args.cpu.currentload_idle - args.cpu.currentload }])
})
