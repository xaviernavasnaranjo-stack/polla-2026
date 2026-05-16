import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ─── GROUP STAGE MATCHES ─────────────────────────────────────────────────────
export const MATCHES = [
  { id:1,  date:"11 Jun", group:"A", home:"México",         away:"Sudáfrica",       venue:"Est. Ciudad de México" },
  { id:2,  date:"11 Jun", group:"A", home:"Corea del Sur",  away:"Rep. Checa",      venue:"Est. Guadalajara" },
  { id:3,  date:"18 Jun", group:"A", home:"Rep. Checa",     away:"Sudáfrica",       venue:"Atlanta Stadium" },
  { id:4,  date:"18 Jun", group:"A", home:"México",         away:"Corea del Sur",   venue:"Est. Guadalajara" },
  { id:5,  date:"24 Jun", group:"A", home:"Rep. Checa",     away:"México",          venue:"Est. Ciudad de México" },
  { id:6,  date:"24 Jun", group:"A", home:"Sudáfrica",      away:"Corea del Sur",   venue:"Est. Monterrey" },
  { id:7,  date:"12 Jun", group:"B", home:"Canadá",         away:"Bosnia y Herz.",  venue:"Toronto Stadium" },
  { id:8,  date:"13 Jun", group:"B", home:"Qatar",          away:"Suiza",           venue:"San Francisco Stadium" },
  { id:9,  date:"18 Jun", group:"B", home:"Suiza",          away:"Bosnia y Herz.",  venue:"Los Angeles Stadium" },
  { id:10, date:"18 Jun", group:"B", home:"Canadá",         away:"Qatar",           venue:"BC Place Vancouver" },
  { id:11, date:"24 Jun", group:"B", home:"Suiza",          away:"Canadá",          venue:"BC Place Vancouver" },
  { id:12, date:"24 Jun", group:"B", home:"Bosnia y Herz.", away:"Qatar",           venue:"Seattle Stadium" },
  { id:13, date:"13 Jun", group:"C", home:"Brasil",         away:"Marruecos",       venue:"New York NJ Stadium" },
  { id:14, date:"13 Jun", group:"C", home:"Haití",          away:"Escocia",         venue:"Boston Stadium" },
  { id:15, date:"19 Jun", group:"C", home:"Brasil",         away:"Haití",           venue:"Philadelphia Stadium" },
  { id:16, date:"19 Jun", group:"C", home:"Escocia",        away:"Marruecos",       venue:"Boston Stadium" },
  { id:17, date:"24 Jun", group:"C", home:"Escocia",        away:"Brasil",          venue:"Miami Stadium" },
  { id:18, date:"24 Jun", group:"C", home:"Marruecos",      away:"Haití",           venue:"Atlanta Stadium" },
  { id:19, date:"12 Jun", group:"D", home:"EE.UU.",         away:"Paraguay",        venue:"Los Angeles Stadium" },
  { id:20, date:"13 Jun", group:"D", home:"Australia",      away:"Turquía",         venue:"BC Place Vancouver" },
  { id:21, date:"19 Jun", group:"D", home:"Turquía",        away:"Paraguay",        venue:"San Francisco Stadium" },
  { id:22, date:"19 Jun", group:"D", home:"EE.UU.",         away:"Australia",       venue:"Seattle Stadium" },
  { id:23, date:"25 Jun", group:"D", home:"Turquía",        away:"EE.UU.",          venue:"Los Angeles Stadium" },
  { id:24, date:"25 Jun", group:"D", home:"Paraguay",       away:"Australia",       venue:"San Francisco Stadium" },
  { id:25, date:"14 Jun", group:"E", home:"Alemania",       away:"Curazao",         venue:"Houston Stadium" },
  { id:26, date:"14 Jun", group:"E", home:"Costa de Marfil",away:"Ecuador",         venue:"Philadelphia Stadium" },
  { id:27, date:"20 Jun", group:"E", home:"Alemania",       away:"Costa de Marfil", venue:"Toronto Stadium" },
  { id:28, date:"20 Jun", group:"E", home:"Ecuador",        away:"Curazao",         venue:"Kansas City Stadium" },
  { id:29, date:"25 Jun", group:"E", home:"Ecuador",        away:"Alemania",        venue:"New York NJ Stadium" },
  { id:30, date:"25 Jun", group:"E", home:"Curazao",        away:"Costa de Marfil", venue:"Philadelphia Stadium" },
  { id:31, date:"14 Jun", group:"F", home:"Países Bajos",   away:"Japón",           venue:"Dallas Stadium" },
  { id:32, date:"14 Jun", group:"F", home:"Suecia",         away:"Túnez",           venue:"Est. Monterrey" },
  { id:33, date:"20 Jun", group:"F", home:"Países Bajos",   away:"Suecia",          venue:"Houston Stadium" },
  { id:34, date:"20 Jun", group:"F", home:"Túnez",          away:"Japón",           venue:"Est. Monterrey" },
  { id:35, date:"25 Jun", group:"F", home:"Túnez",          away:"Países Bajos",    venue:"Kansas City Stadium" },
  { id:36, date:"25 Jun", group:"F", home:"Japón",          away:"Suecia",          venue:"Dallas Stadium" },
  { id:37, date:"15 Jun", group:"G", home:"Bélgica",        away:"Egipto",          venue:"Seattle Stadium" },
  { id:38, date:"15 Jun", group:"G", home:"Irán",           away:"Nueva Zelanda",   venue:"Los Angeles Stadium" },
  { id:39, date:"21 Jun", group:"G", home:"Bélgica",        away:"Irán",            venue:"Los Angeles Stadium" },
  { id:40, date:"21 Jun", group:"G", home:"Nueva Zelanda",  away:"Egipto",          venue:"BC Place Vancouver" },
  { id:41, date:"26 Jun", group:"G", home:"Nueva Zelanda",  away:"Bélgica",         venue:"BC Place Vancouver" },
  { id:42, date:"26 Jun", group:"G", home:"Egipto",         away:"Irán",            venue:"Seattle Stadium" },
  { id:43, date:"15 Jun", group:"H", home:"España",         away:"Cabo Verde",      venue:"Atlanta Stadium" },
  { id:44, date:"15 Jun", group:"H", home:"Arabia Saudita", away:"Uruguay",         venue:"Miami Stadium" },
  { id:45, date:"21 Jun", group:"H", home:"España",         away:"Arabia Saudita",  venue:"Atlanta Stadium" },
  { id:46, date:"21 Jun", group:"H", home:"Uruguay",        away:"Cabo Verde",      venue:"Miami Stadium" },
  { id:47, date:"26 Jun", group:"H", home:"Uruguay",        away:"España",          venue:"Est. Guadalajara" },
  { id:48, date:"26 Jun", group:"H", home:"Cabo Verde",     away:"Arabia Saudita",  venue:"Houston Stadium" },
  { id:49, date:"16 Jun", group:"I", home:"Francia",        away:"Senegal",         venue:"New York NJ Stadium" },
  { id:50, date:"16 Jun", group:"I", home:"Irak",           away:"Noruega",         venue:"Boston Stadium" },
  { id:51, date:"22 Jun", group:"I", home:"Francia",        away:"Irak",            venue:"Philadelphia Stadium" },
  { id:52, date:"22 Jun", group:"I", home:"Noruega",        away:"Senegal",         venue:"New York NJ Stadium" },
  { id:53, date:"26 Jun", group:"I", home:"Noruega",        away:"Francia",         venue:"Boston Stadium" },
  { id:54, date:"26 Jun", group:"I", home:"Senegal",        away:"Irak",            venue:"Toronto Stadium" },
  { id:55, date:"16 Jun", group:"J", home:"Argentina",      away:"Argelia",         venue:"Kansas City Stadium" },
  { id:56, date:"16 Jun", group:"J", home:"Austria",        away:"Jordania",        venue:"San Francisco Stadium" },
  { id:57, date:"22 Jun", group:"J", home:"Argentina",      away:"Austria",         venue:"Dallas Stadium" },
  { id:58, date:"22 Jun", group:"J", home:"Jordania",       away:"Argelia",         venue:"San Francisco Stadium" },
  { id:59, date:"27 Jun", group:"J", home:"Jordania",       away:"Argentina",       venue:"Dallas Stadium" },
  { id:60, date:"27 Jun", group:"J", home:"Argelia",        away:"Austria",         venue:"Kansas City Stadium" },
  { id:61, date:"17 Jun", group:"K", home:"Portugal",       away:"Rep. D. Congo",   venue:"Houston Stadium" },
  { id:62, date:"17 Jun", group:"K", home:"Uzbekistán",     away:"Colombia",        venue:"Est. Ciudad de México" },
  { id:63, date:"23 Jun", group:"K", home:"Portugal",       away:"Uzbekistán",      venue:"Houston Stadium" },
  { id:64, date:"23 Jun", group:"K", home:"Colombia",       away:"Rep. D. Congo",   venue:"Est. Guadalajara" },
  { id:65, date:"27 Jun", group:"K", home:"Colombia",       away:"Portugal",        venue:"Miami Stadium" },
  { id:66, date:"27 Jun", group:"K", home:"Rep. D. Congo",  away:"Uzbekistán",      venue:"Atlanta Stadium" },
  { id:67, date:"17 Jun", group:"L", home:"Inglaterra",     away:"Croacia",         venue:"Dallas Stadium" },
  { id:68, date:"17 Jun", group:"L", home:"Ghana",          away:"Panamá",          venue:"Toronto Stadium" },
  { id:69, date:"23 Jun", group:"L", home:"Inglaterra",     away:"Ghana",           venue:"Boston Stadium" },
  { id:70, date:"23 Jun", group:"L", home:"Panamá",         away:"Croacia",         venue:"Toronto Stadium" },
  { id:71, date:"27 Jun", group:"L", home:"Panamá",         away:"Inglaterra",      venue:"New York NJ Stadium" },
  { id:72, date:"27 Jun", group:"L", home:"Croacia",        away:"Ghana",           venue:"Philadelphia Stadium" },
]

