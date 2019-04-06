const ipc = require('electron').ipcRenderer
const d3 = require('d3')
const SVG64 = require('svg64')

const trySize = 16

const color = d3.scaleOrdinal(['#0d47a1', '#2196f3'])

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

function trayUpdate(name, svg, data = []) {
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

module.exports = {
  pie,
  color,
  trySize,
  trayUpdate,
}
