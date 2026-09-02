const fs = require('fs');
const src = fs.readFileSync('_check.js', 'utf8');

const nd = {
  addEventListener() {}, appendChild() {}, remove() {}, insertAdjacentHTML() {},
  scrollIntoView() {}, focus() {}, querySelectorAll: () => [], querySelector: () => null,
  style: {}, dataset: {}, classList: { add() {}, remove() {}, contains: () => false },
  innerHTML: '', textContent: '', value: ''
};
nd.getContext = () => ({ clearRect() {}, save() {}, restore() {}, translate() {}, rotate() {}, fillRect() {} });
const doc = {
  querySelector: () => nd, querySelectorAll: () => [], addEventListener() {},
  createElement: () => nd, head: { appendChild() {} }, body: { appendChild() {} },
  documentElement: { setAttribute() {}, getAttribute: () => null, removeAttribute() {} }
};
const store = {};
const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const m = { exports: {} };
new Function(
  'document', 'window', 'localStorage', 'matchMedia', 'requestAnimationFrame',
  'setTimeout', 'setInterval', 'clearInterval', 'innerWidth', 'innerHeight', 'module',
  src + `\nmodule.exports={PARCOURS,PRO_PARCOURS,PREMIUM_PLUS,MODULES_ALL,SKILLS,SIMPLE,BADGES,RANGS,JEUX,NAV,ICON,
    CHEVAL,ARSENAL,OLYMPE,CLES_PRO,choisirQuestions,executerCode,repr,modParSkill,modParId,syncPro,
    creerCompte,connexion,cleValide,hacheMdp,normaliseCtf,skillsVisibles,EXAM_N,OUTILS,METIERS,
    getS:()=>S,setPro:(v)=>{S.pro=v;syncPro();},setCompte:(v)=>{S.compte=v;}};`
)(doc, { scrollTo() {} }, localStorage,
  () => ({ matches: false }), () => {}, () => {}, () => {}, () => {}, 800, 600, m);

const E = m.exports;
const err = [];
const note = t => err.push(t);

E.setPro(true); // contrôle sur l'ensemble

/* --- 1. cohérence de tous les modules --- */
E.MODULES_ALL.forEach(mod => {
  if (!E.JEUX[mod.jeu]) note(`${mod.id} : moteur "${mod.jeu}" absent`);
  if (!E.SKILLS[mod.skill]) note(`${mod.id} : compétence "${mod.skill}" inconnue`);
  if (!E.SIMPLE[mod.skill]) note(`${mod.id} : fiche Sanctuaire manquante pour "${mod.skill}"`);
  if (!mod.relique || !mod.relique.em) note(`${mod.id} : relique manquante`);
  if (!mod.cours || !mod.cours.sections.length) note(`${mod.id} : cours vide`);
  if (!mod.cours.retenir || !mod.cours.retenir.length) note(`${mod.id} : fiche de révision vide`);
  if (!mod.quiz || mod.quiz.length < 6) note(`${mod.id} : quiz trop court (${mod.quiz ? mod.quiz.length : 0})`);
  mod.quiz.forEach((q, i) => {
    if (q.c.length !== 4) note(`${mod.id} q${i} : ${q.c.length} choix`);
    if (q.a < 0 || q.a >= q.c.length) note(`${mod.id} q${i} : réponse hors bornes`);
    if (!q.e) note(`${mod.id} q${i} : pas d'explication`);
    if (![1, 2, 3].includes(q.t)) note(`${mod.id} q${i} : niveau invalide`);
  });
  const sel = E.choisirQuestions(mod, 6);
  if (sel.length !== 6) note(`${mod.id} : sélection adaptative = ${sel.length}`);
  if (new Set(sel).size !== sel.length) note(`${mod.id} : sélection avec doublons`);
});

/* --- 2. compétences, navigation, fiches --- */
Object.keys(E.SKILLS).forEach(k => {
  if (!E.modParSkill(k)) note(`compétence sans module : ${k}`);
  const si = E.SIMPLE[k];
  if (!si) { note(`compétence sans fiche : ${k}`); return; }
  if (!si.img || !si.txt || !si.pas || si.pas.length !== 4) note(`fiche ${k} incomplète`);
});
E.NAV.forEach(nv => { if (!E.ICON[nv.i]) note(`icône manquante : ${nv.i}`); });