export const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"]

export const GROUP_TEAMS = GROUPS.reduce((acc, g) => {
  acc[g] = [...new Set(MATCHES.filter(m => m.group === g).flatMap(m => [m.home, m.away]))]
  return acc
}, {})

export const GROUP_COLORS = {
  A:"#1565C0", B:"#C62828", C:"#2E7D32", D:"#F57F17",
  E:"#6A1B9A", F:"#00695C", G:"#E65100", H:"#0277BD",
  I:"#4E342E", J:"#AD1457", K:"#00838F", L:"#283593",
}

// ─── KNOCKOUT BRACKET (from official PDF) ────────────────────────────────────
// slot codes match the bracket: e.g. "1E" = 1st place Group E, "3ABCDF" = best 3rd among those groups
// matchId 101-116 = Round of 32, 201-208 = R16, 301-304 = QF, 401-402 = SF, 501 = Final, 502 = 3rd place

export const KNOCKOUT_ROUNDS = [
  { id: "r32", label: "16avos de Final", matchIds: [101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116] },
  { id: "r16", label: "Octavos de Final", matchIds: [201,202,203,204,205,206,207,208] },
  { id: "qf",  label: "Cuartos de Final", matchIds: [301,302,303,304] },
  { id: "sf",  label: "Semifinales",      matchIds: [401,402] },
  { id: "f",   label: "Final",            matchIds: [501] },
  { id: "tp",  label: "Tercer Puesto",    matchIds: [502] },
]

