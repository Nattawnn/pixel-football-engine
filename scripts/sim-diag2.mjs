import fs from 'node:fs'
import vm from 'node:vm'

const html = fs.readFileSync(new URL('../public/match-engine.html', import.meta.url), 'utf8')
const src = html.match(/<script>([\s\S]*)<\/script>/)[1]
const ctx = { console, Math, Set, Date, performance }
vm.createContext(ctx)
vm.runInContext(src, ctx)
const E = ctx.__ENGINE
const origGoal = ctx.scoreGoal
ctx.scoreGoal = (M, team) => {
  const b = M.ball
  console.log('GOAL team', team, 'shot?', !!b.shot, 'lastTouch team', b.lastTouch?.team, 'line', b.lastTouch?.line, 'pass', M.pass?.kind)
  return origGoal(M, team)
}
let printed = 0
const orig = ctx.decideOnBall
ctx.decideOnBall = (M, p, rt) => {
  const o = orig(M, p, rt)
  const T = M.teams[p.team]
  const ax = T.dir === 1 ? p.x : 105 - p.x
  if (!rt && ax > 68 && printed < 12) {
    printed++
    const d = M.lastDecision
    console.log(`carrier ax ${ax.toFixed(0)} y ${p.y.toFixed(0)} -> ${o.type}/${o.kind || ''}`)
    for (const x of d.opts) console.log(`   ${x.type}/${x.kind || ''} p ${x.p.toFixed(2)} v ${x.value.toFixed(3)} L ${x.lossCost.toFixed(3)} b ${x.bonus.toFixed(3)} u ${x.u.toFixed(4)}`)
  }
  return o
}
const M = E.createMatch({ home: process.argv[2] || 'IRV', home2: 0, away: process.argv[3] || 'LUM', seed: 7, size: 7 })
M.headless = false
let lost = {}
while (!M.over) {
  E.tick(M)
  M.events.length = 0
}