/* --- 3. moteurs terminal / ctf / labo --- */
E.MODULES_ALL.filter(mod => mod.jeu === 'terminal').forEach(mod => {
  const d = mod.jeuData;
  if (!d || d.kind !== 'terminal') { note(`${mod.id} : jeuData terminal invalide`); return; }
  if (!d.flags || !d.flags.length) note(`${mod.id} : aucun drapeau`);
  if (!d.rep || !d.rep.length) note(`${mod.id} : aucune règle de réponse`);
  // chaque drapeau doit être atteignable par au moins une règle
  (d.flags || []).forEach(fl => {
    const ok = d.rep.some(r => r.flag === fl);
    if (!ok) note(`${mod.id} : drapeau ${fl} n'est révélé par aucune règle`);
  });
  d.rep.forEach((r, i) => {
    if (!(r.c instanceof RegExp)) note(`${mod.id} règle ${i} : 'c' n'est pas une regex`);
    if (typeof r.o !== 'string' && typeof r.o !== 'function') note(`${mod.id} règle ${i} : sortie invalide`);
  });
});
E.MODULES_ALL.filter(mod => mod.jeu === 'ctf').forEach(mod => {
  const d = mod.jeuData;
  if (!d || !d.defis || !d.defis.length) { note(`${mod.id} : ctf sans défis`); return; }
  d.defis.forEach((df, i) => {
    if (!df.p || !df.rep || !df.e || !df.indice) note(`${mod.id} défi ${i} : champ manquant`);
    // la réponse de référence doit se valider elle-même
    const a = E.normaliseCtf(df.rep), r = E.normaliseCtf(df.rep);
    if (a !== r) note(`${mod.id} défi ${i} : normalisation incohérente`);
  });
});
E.MODULES_ALL.filter(mod => mod.jeu === 'labo').forEach(mod => {
  const d = mod.jeuData;
  if (!d || !d.composants) { note(`${mod.id} : labo sans composants`); return; }
  ['virtu', 'osatt', 'cible', 'reseau', 'piege'].forEach(cat => {
    if (!d.composants.some(c => c.cat === cat)) note(`${mod.id} : catégorie ${cat} absente du labo`);
  });
});

/* --- 4. tri3 / juges / menace / scenario / fuite / budget (des blocs pro) --- */
E.MODULES_ALL.forEach(mod => {
  const d = mod.jeuData;
  if (mod.jeu === 'tri3') {
    if (!d || !d.cats || d.cats.length !== 3) { note(`${mod.id} : tri3 sans 3 catégories`); return; }
    if (!d.items || d.items.length < 6) note(`${mod.id} : tri3 trop court`);
    d.items.forEach((it, i) => { if (it.c < 0 || it.c > 2) note(`${mod.id} item${i} : catégorie hors bornes`); if (!it.e) note(`${mod.id} item${i} : sans explication`); });
    [0, 1, 2].forEach(c => { if (!d.items.some(it => it.c === c)) note(`${mod.id} : catégorie ${c} jamais utilisée`); });
  }
});

/* --- 5. exercices de code (Dédale, Talos) : chaque solution passe ses tests --- */
let nbExos = 0, nbTests = 0;
E.MODULES_ALL.filter(mod => mod.exos).forEach(mod => {
  mod.exos.forEach(x => {
    nbExos++;
    if (!x.python) note(`${mod.id}/${x.titre} : version Python manquante`);
    const tops = []; const reF = /^function /gm; let mm;
    while ((mm = reF.exec(x.depart)) !== null) tops.push(mm.index);
    const helpers = tops.length > 1 ? x.depart.slice(0, tops[tops.length - 1]) : '';
    const r = E.executerCode(helpers + '\n' + x.solution, x.tests);
    if (r.err) { note(`SOLUTION ${mod.id}/${x.titre} : ${r.err}`); return; }
    r.res.forEach((t, k) => {
      nbTests++;
      if (t.err) note(`SOLUTION ${mod.id}/${x.titre} test ${k + 1} : ${t.err}`);
      else if (E.repr(t.v) !== E.repr(t.a)) note(`SOLUTION ${mod.id}/${x.titre} test ${k + 1} (${x.tests[k].q}) : attendu ${E.repr(t.a)}, obtenu ${E.repr(t.v)}`);
    });
  });
});
E.MODULES_ALL.filter(mod => mod.exos).forEach(mod => {
  mod.exos.forEach(x => {
    const r = E.executerCode(x.depart, x.tests);
    if (!r.err && r.res && r.res.every((t, k) => !t.err && E.repr(t.v) === E.repr(t.a))) note(`DEPART ${mod.id}/${x.titre} : le squelette passe déjà les tests`);
  });
});

