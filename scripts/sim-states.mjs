import fs from 'node:fs'; import vm from 'node:vm'
const html = fs.readFileSync('public/match-engine.html','utf8')
const src = html.match(/<script>([\s\S]*)<\/script>/)[1]
const ctx = { console, Math, Set, Date, performance }; vm.createContext(ctx); vm.runInContext(src, ctx)
const E = ctx.__ENGINE, cnt = {}; let ticks=0
for (const [h,a] of [['SAL','SAL'],['IRV','LUM']]) for (let s=0;s<4;s++){
  const M = E.createMatch({home:h,away:a,seed:100+s,size:7,offside:true,headless:true})
  while(!M.over){ E.tick(M); ticks++; const k=M.state+(M.ball.owner?'':'|loose'); cnt[k]=(cnt[k]||0)+1 }
}
console.log('ticks/match', ticks/8); for (const k in cnt) console.log(k, (cnt[k]/ticks*100).toFixed(1)+'%')
