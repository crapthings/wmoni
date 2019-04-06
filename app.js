const ipc = require('electron').ipcRenderer
const d3 = require('d3')
const SVG64 = require('svg64')

const trySize = 16

const cpuSvg = d3.select(document.createElement('div'))
  .append('svg')
  .attr('width', trySize)
  .attr('height', trySize)
  .append('g')
  .attr("transform", `translate(${trySize / 2}, ${trySize / 2})`)

const memSvg = d3.select(document.createElement('div'))
  .append('svg')
  .attr('width', trySize)
  .attr('height', trySize)
  .append('g')
  .attr("transform", `translate(${trySize / 2}, ${trySize / 2})`)

const diskSvg = d3.select(document.createElement('div'))
  .append('svg')
  .attr('width', trySize)
  .attr('height', trySize)
  .append('g')
  .attr("transform", `translate(${trySize / 2}, ${trySize / 2})`)

const color1 = d3.scaleOrdinal(['#0d47a1', '#2196f3'])
const color2 = d3.scaleOrdinal(['#0d47a1', '#2196f3'].reverse())

const pie = d3.pie()
  .value(d => d.count)
  .sort(null)

const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(trySize / 2)

function arcTween(a) {
  const i = d3.interpolate(this._current, a)
  this._current = i(1)
  return (t) => arc(i(t))
}

function update(name, svg, data = [], color = color1) {
  const path = svg.selectAll('path')
    .data(pie(data))

  path.transition().duration(200).attrTween('d', arcTween)

  path.enter().append('path')
    .attr('fill', (d, i) => color(i))
    .attr('d', arc)
    .attr('stroke', 'white')
    .attr('stroke-width', 0)
    .attr('opacity', 1)

  const image = new Image()
  image.width = trySize
  image.height = trySize
  image.src = SVG64(svg.node().parentNode)

  image.onload = function (){
    const canvas = document.createElement('canvas')
    canvas.width = trySize
    canvas.height = trySize
    const ctx = canvas.getContext('2d')
    ctx.drawImage(this, 0, 0)
    ipc.send(name, canvas.toDataURL(), 10)
  }
}

update('cpu', cpuSvg, [], color2)
update('mem', memSvg, [])
update('disk', diskSvg, [])

setInterval(function () {
  ipc.send('ping', 'ping', 10)
}, 2000)


ipc.on('info', function (event, args) {
  console.log(args)
  update('cpu', cpuSvg, [{ count: args.cpu.currentload }, { count: args.cpu.currentload_idle - args.cpu.currentload }])
  update('mem', memSvg, [{ count: args.mem.active }, { count: args.mem.available }])
  update('disk', diskSvg, [{ count: args.disk.used }, { count: args.disk.size - args.disk.used }])
})