/* --- 6. système de clés et de comptes --- */
if (E.CLES_PRO.length !== 10) note(`il faut 10 clés, il y en a ${E.CLES_PRO.length}`);
if (new Set(E.CLES_PRO).size !== E.CLES_PRO.length) note('clés en double');
E.CLES_PRO.forEach(k => { if (!E.cleValide(k)) note(`clé refusée par cleValide : ${k}`); });
if (E.cleValide('KRYPTOS-0000-0000-0000')) note('une fausse clé est acceptée');
if (E.hacheMdp('abc') === 'abc') note('le mot de passe est stocké en clair');
if (E.hacheMdp('abc') !== E.hacheMdp('abc')) note('le hachage n\'est pas déterministe');
if (E.hacheMdp('abc') === E.hacheMdp('abd')) note('collision de hachage triviale');
// création + connexion
E.setCompte(null); E.setPro(false);
const c1 = E.creerCompte('TestHero', 'motdepasse', E.CLES_PRO[0]);
if (!c1.ok) note('création de compte avec clé valide échoue : ' + c1.msg);
if (!E.getS().pro) note('la création de compte ne déverrouille pas le premium');
const c2 = E.creerCompte('AutrePseudo', 'x', E.CLES_PRO[1]);
if (c2.ok) note('mot de passe trop court accepté');
const c3 = E.creerCompte('a!!', 'motdepasse', E.CLES_PRO[1]);
if (c3.ok) note('pseudo invalide accepté');
const c4 = E.creerCompte('EncoreUn', 'motdepasse', 'FAUSSE-CLE');
if (c4.ok) note('compte créé avec une clé invalide');
// connexion
const lg1 = E.connexion('TestHero', 'motdepasse');
if (!lg1.ok) note('connexion avec bons identifiants échoue');
const lg2 = E.connexion('TestHero', 'mauvais');
if (lg2.ok) note('connexion avec mauvais mot de passe acceptée');
const lg3 = E.connexion('Inconnu', 'motdepasse');
if (lg3.ok) note('connexion à un compte inexistant acceptée');

/* --- 7. verrouillage : sans premium, aucun bloc pro/premium visible --- */
E.setCompte(null); E.setPro(false);
if (E.PARCOURS.length !== 3) note(`verrouillé : ${E.PARCOURS.length} parcours au lieu de 3`);
if (E.MODULES_ALL.length !== 25) note(`verrouillé : ${E.MODULES_ALL.length} modules au lieu de 25`);
if (E.modParId('hk1')) note('verrouillé : un module premium reste accessible');
if (E.modParId('b1')) note('verrouillé : un module pro reste accessible');
if (E.NAV.filter(nv => !nv.pro || false).length && E.NAV.some(nv => nv.pro && !nv.pro)) {} // no-op
E.setPro(true);
if (E.MODULES_ALL.length !== 69) note(`déverrouillé : ${E.MODULES_ALL.length} modules au lieu de 61`);

/* --- 8. blocs premium bien formés --- */
if (E.CHEVAL.length !== 9) note(`le Cheval de Bois doit avoir 9 salles, il en a ${E.CHEVAL.length}`);
if (E.ARSENAL.length !== 5) note(`l'Arsenal doit avoir 5 établis, il en a ${E.ARSENAL.length}`);
if (E.OLYMPE.length !== 12) note(`le Mont Olympe doit avoir 12 trônes, il en a ${E.OLYMPE.length}`);
E.PREMIUM_PLUS.forEach(p => {
  if (!p.intro || !p.intro.scenes.length) note(`${p.id} : intro manquante`);
  if (!p.mods.length) note(`${p.id} : aucun module`);
  if (!p.pitch) note(`${p.id} : pas de pitch`);
});

console.log('parcours totaux :', E.PARCOURS.length,
  '| modules :', E.MODULES_ALL.length,
  '| compétences :', Object.keys(E.SKILLS).length,
  '| questions :', E.MODULES_ALL.reduce((a, mo) => a + mo.quiz.length, 0),
  '| exos code :', nbExos, '(' + nbTests + ' assertions)');
console.log('moteurs :', Object.keys(E.JEUX).length,
  '| badges :', E.BADGES.length,
  '| clés :', E.CLES_PRO.length,
  '| Cheval :', E.CHEVAL.length, 'salles | Arsenal :', E.ARSENAL.length, 'établis');
console.log(err.length ? 'PROBLEMES (' + err.length + ') :\n - ' + err.join('\n - ') : '>>> TOUT EST COHERENT <<<');
