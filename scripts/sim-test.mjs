import fs from 'node:fs'
import vm from 'node:vm'

const html = fs.readFileSync(new URL('../public/match-engine.html', import.meta.url), 'utf8')
const src = html.match(/<script>([\s\S]*)<\/script>/)[1]
const ctx = { console, Math, Set, Date, performance }
vm.createContext(ctx)
vm.runInContext(src, ctx)
const E = ctx.__ENGINE

const n = +(process.argv[2] || 40)
const size = +(process.argv[3] || 7)
const ids = E.PRESETS.map((p) => p.id)
const all = []
const t0 = Date.now()
for (let a = 0; a < ids.length; a++)
  for (let b = a; b < ids.length; b++) {
    const res = []
    for (let i = 0; i < n; i++) {
      const s = i % 2
      res.push(E.runHeadless(s ? ids[b] : ids[a], s ? ids[a] : ids[b], 500 + i, size, true))
    }
    all.push(...res)
    const A = E.aggregate(res)
    const recs = Object.entries(A.rec)
      .map(([id, r]) => `${id} ${r.w}-${r.d}-${r.l} poss ${Math.round((r.poss / r.n) * 100)}% ppda ${(r.ppda / r.n).toFixed(1)}`)
      .join(' | ')
    console.log(
      `${ids[a]} v ${ids[b]}: goals ${(A.goals / n).toFixed(2)} shots ${(A.shots / n / 2).toFixed(1)} sot ${(A.sot / n / 2).toFixed(1)} xg ${(A.xg / n / 2).toFixed(2)} pass% ${Math.round((A.passC / A.pass) * 100)} passes ${Math.round(A.pass / n / 2)} fouls ${(A.fouls / n / 2).toFixed(1)} corners ${(A.corners / n / 2).toFixed(1)} poss ${Math.round(A.possMin * 100)}-${Math.round(A.possMax * 100)} || ${recs}`,
    )
  }
const A = E.aggregate(all)
console.log(`ALL: goals ${(A.goals / A.n).toFixed(2)} shots ${(A.shots / A.n / 2).toFixed(1)} pass% ${Math.round((A.passC / A.pass) * 100)} time ${((Date.now() - t0) / all.length).toFixed(0)}ms/match`)
