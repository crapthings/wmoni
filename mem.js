const ipc = require('electron').ipcRenderer
const _ = require('lodash')
const d3 = require('d3')
const pretty = require('prettysize')

const { pie, color, trySize, trayUpdate } = require('./draw')

const app = d3.select('#app')

const svg = app
  .append('svg')
  .attr('width', 200)
  .attr('height', 200)
  .append('g')
  .attr("transform", `translate(${200 / 2}, ${200 / 2})`)

const infoPanel = app
  .append('div')
  .style('padding', '16px')


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
  svgUpdate([{ count: args.mem.active }, { count: args.mem.available }])

  trayUpdate('mem', traySvg, [{ count: args.mem.active }, { count: args.mem.available }])

  infoUpdate(args.mem)
})

function svgUpdate(data = []) {
  const path = svg.selectAll('path')
    .data(pie(data))

  path
    .transition()
    .duration(200)
    .attrTween('d', arcTween)

  path.enter().append('path')
    .attr('fill', (d, i) => color(i))
    .attr('d', arc)
    .attr('stroke', 'white')
    .attr('stroke-width', 0)
    .attr('opacity', 1)
}

const arc = d3.arc().innerRadius(0).outerRadius(80)

function arcTween(a) {
  const i = d3.interpolate(this._current, a)
  this._current = i(1)
  return (t) => arc(i(t))
}

function infoUpdate(info) {
  const data = _.map(info, (v, k) => ({ name: k, value: pretty(v) }))

  const text = infoPanel
    .selectAll('div')
    .data(data)

  text.exit().remove()

  text.text(({ name, value }) => `${name}: ${value}`)

  text
    .enter()
    .append('div')
    .text(({ name, value }) => `${name}: ${value}`)

}
