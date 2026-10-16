import fs from 'node:fs'
import vm from 'node:vm'

const html = fs.readFileSync(new URL('../public/match-engine.html', import.meta.url), 'utf8')
const src = html.match(/<script>([\s\S]*)<\/script>/)[1]
const ctx = { console, Math, Set, Date, performance }
vm.createContext(ctx)
vm.runInContext(src, ctx)
const E = ctx.__ENGINE
const out = { shots: 0, goals: 0, goalsFromShot: 0, saves: 0 }
for (let seed = 1; seed <= 4; seed++) {
  const M = E.createMatch({ home: 'IRV', home2: 0, away: 'IRV', seed, size: 7 })
  M.dbg = []
  let cur = null, goals = 0, saves = 0
  while (!M.over) {
    const sh = M.ball.shot
    if (sh && (!cur || cur.id !== sh.id)) {
      const T = M.teams[1 - sh.team], gk = T.players.find(q => q.isGK)
      cur = { id: sh.id, team: sh.team, xg: sh.xg, onT: sh.onTarget, bx: M.ball.x, by: M.ball.y, gk: gk && { x: +gk.x.toFixed(1), y: +gk.y.toFixed(1), task: gk.task, mode: gk.mode } }
      out.shots++
    }
    E.tick(M)
    M.events.length = 0
    const g = M.teams[0].stats.goals + M.teams[1].stats.goals
    const s = M.teams[0].stats.saves + M.teams[1].stats.saves
    if (s > saves) { saves = s; out.saves++ }
    if (g > goals) {
      goals = g; out.goals++
      const recent = cur && (M.tick - 0) && M.ball.x !== undefined
      console.log('GOAL', JSON.stringify(cur), 'ball at', M.ball.x.toFixed(1), M.ball.y.toFixed(1), 'saveTry', JSON.stringify(M.dbg.filter(d => cur && d.id === cur.id)))
      cur = null
    }
  }
}
console.log(out)