export const KNOCKOUT_MATCHES = [
  // 16avos de final
  { id:101, round:"r32", date:"29 Jun", venue:"Boston",        label:"1E vs 3ABCDF" },
  { id:102, round:"r32", date:"30 Jun", venue:"New Jersey",    label:"3CDFGH vs 2A" },  // was "1I vs 3CDFGH"  — reorder per bracket
  { id:103, round:"r32", date:"28 Jun", venue:"Los Angeles",   label:"2A vs 2B" },
  { id:104, round:"r32", date:"29 Jun", venue:"Monterrey",     label:"1F vs 2C" },
  { id:105, round:"r32", date:"2 Jul",  venue:"Toronto",       label:"2K vs 2L" },
  { id:106, round:"r32", date:"2 Jul",  venue:"Los Angeles",   label:"1H vs 2J" },
  { id:107, round:"r32", date:"1 Jul",  venue:"San Francisco", label:"1D vs 3BEFIJ" },
  { id:108, round:"r32", date:"1 Jul",  venue:"Seattle",       label:"1G vs 3AEHIJ" },
  { id:109, round:"r32", date:"29 Jun", venue:"Houston",       label:"1C vs 2F" },
  { id:110, round:"r32", date:"30 Jun", venue:"Dallas",        label:"2E vs 2I" },
  { id:111, round:"r32", date:"30 Jun", venue:"Ciudad de Méx.",label:"1A vs 3CEFHI" },
  { id:112, round:"r32", date:"1 Jul",  venue:"Atlanta",       label:"1L vs 3EHIJK" },
  { id:113, round:"r32", date:"3 Jul",  venue:"Miami",         label:"1J vs 2H" },
  { id:114, round:"r32", date:"3 Jul",  venue:"Dallas",        label:"2D vs 2G" },
  { id:115, round:"r32", date:"2 Jul",  venue:"Vancouver",     label:"1B vs 3EFGIJ" },
  { id:116, round:"r32", date:"3 Jul",  venue:"Kansas City",   label:"1K vs 3DEIJL" },
  // Octavos de final
  { id:201, round:"r16", date:"4 Jul",  venue:"Philadelphia",  label:"G74 vs G77" },
  { id:202, round:"r16", date:"4 Jul",  venue:"Houston",       label:"G73 vs G75" },
  { id:203, round:"r16", date:"6 Jul",  venue:"Dallas",        label:"G83 vs G84" },
  { id:204, round:"r16", date:"6 Jul",  venue:"Seattle",       label:"G81 vs G82" },
  { id:205, round:"r16", date:"5 Jul",  venue:"New Jersey",    label:"G76 vs G78" },
  { id:206, round:"r16", date:"5 Jul",  venue:"Ciudad de Méx.",label:"G79 vs G80" },
  { id:207, round:"r16", date:"7 Jul",  venue:"Atlanta",       label:"G86 vs G88" },
  { id:208, round:"r16", date:"7 Jul",  venue:"Vancouver",     label:"G85 vs G87" },
  // Cuartos de final
  { id:301, round:"qf",  date:"9 Jul",  venue:"Boston",        label:"G89 vs G90" },
  { id:302, round:"qf",  date:"10 Jul", venue:"Los Angeles",   label:"G93 vs G94" },
  { id:303, round:"qf",  date:"11 Jul", venue:"Miami",         label:"G91 vs G92" },
  { id:304, round:"qf",  date:"11 Jul", venue:"Kansas City",   label:"G95 vs G96" },
  // Semifinales
  { id:401, round:"sf",  date:"14 Jul", venue:"Dallas",        label:"G97 vs G98" },
  { id:402, round:"sf",  date:"15 Jul", venue:"Atlanta",       label:"G99 vs G100" },
  // Final & 3er puesto
  { id:501, round:"f",   date:"19 Jul", venue:"New Jersey",    label:"G101 vs G102" },
  { id:502, round:"tp",  date:"18 Jul", venue:"Miami",         label:"P101 vs P102" },
]

