const ipc = require('electron').ipcRenderer
const d3 = require('d3')

const { pie, color, trySize, trayUpdate } = require('./draw')

const svg = d3.select(document.getElementById('app'))
  .append('svg')
  .attr('width', 200)
  .attr('height', 200)
  .append('g')
  .attr("transform", `translate(${200 / 2}, ${200 / 2})`)

//

const traySvg = d3.select(document.createElement('div'))
  .append('svg')
  .attr('width', trySize)
  .attr('height', trySize)
  .append('g')
  .attr("transform", `translate(${trySize / 2}, ${trySize / 2})`)

trayUpdate('mem', traySvg, [])

setInterval(function () {
  ipc.send('ping', 'ping', 10)
}, 2000)

ipc.on('pong', function (event, args) {
  console.log(args)
  svgUpdate([{ count: args.mem.active }, { count: args.mem.available }])

  trayUpdate('mem', traySvg, [{ count: args.mem.active }, { count: args.mem.available }])
})

function svgUpdate(data = []) {
  const path = svg.selectAll('path')
    .data(pie(data))

  path.transition().duration(200).attrTween('d', arcTween)

  path.enter().append('path')
    .attr('fill', (d, i) => color(i))
    .attr('d', arc)
    .attr('stroke', 'white')
    .attr('stroke-width', 0)
    .attr('opacity', 1)
}

const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(80)

function arcTween(a) {
  const i = d3.interpolate(this._current, a)
  this._current = i(1)
  return (t) => arc(i(t))
}
