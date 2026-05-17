'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  supabase, MATCHES, GROUPS, GROUP_TEAMS, GROUP_COLORS,
  KNOCKOUT_ROUNDS, KNOCKOUT_MATCHES,
  calcGroupMatchPoints, calcKnockoutMatchPoints,
  calcClassifiedPoints, calcChampionPoints, calcLeaderboard
} from '@/lib/data'
import s from './page.module.css'

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '2026'

// ─── ALL DB DATA via one load call ───────────────────────────────────────────
function useDB() {
  const [db, setDb] = useState({
    participants:[], groupResults:[], groupPreds:[], classifiedRes:[],
    classifiedPreds:[], openMatches:[], knockoutResults:[], knockoutPreds:[],
    championResult:null, championPreds:[], loading:true
  })

  const load = useCallback(async () => {
    const [
      {data:parts}, {data:gr}, {data:gp}, {data:cr}, {data:cp},
      {data:om},   {data:kr}, {data:kp}, {data:chR},{data:chP}
    ] = await Promise.all([
      supabase.from('participants').select('*').order('created_at'),
      supabase.from('match_results').select('*'),
      supabase.from('predictions').select('*'),
      supabase.from('classified_results').select('*'),
      supabase.from('classified_predictions').select('*'),
      supabase.from('open_matches').select('match_id'),
      supabase.from('knockout_results').select('*'),
      supabase.from('knockout_predictions').select('*'),
      supabase.from('champion_result').select('*').order('updated_at', {ascending:false}).limit(1),
      supabase.from('champion_predictions').select('*'),
    ])
    setDb({
      participants: parts||[], groupResults: gr||[], groupPreds: gp||[],
      classifiedRes: cr||[], classifiedPreds: cp||[],
      openMatches: (om||[]).map(r=>r.match_id),
      knockoutResults: kr||[], knockoutPreds: kp||[],
      championResult: (chR||[])[0]||null, championPreds: chP||[],
      loading: false
    })
  }, [])

  useEffect(() => { load() }, [load])

  // Realtime subscriptions
  useEffect(() => {
    const tables = ['participants','match_results','predictions','classified_results',
      'classified_predictions','open_matches','knockout_results','knockout_predictions',
      'champion_result','champion_predictions']
    const channels = tables.map(t =>
      supabase.channel(`rt-${t}`).on('postgres_changes',
        {event:'*', schema:'public', table:t}, load).subscribe()
    )
    return () => channels.forEach(c => supabase.removeChannel(c))
  }, [load])

  return { db, load }
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function Page() {
  const { db, load } = useDB()
  const [tab, setTab]         = useState('tabla')
  const [participant, setParticipant] = useState(null)
  const [adminMode, setAdminMode]     = useState(false)
  const [showPin, setShowPin]         = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('polla_participant')
    if (saved) setParticipant(JSON.parse(saved))
    if (localStorage.getItem('polla_admin') === 'true') setAdminMode(true)
  }, [])

  const leaderboard = calcLeaderboard(
    db.participants, db.groupResults, db.groupPreds, db.classifiedRes,
    db.classifiedPreds, db.knockoutResults, db.knockoutPreds,
    db.championResult, db.championPreds
  )

  const TABS = [
    { id:'tabla',     label:'🏆 Tabla' },
    { id:'grupos',    label:'⚽ Fase de Grupos' },
    { id:'playoff',   label:'🔥 Playoffs' },
    ...(participant ? [{ id:'mis-grupos', label:'📋 Mis Grupos' }, { id:'mis-playoffs', label:'🎯 Mis Playoffs' }] : []),
    ...(adminMode   ? [{ id:'admin',      label:'⚙️ Admin' }] : []),
  ]

  return (
    <div className={s.app}>
      <div className={s.bgGlow}/>

      <header className={s.header}>
        <div className={s.headerInner}>
          <div className={s.brand}>
            <span className={s.brandIcon}>⚽</span>
            <div>
              <div className={s.brandTitle}>POLLA MUNDIALISTA 2026</div>
              <div className={s.brandSub}>FIFA World Cup · USA · Canada · Mexico</div>
            </div>
          </div>
          <div className={s.headerActions}>
            {participant ? (
              <div className={s.meChip}>
                <div className={s.meAvatar}>{participant.name[0].toUpperCase()}</div>
                <span className={s.meName}>{participant.name}</span>
                <button className={s.logoutBtn} onClick={() => {
                  setParticipant(null); localStorage.removeItem('polla_participant')
                  if (['mis-grupos','mis-playoffs'].includes(tab)) setTab('tabla')
                }}>✕</button>
              </div>
            ) : (
              <button className={s.joinBtn} onClick={() => setShowRegister(true)}>+ Unirse</button>
            )}
            <button className={`${s.adminBtn} ${adminMode ? s.adminBtnOn : ''}`}
              onClick={() => adminMode
                ? (() => { setAdminMode(false); localStorage.removeItem('polla_admin') })()
                : setShowPin(true)}>
              {adminMode ? '🔓' : '🔒'}
            </button>
          </div>
        </div>
        <nav className={s.nav}>
          {TABS.map(t => (
            <button key={t.id} className={`${s.navBtn} ${tab===t.id ? s.navActive : ''}`}
              onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
      </header>

      <main className={s.main}>
        {db.loading ? (
          <div className={s.loader}><div className={s.spinner}/><span>Cargando...</span></div>
        ) : (
          <>
            {tab==='tabla'       && <TablaTab leaderboard={leaderboard} participant={participant}/>}
            {tab==='grupos'      && <GruposTab db={db} adminMode={adminMode} onRefresh={load}/>}
            {tab==='playoff'     && <PlayoffTab db={db} adminMode={adminMode} onRefresh={load} participant={participant}/>}
            {tab==='mis-grupos'  && participant && <MisGruposTab db={db} participant={participant} onRefresh={load}/>}
            {tab==='mis-playoffs'&& participant && <MisPlayoffsTab db={db} participant={participant} onRefresh={load}/>}
            {tab==='admin'       && adminMode && <AdminTab db={db} leaderboard={leaderboard} onRefresh={load}/>}
          </>
        )}
      </main>

      {showRegister && (
        <RegisterModal
          participants={db.participants} onRefresh={load} onClose={() => setShowRegister(false)}
          onJoin={p => { setParticipant(p); localStorage.setItem('polla_participant', JSON.stringify(p)); setShowRegister(false); setTab('mis-grupos') }}
        />
      )}
      {showPin && (
        <PinModal onClose={() => setShowPin(false)}
          onSuccess={() => { setAdminMode(true); localStorage.setItem('polla_admin','true'); setShowPin(false); setTab('admin') }}
        />
      )}
    </div>
  )
}

// ─── TABLA TAB ────────────────────────────────────────────────────────────────
function TablaTab({ leaderboard, participant }) {
  const medals = ['🥇','🥈','🥉']
  return (
    <div className={s.tabContent}>
      <h2 className={s.sectionTitle}>🏆 Tabla de Posiciones</h2>
      <div className={s.legend}>
        <span className={s.lc} style={{background:'#1a3a2a',color:'#1DB954',border:'1px solid #1DB954'}}>Fase Grupos: 3pts exacto · 2pts resultado · 3pts clasificado</span>
        <span className={s.lc} style={{background:'#1a2a3a',color:'#4A9EFF',border:'1px solid #2E6BE6'}}>Playoffs: 5pts exacto · 3pts resultado</span>
        <span className={s.lc} style={{background:'#3a2a0a',color:'#F0B429',border:'1px solid #F0B429'}}>Bonus: 🥇20 · 🥈10 · 🥉5 pts</span>
      </div>
      {leaderboard.length === 0 ? (
        <div className={s.empty}><div style={{fontSize:48,marginBottom:12}}>⚽</div>¡Únete con el botón <strong>+ Unirse</strong> para participar!</div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr>
              <th>POS</th><th>PARTICIPANTE</th>
              <th title="Puntos fase grupos">GRP</th>
              <th title="Puntos clasificados">CLASIF</th>
              <th title="Puntos playoff">PLAY</th>
              <th title="Bonus campeón">BONUS</th>
              <th>TOTAL</th>
            </tr></thead>
            <tbody>
              {leaderboard.map((p,i) => (
                <tr key={p.id} className={`${i===0?s.rowGold:i===1?s.rowSilver:i===2?s.rowBronze:''} ${participant?.id===p.id?s.rowMe:''}`}>
                  <td className={s.tdPos}>{medals[i]||i+1}</td>
                  <td className={s.tdName}>{p.name}{participant?.id===p.id&&<span className={s.youTag}>tú</span>}</td>
                  <td className={s.tdCenter}><span className={s.miniPts} style={{color:'#1DB954'}}>{p.groupMatchPts}</span></td>
                  <td className={s.tdCenter}><span className={s.miniPts} style={{color:'#A78BFA'}}>{p.classifPts}</span></td>
                  <td className={s.tdCenter}><span className={s.miniPts} style={{color:'#4A9EFF'}}>{p.knockoutPts}</span></td>
                  <td className={s.tdCenter}><span className={s.miniPts} style={{color:'#F0B429'}}>{p.champBonus}</span></td>
                  <td className={s.tdTotal}><span className={s.totalBadge}>{p.total}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={s.scoringCard}>
        <div className={s.scoringTitle}>📋 Sistema de Puntuación</div>
        <div className={s.scoringGrid}>
          <div className={s.scoringBlock}>
            <div className={s.scoringPhase}>FASE DE GRUPOS</div>
            <div className={s.scoringRow}><span>Marcador exacto</span><span className={s.scoringPts} style={{color:'#1DB954'}}>3 pts</span></div>
            <div className={s.scoringRow}><span>Resultado correcto</span><span className={s.scoringPts} style={{color:'#4A9EFF'}}>2 pts</span></div>
            <div className={s.scoringRow}><span>Clasificado de grupo</span><span className={s.scoringPts} style={{color:'#A78BFA'}}>3 pts c/u</span></div>
          </div>
          <div className={s.scoringBlock}>
            <div className={s.scoringPhase}>FASE ELIMINATORIA</div>
            <div className={s.scoringRow}><span>Marcador exacto</span><span className={s.scoringPts} style={{color:'#1DB954'}}>5 pts</span></div>
            <div className={s.scoringRow}><span>Resultado correcto</span><span className={s.scoringPts} style={{color:'#4A9EFF'}}>3 pts</span></div>
          </div>
          <div className={s.scoringBlock}>
            <div className={s.scoringPhase}>BONUS CAMPEÓN</div>
            <div className={s.scoringRow}><span>🥇 Campeón</span><span className={s.scoringPts} style={{color:'#F0B429'}}>20 pts</span></div>
            <div className={s.scoringRow}><span>🥈 Subcampeón</span><span className={s.scoringPts} style={{color:'#C0C0C0'}}>10 pts</span></div>
            <div className={s.scoringRow}><span>🥉 Tercer lugar</span><span className={s.scoringPts} style={{color:'#CD7F32'}}>5 pts</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── GRUPOS TAB (public view of group matches + results) ─────────────────────
function GruposTab({ db, adminMode, onRefresh }) {
  const [filter, setFilter] = useState('ALL')
  const [editRes, setEditRes] = useState({})
  const [saving, setSaving] = useState(false)

  const getResult = id => db.groupResults.find(r => r.match_id === id)
  const filtered  = filter==='ALL' ? MATCHES : MATCHES.filter(m => m.group===filter)

  const saveResult = async (matchId) => {
    const ed = editRes[matchId]; if (!ed) return
    setSaving(matchId)
    const existing = getResult(matchId)
    if (ed.home === null && ed.away === null) {
      if (existing) await supabase.from('match_results').delete().eq('match_id', matchId)
    } else if (existing) {
      await supabase.from('match_results').update({
        home_score: ed.home ?? existing.home_score,
        away_score: ed.away ?? existing.away_score,
      }).eq('match_id', matchId)
    } else {
      await supabase.from('match_results').insert({
        match_id: matchId, home_score: ed.home ?? 0, away_score: ed.away ?? 0,
      })
    }
    setEditRes(p => { const n={...p}; delete n[matchId]; return n })
    await onRefresh(); setSaving(false)
  }

  return (
    <div className={s.tabContent}>
      <h2 className={s.sectionTitle}>⚽ Fase de Grupos — Partidos</h2>
      {adminMode && <div className={s.adminBanner}>⚙️ Admin — Ingresa los resultados reales de cada partido</div>}
      <div className={s.filterRow}>
        {['ALL',...GROUPS].map(g => (
          <button key={g} onClick={() => setFilter(g)} className={s.filterBtn}
            style={{background:filter===g?(g==='ALL'?'#E8324A':GROUP_COLORS[g]):'rgba(255,255,255,0.06)',
              color:filter===g?'#fff':'#6B7A99', borderColor:filter===g?'transparent':'rgba(255,255,255,0.1)'}}>
            {g==='ALL'?'Todos':`Grp ${g}`}
          </button>
        ))}
      </div>
      <div className={`${s.matchList} stagger`}>
        {filtered.map(m => {
          const res = getResult(m.id)
          const ed  = editRes[m.id]||{}
          const hS  = ed.home!==undefined ? ed.home : res?.home_score
          const aS  = ed.away!==undefined ? ed.away : res?.away_score
          const played = res !== undefined
          const win = played&&hS!==null&&aS!==null ? hS>aS?'home':hS<aS?'away':'draw' : null
          const gc = GROUP_COLORS[m.group]
          return (
            <div key={m.id} className={s.matchCard} style={{borderLeftColor:gc}}>
              <div className={s.matchMeta}>
                <span className={s.groupTag} style={{background:gc}}>GRP {m.group}</span>
                <span className={s.matchDate}>{m.date}</span>
                <span className={s.matchVenue}>📍 {m.venue}</span>
                <span className={s.matchStatus} style={{background:played?'rgba(29,185,84,.12)':'rgba(107,122,153,.1)',color:played?'#1DB954':'#6B7A99'}}>
                  {played?'✓ Jugado':db.openMatches.includes(m.id)?'🟡 Abierto':'🔒 Cerrado'}
                </span>
              </div>
              <div className={s.matchRow}>
                <div className={s.teamSide} style={{textAlign:'right',fontWeight:win==='home'?800:500,color:win==='home'?'#1DB954':win==='draw'?'#F0B429':'var(--text)'}}>{m.home}</div>
                {adminMode ? (
                  <div className={s.scoreEditor}>
                    <input type="number" min="0" max="99" placeholder="—" value={hS??''} onChange={e=>{const v=e.target.value===''?null:+e.target.value; setEditRes(p=>({...p,[m.id]:{...(p[m.id]||{}),home:v}}))}} className={s.scoreInput}/>
                    <span className={s.scoreSep}>:</span>
                    <input type="number" min="0" max="99" placeholder="—" value={aS??''} onChange={e=>{const v=e.target.value===''?null:+e.target.value; setEditRes(p=>({...p,[m.id]:{...(p[m.id]||{}),away:v}}))}} className={s.scoreInput}/>
                    {editRes[m.id] && <button className={s.saveBtn} onClick={() => saveResult(m.id)} disabled={saving===m.id}>{saving===m.id?'...':'✓'}</button>}
                  </div>
                ) : (
                  <div className={s.scoreDisplay}>
                    <span className={s.scoreNum}>{hS!==null&&hS!==undefined?hS:'—'}</span>
                    <span className={s.scoreSep}>:</span>
                    <span className={s.scoreNum}>{aS!==null&&aS!==undefined?aS:'—'}</span>
                  </div>
                )}
                <div className={s.teamSide} style={{textAlign:'left',fontWeight:win==='away'?800:500,color:win==='away'?'#1DB954':win==='draw'?'#F0B429':'var(--text)'}}>{m.away}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── PLAYOFF TAB (public bracket view + admin result entry) ──────────────────
function PlayoffTab({ db, adminMode, onRefresh, participant }) {
  const [editRes, setEditRes] = useState({})
  const [saving, setSaving]   = useState(null)
  const [activeRound, setActiveRound] = useState('r32')

  const getKOResult = id => db.knockoutResults.find(r => r.match_id === id)

  const saveKOResult = async (matchId) => {
    const ed = editRes[matchId]; if (!ed) return
    setSaving(matchId)
    const existing = getKOResult(matchId)
    if (existing) {
      await supabase.from('knockout_results').update({
        home_team: ed.homeTeam??existing.home_team, away_team: ed.awayTeam??existing.away_team,
        home_score: ed.home!==undefined?ed.home:existing.home_score,
        away_score: ed.away!==undefined?ed.away:existing.away_score,
      }).eq('match_id', matchId)
    } else {
      await supabase.from('knockout_results').insert({
        match_id: matchId, home_team: ed.homeTeam||'', away_team: ed.awayTeam||'',
        home_score: ed.home??null, away_score: ed.away??null,
      })
    }
    setEditRes(p => { const n={...p}; delete n[matchId]; return n })
    await onRefresh(); setSaving(null)
  }

  // Save champion result
  const [champEdit, setChampEdit] = useState({})
  const [savingChamp, setSavingChamp] = useState(false)
  const saveChampResult = async () => {
    setSavingChamp(true)
    const existing = db.championResult
    if (existing) await supabase.from('champion_result').update(champEdit).eq('id', existing.id)
    else await supabase.from('champion_result').insert(champEdit)
    setChampEdit({})
    await onRefresh(); setSavingChamp(false)
  }

  const roundMatches = KNOCKOUT_MATCHES.filter(m => m.round === activeRound)
  const champRes = db.championResult || {}

  return (
    <div className={s.tabContent}>
      <h2 className={s.sectionTitle}>🔥 Fase Eliminatoria</h2>
      {adminMode && <div className={s.adminBanner}>⚙️ Admin — Ingresa equipos y resultados de cada partido. Los equipos se conocen cuando avanzan en el bracket.</div>}

      {/* Round tabs */}
      <div className={s.filterRow}>
        {KNOCKOUT_ROUNDS.map(r => (
          <button key={r.id} onClick={() => setActiveRound(r.id)} className={s.filterBtn}
            style={{background:activeRound===r.id?'#E8324A':'rgba(255,255,255,0.06)',
              color:activeRound===r.id?'#fff':'#6B7A99',borderColor:activeRound===r.id?'transparent':'rgba(255,255,255,0.1)'}}>
            {r.label}
          </button>
        ))}
      </div>

      <div className={`${s.matchList} stagger`}>
        {roundMatches.map(m => {
          const res   = getKOResult(m.id)
          const ed    = editRes[m.id]||{}
          const hTeam = ed.homeTeam!==undefined ? ed.homeTeam : res?.home_team || ''
          const aTeam = ed.awayTeam!==undefined ? ed.awayTeam : res?.away_team || ''
          const hS    = ed.home!==undefined ? ed.home : res?.home_score
          const aS    = ed.away!==undefined ? ed.away : res?.away_score
          const played = res && res.home_score !== null && res.away_score !== null
          const win   = played ? hS>aS?'home':hS<aS?'away':'draw' : null

          const roundColor = {r32:'#6A1B9A',r16:'#0277BD',qf:'#00695C',sf:'#C62828',f:'#F57F17',tp:'#4E342E'}[m.round]||'#555'

          return (
            <div key={m.id} className={s.matchCard} style={{borderLeftColor:roundColor}}>
              <div className={s.matchMeta}>
                <span className={s.groupTag} style={{background:roundColor}}>
                  {KNOCKOUT_ROUNDS.find(r=>r.id===m.round)?.label||m.round}
                </span>
                <span className={s.matchDate}>{m.date}</span>
                <span className={s.matchVenue}>📍 {m.venue}</span>
                <span className={s.matchStatus} style={{background:played?'rgba(29,185,84,.12)':'rgba(107,122,153,.1)',color:played?'#1DB954':'#6B7A99'}}>
                  {played?'✓ Jugado':'Pendiente'}
                </span>
              </div>
              {adminMode ? (
                <div className={s.koAdminBlock}>
                  <div className={s.koTeamInputs}>
                    <input placeholder={`${m.label.split(' vs ')[0]} (equipo local)`} value={hTeam}
                      onChange={e => setEditRes(p=>({...p,[m.id]:{...(p[m.id]||{}),homeTeam:e.target.value}}))}
                      className={s.teamInput}/>
                    <div className={s.scoreEditor}>
                      <input type="number" min="0" max="99" placeholder="—" value={hS??''}
                        onChange={e=>{const v=e.target.value===''?null:+e.target.value; setEditRes(p=>({...p,[m.id]:{...(p[m.id]||{}),home:v}}))}} className={s.scoreInput}/>
                      <span className={s.scoreSep}>:</span>
                      <input type="number" min="0" max="99" placeholder="—" value={aS??''}
                        onChange={e=>{const v=e.target.value===''?null:+e.target.value; setEditRes(p=>({...p,[m.id]:{...(p[m.id]||{}),away:v}}))}} className={s.scoreInput}/>
                    </div>
                    <input placeholder={`${m.label.split(' vs ')[1]||'equipo visitante'} (visitante)`} value={aTeam}
                      onChange={e => setEditRes(p=>({...p,[m.id]:{...(p[m.id]||{}),awayTeam:e.target.value}}))}
                      className={s.teamInput}/>
                  </div>
                  {editRes[m.id] && <button className={s.saveBtn} style={{marginTop:8}} onClick={() => saveKOResult(m.id)} disabled={saving===m.id}>{saving===m.id?'Guardando...':'✓ Guardar'}</button>}
                </div>
              ) : (
                <div className={s.matchRow}>
                  <div className={s.teamSide} style={{textAlign:'right',fontWeight:win==='home'?800:500,color:win==='home'?'#1DB954':win==='draw'?'#F0B429':'var(--text)'}}>
                    {hTeam || <span style={{color:'var(--muted)',fontStyle:'italic',fontSize:13}}>{m.label.split(' vs ')[0]}</span>}
                  </div>
                  <div className={s.scoreDisplay}>
                    <span className={s.scoreNum}>{hS!==null&&hS!==undefined?hS:'—'}</span>
                    <span className={s.scoreSep}>:</span>
                    <span className={s.scoreNum}>{aS!==null&&aS!==undefined?aS:'—'}</span>
                  </div>
                  <div className={s.teamSide} style={{textAlign:'left',fontWeight:win==='away'?800:500,color:win==='away'?'#1DB954':win==='draw'?'#F0B429':'var(--text)'}}>
                    {aTeam || <span style={{color:'var(--muted)',fontStyle:'italic',fontSize:13}}>{m.label.split(' vs ')[1]}</span>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Champion result (admin only for setting, public for viewing) */}
      <div className={s.champSection}>
        <div className={s.champTitle}>🏆 Campeón del Mundial 2026</div>
        <div className={s.champGrid}>
          {[
            {key:'champion', label:'🥇 Campeón', pts:20, color:'#F0B429'},
            {key:'runner_up', label:'🥈 Subcampeón', pts:10, color:'#C0C0C0'},
            {key:'third', label:'🥉 Tercer lugar', pts:5, color:'#CD7F32'},
          ].map(({key,label,pts,color}) => (
            <div key={key} className={s.champCard} style={{borderColor:color}}>
              <div className={s.champCardLabel} style={{color}}>{label}</div>
              <div className={s.champCardPts} style={{background:`${color}20`,color}}>+{pts} pts</div>
              {adminMode ? (
                <input value={champEdit[key]!==undefined?champEdit[key]:(champRes[key]||'')}
                  onChange={e => setChampEdit(p=>({...p,[key]:e.target.value}))}
                  placeholder="Nombre del equipo..." className={s.champInput}/>
              ) : (
                <div className={s.champTeamName}>{champRes[key]||'—'}</div>
              )}
            </div>
          ))}
        </div>
        {adminMode && Object.keys(champEdit).length > 0 && (
          <button className={s.btnPrimary} onClick={saveChampResult} disabled={savingChamp} style={{marginTop:14}}>
            {savingChamp?'Guardando...':'💾 Guardar campeones'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── MIS GRUPOS TAB ───────────────────────────────────────────────────────────
function MisGruposTab({ db, participant, onRefresh }) {
  const [filter, setFilter]   = useState('ALL')
  const [localPred, setLocalPred]     = useState({})
  const [localClassif, setLocalClassif] = useState({})
  const [saving, setSaving]   = useState(null)
  const [flash, setFlash]     = useState(null)

  useEffect(() => {
    const lp = {}
    db.groupPreds.filter(p => p.participant_id===participant.id).forEach(p => { lp[p.match_id]={home:p.home_score,away:p.away_score} })
    setLocalPred(lp)
    const lc = {}
    db.classifiedPreds.filter(c => c.participant_id===participant.id).forEach(c => { lc[c.group_id]={first:c.first_place,second:c.second_place} })
    setLocalClassif(lc)
  }, [db.groupPreds, db.classifiedPreds, participant.id])

  const savePred = async (matchId) => {
    if (!db.openMatches.includes(matchId)) return
    const lp = localPred[matchId]
    if (!lp || lp.home===null || lp.away===null) return
    setSaving(matchId)
    const existing = db.groupPreds.find(p => p.match_id===matchId && p.participant_id===participant.id)
    if (existing) await supabase.from('predictions').update({home_score:lp.home,away_score:lp.away}).eq('id',existing.id)
    else await supabase.from('predictions').insert({participant_id:participant.id,match_id:matchId,home_score:lp.home,away_score:lp.away})
    await onRefresh(); setSaving(null); setFlash(matchId); setTimeout(()=>setFlash(null),1500)
  }

  const saveClasif = async (g) => {
    const lc = localClassif[g]; if (!lc) return
    if (!db.openMatches.includes(998)) return
    setSaving(`c-${g}`)
    const existing = db.classifiedPreds.find(c => c.group_id===g && c.participant_id===participant.id)
    if (existing) await supabase.from('classified_predictions').update({first_place:lc.first,second_place:lc.second}).eq('id',existing.id)
    else await supabase.from('classified_predictions').insert({participant_id:participant.id,group_id:g,first_place:lc.first,second_place:lc.second})
    await onRefresh(); setSaving(null); setFlash(`c-${g}`); setTimeout(()=>setFlash(null),1500)
  }

  const filtered = filter==='ALL' ? MATCHES : MATCHES.filter(m => m.group===filter)

  const myGroupPts = MATCHES.reduce((sum,m) => {
    const res = db.groupResults.find(r=>r.match_id===m.id)
    const pred= db.groupPreds.find(p=>p.match_id===m.id && p.participant_id===participant.id)
    return sum + (calcGroupMatchPoints(res,pred)||0)
  },0)
  const myClassifPts = calcClassifiedPoints(db.classifiedRes, db.classifiedPreds.filter(c=>c.participant_id===participant.id))

  return (
    <div className={s.tabContent}>
      <div className={s.pronHeader}>
        <h2 className={s.sectionTitle}>📋 Mis Grupos</h2>
        <div className={s.myPts}>
          <span className={s.ptChip} style={{background:'#1E3A2A',color:'#1DB954',border:'1px solid #1DB954'}}>Partidos: {myGroupPts}</span>
          <span className={s.ptChip} style={{background:'#2A1A3A',color:'#A78BFA',border:'1px solid #7C3AED'}}>Clasif: {myClassifPts}</span>
          <span className={s.ptChip} style={{background:'#E8324A',color:'#fff',fontSize:15,padding:'7px 16px'}}>Subtotal: {myGroupPts+myClassifPts}</span>
        </div>
      </div>

      {/* Classified */}
      <div className={s.classifSection}>
        <h3 className={s.classifTitle}>🏆 Clasificados por Grupo <span style={{color:'#A78BFA',fontSize:13}}>— 3 pts por cada acierto</span></h3>
        <div className={s.classifGrid}>
          {GROUPS.map(g => {
            const teams = GROUP_TEAMS[g]
            const lc    = localClassif[g]||{first:'',second:''}
            const real  = db.classifiedRes.find(r=>r.group_id===g)
            const pred  = db.classifiedPreds.find(c=>c.group_id===g && c.participant_id===participant.id)
            const rt    = real ? [real.first_place,real.second_place].filter(Boolean).map(t=>t.toLowerCase()) : []
            const hit1  = pred && rt.includes(pred.first_place?.toLowerCase())
            const hit2  = pred && rt.includes(pred.second_place?.toLowerCase())
            const gc    = GROUP_COLORS[g]
            return (
              <div key={g} className={s.classifCard} style={{borderColor:gc}}>
                <div className={s.classifCardHeader} style={{background:gc}}>Grupo {g}</div>
                <div className={s.classifCardBody}>
                  {[['first','1°'],['second','2°']].map(([place,lbl]) => (
                    <div key={place} className={s.classifRow}>
                      <span className={s.placeLabel} style={{color:place==='first'?'#1DB954':'#2E6BE6'}}>{lbl}</span>
                      <select value={lc[place]||''} onChange={e=>setLocalClassif(p=>({...p,[g]:{...lc,[place]:e.target.value}}))} className={s.classifSelect}>
                        <option value="">— elegir —</option>
                        {teams.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                      {(place==='first'?hit1:hit2) && <span className={s.hitBadge}>+3</span>}
                    </div>
                  ))}
                  <button className={s.classifSaveBtn} onClick={()=>saveClasif(g)} disabled={saving===`c-${g}` || !db.openMatches.includes(998)}
                    style={{background:flash===`c-${g}`?'#1DB954':!db.openMatches.includes(998)?'#555':gc}}>
                    {flash===`c-${g}`?'✓ Guardado':!db.openMatches.includes(998)?'🔒 Cerrado':saving===`c-${g}`?'...':'Guardar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Match predictions */}
      <div className={s.filterRow}>
        {['ALL',...GROUPS].map(g => (
          <button key={g} onClick={()=>setFilter(g)} className={s.filterBtn}
            style={{background:filter===g?(g==='ALL'?'#E8324A':GROUP_COLORS[g]):'rgba(255,255,255,0.06)',
              color:filter===g?'#fff':'#6B7A99',borderColor:filter===g?'transparent':'rgba(255,255,255,0.1)'}}>
            {g==='ALL'?'Todos':`Grp ${g}`}
          </button>
        ))}
      </div>
      <div className={`${s.matchList} stagger`}>
        {filtered.map(m => {
          const open   = db.openMatches.includes(m.id)
          const res    = db.groupResults.find(r=>r.match_id===m.id)
          const myPred = db.groupPreds.find(p=>p.match_id===m.id && p.participant_id===participant.id)
          const lp     = localPred[m.id]||{home:myPred?.home_score??null,away:myPred?.away_score??null}
          const pts    = calcGroupMatchPoints(res, myPred)
          const gc     = GROUP_COLORS[m.group]
          return (
            <div key={m.id} className={s.matchCard} style={{borderLeftColor:gc,opacity:!open&&!res?0.6:1}}>
              <div className={s.matchMeta}>
                <span className={s.groupTag} style={{background:gc}}>GRP {m.group}</span>
                <span className={s.matchDate}>{m.date}</span>
                {res && pts!==null && (
                  <span className={s.ptsBadge} style={{background:pts===3?'rgba(29,185,84,.2)':pts===2?'rgba(46,107,230,.2)':'rgba(232,50,74,.2)',color:pts===3?'#1DB954':pts===2?'#6B9EFF':'#E8324A'}}>
                    {pts===3?'⭐ +3 EXACTO':pts===2?'✓ +2 RESULT.':'✗ 0 pts'}
                  </span>
                )}
                {!res && <span className={s.matchStatus} style={{background:open?'rgba(240,180,41,.12)':'rgba(107,122,153,.1)',color:open?'#F0B429':'#6B7A99'}}>{open?'🟡 Abierto':'🔒 Cerrado'}</span>}
              </div>
              <div className={s.matchRow}>
                <div className={s.teamSide} style={{textAlign:'right'}}>{m.home}</div>
                <div className={s.predBlock}>
                  {open && !res ? (
                    <div className={s.scoreEditor}>
                      <input type="number" min="0" max="99" placeholder="—"
                        value={lp.home!==null?lp.home:''}
                        onChange={e=>{const v=e.target.value===''?null:+e.target.value; setLocalPred(p=>({...p,[m.id]:{...(p[m.id]||{}),home:v}}))}}
                        onBlur={()=>savePred(m.id)} className={s.scoreInput}/>
                      <span className={s.scoreSep}>:</span>
                      <input type="number" min="0" max="99" placeholder="—"
                        value={lp.away!==null?lp.away:''}
                        onChange={e=>{const v=e.target.value===''?null:+e.target.value; setLocalPred(p=>({...p,[m.id]:{...(p[m.id]||{}),away:v}}))}}
                        onBlur={()=>savePred(m.id)} className={s.scoreInput}/>
                    </div>
                  ) : (
                    <div className={s.scoreDisplay}>
                      <span className={s.scoreNum}>{lp.home!==null?lp.home:'—'}</span>
                      <span className={s.scoreSep}>:</span>
                      <span className={s.scoreNum}>{lp.away!==null?lp.away:'—'}</span>
                    </div>
                  )}
                  {res && <div className={s.realScore}>Real: {res.home_score}:{res.away_score}</div>}
                  {flash===m.id && <div className={s.savedFlash}>✓ Guardado</div>}
                </div>
                <div className={s.teamSide} style={{textAlign:'left'}}>{m.away}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MIS PLAYOFFS TAB ─────────────────────────────────────────────────────────
function MisPlayoffsTab({ db, participant, onRefresh }) {
  const [activeRound, setActiveRound] = useState('r32')
  const [localPred, setLocalPred]     = useState({})
  const [localChamp, setLocalChamp]   = useState({})
  const [saving, setSaving]   = useState(null)
  const [flash, setFlash]     = useState(null)

  useEffect(() => {
    const lp = {}
    db.knockoutPreds.filter(p=>p.participant_id===participant.id).forEach(p=>{lp[p.match_id]={home:p.home_score,away:p.away_score}})
    setLocalPred(lp)
    const myChamp = db.championPreds.find(c=>c.participant_id===participant.id)||{}
    setLocalChamp({champion:myChamp.champion||'',runner_up:myChamp.runner_up||'',third:myChamp.third||''})
  }, [db.knockoutPreds, db.championPreds, participant.id])

  const savePred = async (matchId) => {
    const lp = localPred[matchId]
    if (!lp || lp.home===null || lp.away===null) return
    // Only allow if match is open (admin controlled)
    if (!db.openMatches.includes(matchId)) return
    setSaving(matchId)
    const existing = db.knockoutPreds.find(p=>p.match_id===matchId && p.participant_id===participant.id)
    if (existing) await supabase.from('knockout_predictions').update({home_score:lp.home,away_score:lp.away}).eq('id',existing.id)
    else await supabase.from('knockout_predictions').insert({participant_id:participant.id,match_id:matchId,home_score:lp.home,away_score:lp.away})
    await onRefresh(); setSaving(null); setFlash(matchId); setTimeout(()=>setFlash(null),1500)
  }

  const saveChampPred = async () => {
    setSaving('champ')
    const existing = db.championPreds.find(c=>c.participant_id===participant.id)
    if (existing) await supabase.from('champion_predictions').update(localChamp).eq('id',existing.id)
    else await supabase.from('champion_predictions').insert({...localChamp, participant_id:participant.id})
    await onRefresh(); setSaving(null); setFlash('champ'); setTimeout(()=>setFlash(null),2000)
  }

  const roundMatches = KNOCKOUT_MATCHES.filter(m=>m.round===activeRound)

  const myKoPts = KNOCKOUT_MATCHES.reduce((sum,m) => {
    const res = db.knockoutResults.find(r=>r.match_id===m.id)
    const pred= db.knockoutPreds.find(p=>p.match_id===m.id && p.participant_id===participant.id)
    return sum + (calcKnockoutMatchPoints(res,pred)||0)
  },0)
  const myChampBonus = calcChampionPoints(db.championResult, db.championPreds.find(c=>c.participant_id===participant.id))

  return (
    <div className={s.tabContent}>
      <div className={s.pronHeader}>
        <h2 className={s.sectionTitle}>🎯 Mis Playoffs</h2>
        <div className={s.myPts}>
          <span className={s.ptChip} style={{background:'#1A2A3A',color:'#4A9EFF',border:'1px solid #2E6BE6'}}>Playoff: {myKoPts}</span>
          <span className={s.ptChip} style={{background:'#2A1F0A',color:'#F0B429',border:'1px solid #F0B429'}}>Bonus: {myChampBonus.total}</span>
          <span className={s.ptChip} style={{background:'#E8324A',color:'#fff',fontSize:15,padding:'7px 16px'}}>Subtotal: {myKoPts+myChampBonus.total}</span>
        </div>
      </div>

      {/* Champion prediction */}
      <div className={s.champSection}>
        <div className={s.champTitle}>🏆 Pronóstico Campeón <span style={{color:'var(--muted)',fontSize:13,fontWeight:400}}>— Guarda antes del inicio de la Final</span></div>
        <div className={s.champGrid}>
          {[
            {key:'champion', label:'🥇 Campeón', pts:20, color:'#F0B429'},
            {key:'runner_up', label:'🥈 Subcampeón', pts:10, color:'#C0C0C0'},
            {key:'third', label:'🥉 Tercer lugar', pts:5, color:'#CD7F32'},
          ].map(({key,label,pts,color}) => {
            const champRes = db.championResult||{}
            const hit = champRes[key] && localChamp[key] && champRes[key].toLowerCase()===localChamp[key].toLowerCase()
            return (
              <div key={key} className={s.champCard} style={{borderColor:color}}>
                <div className={s.champCardLabel} style={{color}}>{label} <span style={{fontSize:11}}>+{pts}pts</span></div>
                {hit && <div className={s.hitBadge} style={{marginBottom:4}}>+{pts} ✓</div>}
                <input value={localChamp[key]||''} onChange={e=>setLocalChamp(p=>({...p,[key]:e.target.value}))}
                  placeholder="Nombre del equipo..." className={s.champInput}/>
              </div>
            )
          })}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12,marginTop:12}}>
          <button className={s.btnPrimary} onClick={saveChampPred} disabled={saving==='champ'}>
            {flash==='champ'?'✓ Guardado':saving==='champ'?'Guardando...':'💾 Guardar pronóstico'}
          </button>
          {flash==='champ' && <span style={{color:'#1DB954',fontSize:13}}>¡Pronóstico guardado!</span>}
        </div>
      </div>

      {/* Round tabs */}
      <div className={s.filterRow}>
        {KNOCKOUT_ROUNDS.map(r => (
          <button key={r.id} onClick={()=>setActiveRound(r.id)} className={s.filterBtn}
            style={{background:activeRound===r.id?'#E8324A':'rgba(255,255,255,0.06)',
              color:activeRound===r.id?'#fff':'#6B7A99',borderColor:activeRound===r.id?'transparent':'rgba(255,255,255,0.1)'}}>
            {r.label}
          </button>
        ))}
      </div>

      <div className={`${s.matchList} stagger`}>
        {roundMatches.map(m => {
          const open   = db.openMatches.includes(m.id)
          const res    = db.knockoutResults.find(r=>r.match_id===m.id)
          const myPred = db.knockoutPreds.find(p=>p.match_id===m.id && p.participant_id===participant.id)
          const lp     = localPred[m.id]||{home:myPred?.home_score??null,away:myPred?.away_score??null}
          const pts    = calcKnockoutMatchPoints(res, myPred)
          const roundColor = {r32:'#6A1B9A',r16:'#0277BD',qf:'#00695C',sf:'#C62828',f:'#F57F17',tp:'#4E342E'}[m.round]||'#555'
          const hTeam  = res?.home_team || ''
          const aTeam  = res?.away_team || ''
          const played = res && res.home_score!==null && res.away_score!==null

          return (
            <div key={m.id} className={s.matchCard} style={{borderLeftColor:roundColor,opacity:!open&&!res?0.55:1}}>
              <div className={s.matchMeta}>
                <span className={s.groupTag} style={{background:roundColor}}>
                  {KNOCKOUT_ROUNDS.find(r=>r.id===m.round)?.label}
                </span>
                <span className={s.matchDate}>{m.date} · {m.venue}</span>
                {played && pts!==null && (
                  <span className={s.ptsBadge} style={{background:pts===5?'rgba(29,185,84,.2)':pts===3?'rgba(46,107,230,.2)':'rgba(232,50,74,.2)',color:pts===5?'#1DB954':pts===3?'#6B9EFF':'#E8324A'}}>
                    {pts===5?'⭐ +5 EXACTO':pts===3?'✓ +3 RESULT.':'✗ 0 pts'}
                  </span>
                )}
                {!played && <span className={s.matchStatus} style={{background:open?'rgba(240,180,41,.12)':'rgba(107,122,153,.1)',color:open?'#F0B429':'#6B7A99'}}>{open?'🟡 Abierto':'🔒 Cerrado'}</span>}
              </div>
              <div className={s.matchRow}>
                <div className={s.teamSide} style={{textAlign:'right',color:!hTeam?'var(--muted)':'var(--text)',fontStyle:!hTeam?'italic':'normal',fontSize:!hTeam?13:15}}>
                  {hTeam||m.label.split(' vs ')[0]}
                </div>
                <div className={s.predBlock}>
                  {open && !played ? (
                    <div className={s.scoreEditor}>
                      <input type="number" min="0" max="99" placeholder="—"
                        value={lp.home!==null?lp.home:''}
                        onChange={e=>{const v=e.target.value===''?null:+e.target.value; setLocalPred(p=>({...p,[m.id]:{...(p[m.id]||{}),home:v}}))}}
                        onBlur={()=>savePred(m.id)} className={s.scoreInput}/>
                      <span className={s.scoreSep}>:</span>
                      <input type="number" min="0" max="99" placeholder="—"
                        value={lp.away!==null?lp.away:''}
                        onChange={e=>{const v=e.target.value===''?null:+e.target.value; setLocalPred(p=>({...p,[m.id]:{...(p[m.id]||{}),away:v}}))}}
                        onBlur={()=>savePred(m.id)} className={s.scoreInput}/>
                    </div>
                  ) : (
                    <div className={s.scoreDisplay}>
                      <span className={s.scoreNum}>{lp.home!==null?lp.home:'—'}</span>
                      <span className={s.scoreSep}>:</span>
                      <span className={s.scoreNum}>{lp.away!==null?lp.away:'—'}</span>
                    </div>
                  )}
                  {played && <div className={s.realScore}>Real: {res.home_score}:{res.away_score}</div>}
                  {flash===m.id && <div className={s.savedFlash}>✓ Guardado</div>}
                </div>
                <div className={s.teamSide} style={{textAlign:'left',color:!aTeam?'var(--muted)':'var(--text)',fontStyle:!aTeam?'italic':'normal',fontSize:!aTeam?13:15}}>
                  {aTeam||m.label.split(' vs ')[1]}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── ADMIN TAB ────────────────────────────────────────────────────────────────
function AdminTab({ db, leaderboard, onRefresh }) {
  const [delConfirm, setDelConfirm]   = useState(null)
  const [localOpen, setLocalOpen]     = useState([...db.openMatches])
  const [savingOpen, setSavingOpen]   = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody]     = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent]     = useState(false)
  const [activeSection, setActiveSection] = useState('stats')

  useEffect(()=>{ setLocalOpen([...db.openMatches]) }, [db.openMatches])

  const deleteParticipant = async (id) => {
    await Promise.all([
      supabase.from('predictions').delete().eq('participant_id',id),
      supabase.from('classified_predictions').delete().eq('participant_id',id),
      supabase.from('knockout_predictions').delete().eq('participant_id',id),
      supabase.from('champion_predictions').delete().eq('participant_id',id),
      supabase.from('participants').delete().eq('id',id),
    ])
    setDelConfirm(null); await onRefresh()
  }

  const saveOpenMatches = async () => {
    setSavingOpen(true)
    await supabase.from('open_matches').delete().neq('match_id',-1)
    if (localOpen.length>0) await supabase.from('open_matches').insert(localOpen.map(id=>({match_id:id})))
    await onRefresh(); setSavingOpen(false)
  }

  // All matches (group + knockout) for open/close control
  const allMatches = [
    ...MATCHES.map(m=>({...m, phase:'grupos', roundLabel:`Grupo ${m.group}`})),
    ...KNOCKOUT_MATCHES.map(m=>({
      ...m, phase:'playoff',
      roundLabel: KNOCKOUT_ROUNDS.find(r=>r.id===m.round)?.label||m.round,
      home: m.label.split(' vs ')[0], away: m.label.split(' vs ')[1]||'',
    })),
    { id:998, phase:'clasif', roundLabel:'📊 Clasificados de Grupo', home:'Pronóstico', away:'1° y 2° por grupo', date:'' },
    { id:999, phase:'bonus', roundLabel:'🏆 Bonus Campeón', home:'Pronóstico', away:'Campeón/2°/3°', date:'' },
  ]

  // Email: build mailto link with all participant emails
  const emailsWithAddr = db.participants.filter(p=>p.email)
  const mailtoLink = emailsWithAddr.length > 0
    ? `mailto:${emailsWithAddr.map(p=>p.email).join(',')}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    : null

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tu-polla.vercel.app'
  const phases = [
    {label:'Fase de Grupos', link:`${appUrl}`, hint:'Para pronosticar partidos de grupos (pestaña Mis Grupos)'},
    {label:'Playoffs', link:`${appUrl}`, hint:'Para pronosticar playoffs (pestaña Mis Playoffs)'},
  ]

  const sections = ['stats','participantes','partidos','email','links']

  return (
    <div className={s.tabContent}>
      <h2 className={s.sectionTitle}>⚙️ Panel de Administración</h2>

      <div className={s.adminNav}>
        {[['stats','📊 Resumen'],['participantes','👥 Participantes'],['partidos','🔓 Partidos'],['email','📧 Email'],['links','🔗 Links']].map(([id,label])=>(
          <button key={id} className={`${s.adminNavBtn} ${activeSection===id?s.adminNavActive:''}`} onClick={()=>setActiveSection(id)}>{label}</button>
        ))}
      </div>

      {/* STATS */}
      {activeSection==='stats' && (
        <div>
          <div className={s.statsGrid}>
            {[
              {label:'Participantes', val:db.participants.length, color:'#E8324A'},
              {label:'Partidos grupos jugados', val:db.groupResults.length, color:'#1DB954'},
              {label:'Partidos playoffs', val:db.knockoutResults.filter(r=>r.home_score!==null).length, color:'#4A9EFF'},
              {label:'Pronósticos grupos', val:db.groupPreds.length, color:'#A78BFA'},
              {label:'Pronósticos playoffs', val:db.knockoutPreds.length, color:'#F0B429'},
              {label:'Líder actual', val:leaderboard[0]?.name||'—', color:'#F0B429'},
            ].map(st=>(
              <div key={st.label} className={s.statCard}>
                <div className={s.statVal} style={{color:st.color}}>{st.val}</div>
                <div className={s.statLabel}>{st.label}</div>
              </div>
            ))}
          </div>
          <div className={s.adminSection}>
            <div className={s.adminSectionTitle}>🏆 Tabla resumida</div>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>POS</th><th>NOMBRE</th><th>GRUPOS</th><th>CLASIF</th><th>PLAYOFF</th><th>BONUS</th><th>TOTAL</th></tr></thead>
                <tbody>
                  {leaderboard.map((p,i)=>(
                    <tr key={p.id} className={i===0?s.rowGold:i===1?s.rowSilver:i===2?s.rowBronze:''}>
                      <td className={s.tdPos}>{['🥇','🥈','🥉'][i]||i+1}</td>
                      <td className={s.tdName}>{p.name}</td>
                      <td className={s.tdCenter} style={{color:'#1DB954'}}>{p.groupMatchPts}</td>
                      <td className={s.tdCenter} style={{color:'#A78BFA'}}>{p.classifPts}</td>
                      <td className={s.tdCenter} style={{color:'#4A9EFF'}}>{p.knockoutPts}</td>
                      <td className={s.tdCenter} style={{color:'#F0B429'}}>{p.champBonus}</td>
                      <td className={s.tdTotal}><span className={s.totalBadge}>{p.total}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PARTICIPANTES */}
      {activeSection==='participantes' && (
        <div className={s.adminSection}>
          <div className={s.adminSectionTitle}>👥 Participantes Registrados</div>
          {db.participants.length===0 ? <div className={s.empty}>No hay participantes aún.</div>
          : db.participants.map((p,i)=>{
            const lb = leaderboard.find(l=>l.id===p.id)
            return (
              <div key={p.id} className={s.adminParticipantRow}>
                <div className={s.adminRank}>#{i+1}</div>
                <div className={s.adminPartInfo}>
                  <div className={s.adminPartName}>{p.name}</div>
                  <div className={s.adminPartMeta}>
                    {p.email || <span style={{color:'var(--muted)',fontStyle:'italic'}}>Sin email registrado</span>}
                    {' · '}{lb?.total||0} pts totales
                  </div>
                </div>
                {delConfirm===p.id ? (
                  <div className={s.delConfirm}>
                    <span>¿Eliminar?</span>
                    <button onClick={()=>deleteParticipant(p.id)} className={s.btnDanger} style={{padding:'4px 10px'}}>Sí</button>
                    <button onClick={()=>setDelConfirm(null)} className={s.btnSecondary} style={{padding:'4px 10px'}}>No</button>
                  </div>
                ) : (
                  <button onClick={()=>setDelConfirm(p.id)} className={s.btnDanger}>🗑️</button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* PARTIDOS - open/close */}
      {activeSection==='partidos' && (
        <div className={s.adminSection}>
          <div className={s.adminSectionHeader}>
            <div className={s.adminSectionTitle}>🔓 Control de Partidos</div>
            <div className={s.adminControls}>
              <button className={s.btnSecondary} onClick={()=>setLocalOpen(allMatches.map(m=>m.id))}>Abrir todos</button>
              <button className={s.btnSecondary} onClick={()=>setLocalOpen([])}>Cerrar todos</button>
              <button className={s.btnPrimary} onClick={saveOpenMatches} disabled={savingOpen}>{savingOpen?'Guardando...':'💾 Guardar'}</button>
            </div>
          </div>
          <p style={{color:'var(--muted)',fontSize:13,marginBottom:16}}>Abre los partidos antes de cada fase para que los participantes puedan pronosticar. Ciérralos cuando empiece el partido.</p>
          {['grupos','playoff','clasif','bonus'].map(phase => {
            const phaseMatches = allMatches.filter(m=>m.phase===phase)
            const rounds = [...new Set(phaseMatches.map(m=>m.roundLabel))]
            return (
              <div key={phase}>
                <div className={s.phaseLabel}>{phase==='grupos'?'⚽ FASE DE GRUPOS':phase==='playoff'?'🔥 FASE ELIMINATORIA':phase==='clasif'?'📊 CLASIFICADOS DE GRUPO':'🏆 BONUS CAMPEÓN'}</div>
                {rounds.map(round => {
                  const rMatches = phaseMatches.filter(m=>m.roundLabel===round)
                  const allOpen  = rMatches.every(m=>localOpen.includes(m.id))
                  return (
                    <div key={round} className={s.openGroup}>
                      <div className={s.openGroupHeader} style={{borderLeftColor:phase==='grupos'?'#1DB954':phase==='playoff'?'#E8324A':phase==='clasif'?'#A78BFA':'#F0B429'}}>
                        <span style={{fontWeight:700}}>{round}</span>
                        <button className={s.toggleAllBtn} onClick={()=>{
                          const ids = rMatches.map(m=>m.id)
                          setLocalOpen(prev => allOpen ? prev.filter(id=>!ids.includes(id)) : [...new Set([...prev,...ids])])
                        }} style={{background:allOpen?'rgba(232,50,74,.15)':'rgba(29,185,84,.15)',color:allOpen?'#E8324A':'#1DB954'}}>
                          {allOpen?'Cerrar todos':'Abrir todos'}
                        </button>
                      </div>
                      {rMatches.map(m=>(
                        <div key={m.id} className={s.openMatchRow}>
                          <span className={s.openMatchName}>{m.date} — {m.home} vs {m.away||m.label}</span>
                          <button className={s.toggleBtn} onClick={()=>setLocalOpen(prev=>prev.includes(m.id)?prev.filter(id=>id!==m.id):[...prev,m.id])}
                            style={{background:localOpen.includes(m.id)?'rgba(240,180,41,.15)':'rgba(107,122,153,.12)',
                              color:localOpen.includes(m.id)?'#F0B429':'#6B7A99',
                              borderColor:localOpen.includes(m.id)?'rgba(240,180,41,.3)':'rgba(107,122,153,.2)'}}>
                            {localOpen.includes(m.id)?'🟡 Abierto':'🔒 Cerrado'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* EMAIL */}
      {activeSection==='email' && (
        <div className={s.adminSection}>
          <div className={s.adminSectionTitle}>📧 Enviar Email a Participantes</div>
          <p style={{color:'var(--muted)',fontSize:13,marginBottom:16}}>
            Redacta un mensaje para notificar a los participantes (ej: que se abrió una nueva fase). Se abrirá tu cliente de correo con todos los emails en BCC.
          </p>
          {emailsWithAddr.length===0 ? (
            <div className={s.infoBox}>⚠️ Ningún participante tiene email registrado. Los participantes pueden agregar su email al registrarse.</div>
          ) : (
            <div className={s.infoBox} style={{background:'rgba(29,185,84,.08)',borderColor:'rgba(29,185,84,.2)',color:'#1DB954'}}>
              ✓ {emailsWithAddr.length} participante{emailsWithAddr.length!==1?'s':''} con email: {emailsWithAddr.map(p=>p.name).join(', ')}
            </div>
          )}
          <div style={{display:'flex',flexDirection:'column',gap:12,marginTop:16}}>
            <div>
              <label className={s.inputLabel}>Asunto</label>
              <input value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} className={s.adminInput}
                placeholder="ej: ⚽ ¡Se abrió la fase de playoffs! Carga tus pronósticos"/>
            </div>
            <div>
              <label className={s.inputLabel}>Cuerpo del mensaje</label>
              <textarea value={emailBody} onChange={e=>setEmailBody(e.target.value)} className={s.adminTextarea} rows={6}
                placeholder={`Hola familia!\n\nYa están abiertos los pronósticos para los playoffs del Mundial 2026.\n\nEntra en: ${appUrl}\n\nTienes hasta [fecha] para cargar tus pronósticos.\n\n¡Buena suerte a todos! ⚽`}/>
            </div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <button className={s.btnSecondary} onClick={()=>{
                setEmailSubject('⚽ ¡Playoffs del Mundial 2026! Carga tus pronósticos')
                setEmailBody(`¡Hola a todos!\n\nLos playoffs del Mundial 2026 ya comenzaron y las predicciones están abiertas.\n\nEntra aquí para cargar tus pronósticos de la fase eliminatoria:\n🔗 ${appUrl}\n\nRecuerda que en playoffs los puntos son:\n⭐ Marcador exacto: 5 pts\n✓ Resultado correcto: 3 pts\n🏆 Campeón: 20 pts · Subcampeón: 10 pts · 3er lugar: 5 pts\n\n¡Buena suerte a todos! 🏆`)
              }}>Usar plantilla playoffs</button>
              {mailtoLink && (
                <a href={mailtoLink} className={s.btnPrimary} style={{textDecoration:'none',display:'inline-flex',alignItems:'center'}}>
                  📧 Abrir en correo
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LINKS */}
      {activeSection==='links' && (
        <div className={s.adminSection}>
          <div className={s.adminSectionTitle}>🔗 Links para Compartir</div>
          <p style={{color:'var(--muted)',fontSize:13,marginBottom:20}}>
            Comparte estos links con los participantes según la fase activa.
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className={s.linkCard}>
              <div className={s.linkLabel}>🔗 Link principal de la polla</div>
              <div className={s.linkUrl}>{appUrl}</div>
              <div className={s.linkHint}>Comparte este link en cualquier momento. Los participantes pueden registrarse y ver la tabla.</div>
              <button className={s.btnSecondary} style={{marginTop:10}} onClick={()=>navigator.clipboard.writeText(appUrl)}>📋 Copiar link</button>
            </div>
            <div className={s.infoBox}>
              <strong>💡 Tip:</strong> Cuando abras una nueva fase (playoffs), envía un email desde la pestaña Email con el link principal. Los participantes entran, hacen clic en <strong>Mis Playoffs</strong> y cargan sus pronósticos directamente.
            </div>
            <div className={s.linkCard}>
              <div className={s.linkLabel}>⚙️ PIN de administrador</div>
              <div className={s.linkUrl} style={{letterSpacing:4}}>{ADMIN_PIN}</div>
              <div className={s.linkHint}>No compartas este PIN. Es el que usas para ingresar resultados y controlar la polla.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── REGISTER MODAL ───────────────────────────────────────────────────────────
function RegisterModal({ participants, onRefresh, onClose, onJoin }) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) { setError('Ingresa tu nombre'); return }
    // Check if name already exists → login
    const existing = participants.find(p => p.name.toLowerCase()===trimmed.toLowerCase())
    if (existing) { onJoin(existing); return }
    setLoading(true)
    const { data, error:err } = await supabase.from('participants').insert({name:trimmed, email:email.trim()||null}).select().single()
    if (err) { setError('Error al registrarse. Intenta de nuevo.'); setLoading(false); return }
    await onRefresh(); onJoin(data)
  }

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modal} onClick={e=>e.stopPropagation()}>
        <div className={s.modalIcon}>⚽</div>
        <h2 className={s.modalTitle}>Únete a la Polla</h2>
        <p className={s.modalSub}>Regístrate para cargar tus pronósticos y competir</p>
        <input autoFocus value={name} onChange={e=>{setName(e.target.value);setError('')}}
          onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="Tu nombre..."
          className={`${s.modalInput} ${error?s.inputError:''}`}/>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email"
          placeholder="Tu email (opcional — para recibir notificaciones)"
          className={s.modalInput} style={{marginTop:10}}/>
        {error && <div className={s.errorMsg}>{error}</div>}
        <p style={{fontSize:11,color:'var(--muted)',marginTop:8,lineHeight:1.5}}>
          Si ya estás registrado, escribe tu nombre exacto para volver a entrar.
        </p>
        <div className={s.modalActions}>
          <button className={s.btnSecondary} onClick={onClose}>Cancelar</button>
          <button className={s.btnPrimary} onClick={submit} disabled={loading}>{loading?'Registrando...':'¡Entrar!'}</button>
        </div>
      </div>
    </div>
  )
}

function PinModal({ onClose, onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const submit = () => { if (pin===ADMIN_PIN) onSuccess(); else { setError(true); setPin('') } }
  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modal} onClick={e=>e.stopPropagation()}>
        <div className={s.modalIcon}>🔒</div>
        <h2 className={s.modalTitle}>Acceso Admin</h2>
        <p className={s.modalSub}>Ingresa el PIN de administrador</p>
        <input type="password" autoFocus maxLength={8} value={pin}
          onChange={e=>{setPin(e.target.value);setError(false)}}
          onKeyDown={e=>e.key==='Enter'&&submit()}
          placeholder="PIN" className={`${s.modalInput} ${s.pinInput} ${error?s.inputError:''}`}/>
        {error && <div className={s.errorMsg}>PIN incorrecto</div>}
        <div className={s.modalActions}>
          <button className={s.btnSecondary} onClick={onClose}>Cancelar</button>
          <button className={s.btnPrimary} onClick={submit}>Entrar</button>
        </div>
      </div>
    </div>
  )
}