// ─── SCORING ─────────────────────────────────────────────────────────────────
// Group stage
export function calcGroupMatchPoints(result, prediction) {
  if (!result || result.home_score === null || result.away_score === null) return null
  if (!prediction || prediction.home_score === null || prediction.away_score === null) return 0
  const rH = result.home_score, rA = result.away_score
  const pH = prediction.home_score, pA = prediction.away_score
  if (rH === pH && rA === pA) return 3
  if (Math.sign(rH - rA) === Math.sign(pH - pA)) return 2
  return 0
}

// Knockout stage: 5 pts exact, 3 pts correct result
export function calcKnockoutMatchPoints(result, prediction) {
  if (!result || result.home_score === null || result.away_score === null) return null
  if (!prediction || prediction.home_score === null || prediction.away_score === null) return 0
  const rH = result.home_score, rA = result.away_score
  const pH = prediction.home_score, pA = prediction.away_score
  if (rH === pH && rA === pA) return 5
  if (Math.sign(rH - rA) === Math.sign(pH - pA)) return 3
  return 0
}

// Classified group stage: 3 pts each
export function calcClassifiedPoints(classifiedResults, predictedClassified) {
  let pts = 0
  for (const g of GROUPS) {
    const real = classifiedResults.find(r => r.group_id === g)
    const pred = predictedClassified.find(c => c.group_id === g)
    if (!real || !pred) continue
    const realTeams = [real.first_place, real.second_place].filter(Boolean).map(t => t.toLowerCase())
    if (pred.first_place  && realTeams.includes(pred.first_place.toLowerCase()))  pts += 3
    if (pred.second_place && realTeams.includes(pred.second_place.toLowerCase())) pts += 3
  }
  return pts
}

