import fs from 'node:fs'
import vm from 'node:vm'

const html = fs.readFileSync(new URL('../public/match-engine.html', import.meta.url), 'utf8')
const src = html.match(/<script>([\s\S]*)<\/script>/)[1]
const ctx = { console, Math, Set, Date, performance }
vm.createContext(ctx)
vm.runInContext(src, ctx)
const E = ctx.__ENGINE
const picks = {}
const orig = ctx.decideOnBall
ctx.decideOnBall = (M, p, rt) => {
  const o = orig(M, p, rt)
  const k = (rt ? rt + ':' : '') + (o ? o.type + (o.kind ? '/' + o.kind : '') : 'null')
  picks[k] = (picks[k] || 0) + 1
  return o
}
const restarts = {}
const origR = ctx.setRestart
ctx.setRestart = (M, type, ...rest) => {
  restarts[type] = (restarts[type] || 0) + 1
  return origR(M, type, ...rest)
}
const [h, a] = [process.argv[2] || 'IRV', process.argv[3] || 'LUM']
const M = E.createMatch({ home: h, away: a, seed: 7, size: 7, headless: true })
const states = {}
let owned = 0
const zone = [0, 0, 0, 0, 0]
while (!M.over) {
  E.tick(M)
  states[M.state] = (states[M.state] || 0) + 1
  if (M.ball.owner) {
    owned++
    const T = M.teams[M.ball.owner.team]
    const ax = T.dir === 1 ? M.ball.x : 105 - M.ball.x
    zone[Math.min(4, Math.floor(ax / 21))]++
  }
}
console.log('carrier zone (own goal -> opp goal, 21m bands)', zone)
console.log('picks', picks)
console.log('restarts', restarts)
console.log('states', states, 'owned ticks', owned, 'of', M.tick)
console.log(JSON.stringify(E.summarize(M)))
console.log(M.log.slice(0, 40).join('\n'))