// Champion bonuses: 20/10/5
export function calcChampionPoints(championResult, prediction) {
  // championResult: { champion, runner_up, third }
  // prediction: { champion, runner_up, third }
  if (!championResult || !prediction) return { champion:0, runner_up:0, third:0, total:0 }
  const champ    = championResult.champion?.toLowerCase()
  const runner   = championResult.runner_up?.toLowerCase()
  const third    = championResult.third?.toLowerCase()
  const pChamp   = prediction.champion?.toLowerCase()
  const pRunner  = prediction.runner_up?.toLowerCase()
  const pThird   = prediction.third?.toLowerCase()
  const champPts  = champ  && pChamp  && champ  === pChamp  ? 20 : 0
  const runnerPts = runner && pRunner && runner === pRunner ? 10 : 0
  const thirdPts  = third  && pThird  && third  === pThird  ? 5  : 0
  return { champion: champPts, runner_up: runnerPts, third: thirdPts, total: champPts + runnerPts + thirdPts }
}

// Full leaderboard: group + knockout + champion bonus
export function calcLeaderboard(participants, groupResults, groupPredictions, classifiedResults, classifiedPredictions, knockoutResults, knockoutPredictions, championResult, championPredictions) {
  return participants.map(p => {
    // Group stage
    let groupMatchPts = 0, exact = 0, correct = 0
    MATCHES.forEach(m => {
      const res  = groupResults.find(r => r.match_id === m.id)
      const pred = groupPredictions.find(pr => pr.match_id === m.id && pr.participant_id === p.id)
      const pts  = calcGroupMatchPoints(res, pred)
      if (pts === 3) { exact++; groupMatchPts += 3 }
      if (pts === 2) { correct++; groupMatchPts += 2 }
    })
    const classifPts = calcClassifiedPoints(
      classifiedResults,
      classifiedPredictions.filter(c => c.participant_id === p.id)
    )

    // Knockout stage
    let knockoutPts = 0, koExact = 0, koCorrect = 0
    KNOCKOUT_MATCHES.forEach(m => {
      const res  = knockoutResults.find(r => r.match_id === m.id)
      const pred = knockoutPredictions.find(pr => pr.match_id === m.id && pr.participant_id === p.id)
      const pts  = calcKnockoutMatchPoints(res, pred)
      if (pts === 5) { koExact++; knockoutPts += 5 }
      if (pts === 3) { koCorrect++; knockoutPts += 3 }
    })

    // Champion bonus
    const myChampPred = championPredictions.find(c => c.participant_id === p.id)
    const champBonus  = calcChampionPoints(championResult, myChampPred)

    const total = groupMatchPts + classifPts + knockoutPts + champBonus.total

    return {
      ...p, exact, correct, groupMatchPts, classifPts,
      koExact, koCorrect, knockoutPts,
      champBonus: champBonus.total, total,
      breakdown: { groupMatchPts, classifPts, knockoutPts, champBonus: champBonus.total }
    }
  }).sort((a, b) => b.total - a.total || b.exact - a.exact || b.koExact - a.koExact)
}
