window.RIVALS_TPL={"layout":{"paper_bgcolor":"rgba(0,0,0,0)","plot_bgcolor":"rgba(0,0,0,0)","font":{"family":"Inter, system-ui, 'Segoe UI', Arial, sans-serif","color":"#cccccc","size":12},"colorway":["#7CC4FF","#FF8FB1","#7CE7B0","#ffd166","#b07cff"],"hoverlabel":{"bgcolor":"#1e1e1e","bordercolor":"#414141","font":{"family":"Inter, system-ui, 'Segoe UI', Arial, sans-serif","color":"#e9e9e9","size":12}},"xaxis":{"gridcolor":"#2f2f2f","zerolinecolor":"#414141","linecolor":"#2f2f2f","tickcolor":"#2f2f2f"},"yaxis":{"gridcolor":"#2f2f2f","zerolinecolor":"#414141","linecolor":"#2f2f2f","tickcolor":"#2f2f2f"},"polar":{"bgcolor":"rgba(0,0,0,0)","radialaxis":{"gridcolor":"#414141","linecolor":"#2f2f2f"},"angularaxis":{"gridcolor":"#414141","linecolor":"#2f2f2f"}},"colorscale":{"diverging":[[0,"#FF8FB1"],[0.5,"#afafaf"],[1,"#7CE7B0"]],"sequential":[[0,"#1b1b1b"],[0.4,"#b07cff"],[0.7,"#FF8FB1"],[1,"#ffd166"]],"sequentialminus":[[0,"#ffd166"],[0.3,"#FF8FB1"],[0.6,"#b07cff"],[1,"#1b1b1b"]]},"modebar":{"bgcolor":"rgba(0,0,0,0)","color":"#929292","activecolor":"#e9e9e9"}}};window.RIVALS_TOK={"good":"#7CE7B0","gold":"#ffd166","vanguard":"#7CC4FF","duelist":"#FF8FB1","borderhi":"#414141","muted":"#afafaf"};
// Number the # column by each row's POSITION IN THE CURRENT ORDER -- hidden rows included, so a
// filtered row keeps the rank it has in the table it belongs to.
//
// This used to renumber over the VISIBLE rows only (1..k), which is correct for a
// sort and false for a filter: a sort changes the order, a filter does not. Driven on the shipped
// build, typing the LAST row of black_cat's Lift-descending synergy table -- Spider-Man, built rank
// 37 of 37, -15.6 -- printed it as `#1`, directly under a lead sentence naming a different #1 and
// under a header still reading LIFT ▼. The only column that publishes the section's ranking became
// a match counter, with no cue that the numbering had changed. Reachable on all 54 synergy panels
// and on every other numbered table with a filter box.
//
// Numbering by position is ALSO what every sentence on the site already promises: "the # renumbers
// to the new order" (career totals, more statistics, style match, hero standings, power ranking,
// season.js's two twins). A sort re-appends the rows, so position IS the new order and those
// sentences stay true; a filter leaves the order alone, so the numbers stand still.
function numpos(tbl){var rs=tbl.tBodies[0].rows;
  for(var i=0;i<rs.length;i++){
    var c=rs[i].querySelector('.pos');if(c)c.textContent=i+1;}}
// §4 Leaderboard filter: type-to-narrow every table inside data-target (both pre-rendered
// QM/comp lenses at once, so switching lens keeps the filter). Case-insensitive substring
// over the row's full text (hero AND player names match) UNLESS the input declares
// data-filtercols; the count label reports only the currently VISIBLE lens's rows. A row must
// clear BOTH the text query AND the active crown-state chip (stateHit) -- the chip is stamped
// on the container's data-state by filterState.
// data-filtercols (2026-07-30, Heroes decisions items 26/96): a comma-separated list of 0-based
// CELL INDICES the text query is matched against, instead of the whole row. It exists because the
// hero-record tables (Teammate hero synergy, Opposing-hero matchups, Squad matchups) label their
// box "Filter by <opposing|teammate|enemy> hero" while the row-wide haystack also matched Games,
// Win %, Expected and vs expected: on angela's rebuilt matchups table, typing '5' showed 52 of 54
// rows and NOT ONE of them had a '5' in the hero name, and '+' showed 25 rows that matched only in
// the two columns the 2026-07-29 re-base added. Absent -> the row's whole text, so every other
// caller is byte-identical. ROUND 10, S10-4: this paragraph named four inputs as row-wide and said
// "the record tables ship no filter input". Both are now false. The 2026-08-02 ruling scoped all
// four, so ZERO of the page's filterTable inputs are row-wide; and the record tables ship the
// LARGEST filter population on the site -- 54 <slug>-mates-filter plus 55 <slug>-foes-filter. What
// round 3 actually established is that no record-table input is MISSING a scope, which is the
// opposite of what the sentence came to say.
// Text inside a `[data-nofilter]` subtree is DECORATION, not part of what the cell names, and a
// search must not match it (2026-08-02). The case that forced it: the leaderboard's "Best
// in group" cell is a player link plus a `<small>` reading "held since S6.5", so scoping the box to
// that column -- which is what its "by hero or player" label promises -- still let '5' select 35 of
// 108 rows on a season stamp that is neither a hero nor a player. `data-filtercols` works at CELL
// granularity and cannot reach inside one, so the exclusion is marked where the decoration is.
//
// FAST PATH FIRST: this runs for every row of every table in the container on every keystroke, so a
// cell with nothing marked takes `textContent` exactly as before and never enters the walk.
function _cellHay(el) {
  if (el.nodeType === 1 && el.getAttribute('data-nofilter') !== null) return "";
  var s = "";
  for (var n = el.firstChild; n; n = n.nextSibling) {
    if (n.nodeType === 3) s += n.nodeValue;
    else if (n.nodeType === 1) s += _cellHay(n);
  }
  return s;
}
function _filterHay(row, cix) {
  var s = "";
  for (var j = 0; j < cix.length; j++) {
    var c = row.cells[cix[j]]; if (!c) continue;
    s += " " + (c.querySelector && c.querySelector('[data-nofilter]') ? _cellHay(c) : c.textContent);
  }
  return s;
}
function stateHit(row,st){
  if(!st)return true;                 // no chip active
  var rs=row.getAttribute('data-state');
  if(!rs)return true;                 // rows with no state (e.g. Teammates) ignore state chips
  if(st==='locked')return rs==='locked'||rs==='solo';   // a lone qualifier is a locked-down crown
  return rs===st;
}
// Role-chip predicate (Leaderboard role filter) — stateHit's twin over data-role; rows without a
// role (every non-Leaderboard table) ignore role chips, so the shared filterTable stays universal.
function roleHit(row,ro){
  if(!ro)return true;
  var rr=row.getAttribute('data-role');
  return !rr||rr===ro;
}
// Census-pill predicate (crown filter): rows stamp data-winner (PRESENT-but-empty on Unclaimed,
// so those hide under an active pill); attribute-less rows (other axes) ignore it. Strict null
// check — '' must NOT fall through like a missing attribute does.
function winnerHit(row,wn){
  if(!wn)return true;
  var rw=row.getAttribute('data-winner');
  if(rw===null)return true;
  return rw===wn;
}
// New-chip predicate (Leaderboard 'crown changed hands this season'): rows stamp data-new='true'
// ONLY when they qualify (mirroring the 'held since'/'' split — absence reads as 'not new').
function newHit(row,nw){
  if(!nw)return true;
  return row.getAttribute('data-new')==='true';
}
// Open/close a <details> ON THE FILTER'S BEHALF, marked so the reader-toggle listener at the bottom
// of this file can tell it apart from a click on the summary. `toggle` fires asynchronously, so the
// mark is a COUNTER held on the element until the event drains, not a flag cleared on the next line.
// Guarded on a real change: a no-op assignment fires no event and would leak a count -- but that
// is only ONE of the two leak routes. Chrome coalesces several state changes of one <details>
// inside a single turn into ONE toggle event (measured: open-then-close in one turn fires 1,
// exactly as a lone open does), so two _detSet calls in the SAME turn would strand a count too.
// The invariant that actually holds is one _detSet per drawer per turn, which is what filterTable
// does today; a future caller that toggles a drawer twice in one turn breaks the counter silently.
function _detSet(det,want){
  if(det.open===want)return;
  det._fprog=(det._fprog||0)+1;
  det.open=want;
}
function filterTable(inp){
  var d=document.getElementById(inp.getAttribute('data-target')); if(!d)return;
  var q=inp.value.trim().toLowerCase();
  var st=d.getAttribute('data-state')||'';    // crown-state chip (Leaderboard only; '' elsewhere)
  var ro=d.getAttribute('data-rolefilter')||''; // role chip (Leaderboard only; '' elsewhere)
  var wn=d.getAttribute('data-winnerfilter')||''; // census-pill crown filter (Leaderboard only)
  var nw=d.getAttribute('data-newfilter')||'';  // 'New' recency chip (Leaderboard only; '' elsewhere)
  // Declared text columns (see _filterHay); empty list = the row's whole text, the old behaviour.
  var cix=[],_fc=inp.getAttribute('data-filtercols');
  if(_fc){var _p=_fc.split(',');for(var _i=0;_i<_p.length;_i++){var _n=parseInt(_p[_i],10);
    if(!isNaN(_n))cix.push(_n);}}
  // an active filter lifts the mobile top-20 clip (CSS keys on this class) so every match shows
  d.classList.toggle('filtering',!!q||!!st||!!ro||!!wn||!!nw);
  var tbls=d.querySelectorAll('table');
  var shown=0,total=0;
  for(var t=0;t<tbls.length;t++){
    var vis=tbls[t].offsetParent!==null,rs=tbls[t].tBodies[0].rows;
    // A TABLE may override the input's column list. The scope attribute lived only
    // on the input, so one list was applied to every table in the wrap -- and the synergy wrap holds
    // two tables with DIFFERENT shapes: the ranked one is numbered (hero at index 1), the untested
    // drawer is not (hero at index 0, index 1 is Games). So typing an ally who sits in the drawer
    // searched the drawer's GAMES column and matched nothing, on 26 of 26 panels. Absent attribute
    // = the input's list, so every other filter on the site is byte-identical.
    var tcix=cix,_tfc=tbls[t].getAttribute('data-filtercols');
    if(_tfc!==null){tcix=[];var _tp=_tfc.split(',');
      for(var _j=0;_j<_tp.length;_j++){var _tn=parseInt(_tp[_j],10);if(!isNaN(_tn))tcix.push(_tn);}}
    for(var i=0;i<rs.length;i++){
      var hay=tcix.length?_filterHay(rs[i],tcix):rs[i].textContent;
      var hit=(!q||hay.toLowerCase().indexOf(q)>=0)
              &&stateHit(rs[i],st)&&roleHit(rs[i],ro)&&winnerHit(rs[i],wn)&&newHit(rs[i],nw);
      rs[i].style.display=hit?'':'none';
      if(vis){total++;if(hit)shown++;}
    }
    numpos(tbls[t]);
    var _anyHit=false,_rs2=tbls[t].tBodies[0].rows;
    for(var _k=0;_k<_rs2.length;_k++)if(_rs2[_k].style.display!=='none'){_anyHit=true;break;}
    // A HEADER BAND WITH NO ROWS UNDER IT READS AS A RENDERING FAILURE, and the
    // wrap-level empty note below cannot cover it: `shown` is summed over EVERY table in the wrap,
    // so a query that matches the ranked synergy table leaves the untested-pairings drawer as a
    // bare three-column header band with the note suppressed. Measured 2026-08-02: 26 of 26 drawer
    // panels, at 390 and at 1440. The note stays as the wrap-level explanation of a wholly empty
    // result; hiding the <thead> is what removes the band, per table, wherever it happens --
    // including the ranked table's own five-column band, which round 10 accepted as residue.
    // <thead> and not the table: `vis` above is read off the TABLE's offsetParent, and a display
    // toggle there would drop the next keystroke's rows out of the count.
    if(tbls[t].tHead)tbls[t].tHead.style.display=((q||st||ro||wn||nw)&&!_anyHit)?'none':'';
    // A MATCH INSIDE A SHUT DRAWER IS NOT A MATCH THE READER CAN SEE. Making the
    // untested-pairings drawer searchable does not make it findable: typing a drawer-only ally
    // leaves the ranked table empty, the count reading "1 of 52", the drawer still closed with its
    // summary unchanged -- and the zero-match note never fires, because `shown` is not 0. So the
    // reader meets a bare header band with no explanation and their match one click away behind a
    // summary that gives no hint it is there.
    //
    // So while a query is live the drawer TRACKS ITS OWN HITS in both
    // directions, and `data-fbase` records the state to put back rather than a one-way "we opened
    // it" stamp. A one-way version has two defects of its own: a drawer the READER had opened stays
    // open with nothing in it under a summary still claiming N untested pairings, and one
    // click on the summary leaves the stamp set, so the next keystroke yanks the drawer back open
    // under the reader. `data-fhold` is the reader taking ownership --
    // stamped by the toggle listener at the bottom of this file on any toggle we did not perform --
    // and it survives until the box is cleared, which is also when the put-back runs.
    // ...and the <details> has to be one INSIDE the wrap. `closest` walks out of it otherwise: the
    // ranked synergy table's nearest ancestor <details> is the section-level "More insights"
    // collapse, so a two-way rule applied to it shut the whole section the moment a query matched
    // only the drawer. (Driven on the built page before this line existed. The one-way version this
    // replaces was safe by accident -- it only ever OPENED, and only a drawer it had stamped.)
    var _det=tbls[t].closest?tbls[t].closest('details'):null;
    if(_det&&!d.contains(_det))_det=null;
    // A DRAWER'S SUMMARY IS A CONTROL LABEL, AND THE FILTER OWNS IT WHILE
    // A QUERY IS LIVE. The label is the only thing this drawer says about itself, it is built once
    // at render, and in every filtered state it stated a count the rows under it contradicted --
    // and, with the drawer shut, it was the one place the reader's own match could have been
    // announced and was not (that is S10-2's whole state: a match inside a closed <details> still
    // counts as `shown` because `offsetParent` cannot see it, so "1 of 52" ships over an empty
    // screen). Opt-in by `data-flabel` -- the noun phrase after the count -- so this reaches the
    // one drawer that has a summary describing its own rows and no other <details> on the site.
    if(_det){
      var _sm=_det.querySelector('summary[data-flabel]');
      if(_sm&&_sm.parentNode===_det){
        var _fl=_sm.getAttribute('data-flabel');
        if(q||st||ro||wn||nw){
          var _sn=0;for(var _s2=0;_s2<rs.length;_s2++)if(rs[_s2].style.display!=='none')_sn++;
          _sm.textContent=_sn+' of '+rs.length+' '+_fl;
        }else _sm.textContent=rs.length+' '+_fl;
      }
    }
    if(_det){
      if(q){
        if(_det.getAttribute('data-fhold')===null&&_det.open!==_anyHit){
          if(_det.getAttribute('data-fbase')===null)
            _det.setAttribute('data-fbase',_det.open?'open':'closed');
          _detSet(_det,_anyHit);
        }
      }else{
        var _b=_det.getAttribute('data-fbase');
        if(_b!==null)_detSet(_det,_b==='open');
        _det.removeAttribute('data-fbase');_det.removeAttribute('data-fhold');
      }
    }
  }
  // A PRESSED CONTROL THE READER CANNOT SEE IS A FILTER WITH NO OFF SWITCH.
  //
  // The census pills press/unpress in BOTH lens bands by data-winner, and the crown filter survives
  // a lens switch -- but only the top 6 pills per lens are on screen and the rest are folded behind
  // '+14 more' / '+13 more'. Nothing un-pressed a pill when it left the screen. DRIVEN, with no
  // drawer interaction at all: '#l' -> click the visible pill 'SpiritInBlack ×11' (board narrows to
  // 11) -> click Competitive. The board paints 2 rows under '2 of 54' while the search box is empty,
  // all 7 chips read aria-pressed='false' and all 6 visible comp pills read aria-pressed='false' --
  // the pill doing the filtering is 'SpiritInBlack ×2', inside the shut drawer. Playwright refuses
  // to click it: 'element is not visible'.
  //
  // So the drawer holding a pressed pill opens. Two things keep this from becoming round 11's
  // S10-3, where a filter-driven drawer got yanked open under a reader who had just shut it:
  //   * `data-fhold`, stamped by the toggle listener at the bottom of this file on any toggle we
  //     did not perform, which is the reader taking ownership -- and cleared here when the crown
  //     filter goes quiet, since that is the state it was protecting;
  //   * `offsetParent`, so the OTHER lens's drawer (display:none, and carrying the same pressed
  //     pill by data-winner) is left shut rather than opened where nobody is looking.
  //
  // ...AND IT IS PUT BACK, which round 11 built the mechanism for and did not use
  // here. This rule only ever OPENED. `data-fbase` -- the sibling drawer rule ~40 lines up records
  // and restores it -- was not consulted, so clearing every filter left the census band permanently
  // expanded: driven 2026-08-03 with no drawer interaction at all, band height 36 -> 171px at 1440
  // (+135) and 172 -> 455/504px at a real 390 (+283/+332), band tab stops 7 -> 20, against a fresh
  // load of the same URL at 36px and 7 stops. At 390 with the reader parked on the table that moves
  // the table's top from 178 to 637 of an 844px viewport -- 11 rows in view down to 2 -- and the
  // only route back was a '+13 more' summary now reading as a control that COLLAPSES a list it
  // never announced expanding. Same two-way shape as the sibling, for the same reason, including
  // `data-fhold`: a drawer the reader has taken ownership of is restored to the base state we
  // recorded before touching it, never to whatever we last set.
  var _cd=d.getElementsByClassName('lb-crown-more');
  for(var _c=0;_c<_cd.length;_c++){
    var _dd=_cd[_c];
    if(!wn){
      var _cb=_dd.getAttribute('data-fbase');
      if(_cb!==null)_detSet(_dd,_cb==='open');
      _dd.removeAttribute('data-fbase');_dd.removeAttribute('data-fhold');
      continue;
    }
    if(_dd.open||_dd.offsetParent===null||_dd.getAttribute('data-fhold')!==null)continue;
    if(_dd.querySelector("[aria-pressed='true']")){
      if(_dd.getAttribute('data-fbase')===null)
        _dd.setAttribute('data-fbase',_dd.open?'open':'closed');
      _detSet(_dd,true);
    }
  }
  var n=document.getElementById(inp.id+'-count');
  if(n)n.textContent=(q||st||ro||wn||nw)?shown+' of '+total:'';
  // Zero-match empty state: without it every row hides and a bare six-column header band floats
  // alone, reading as a rendering failure. One muted note above the first table; textContent-set
  // so the echoed query can't inject HTML. The message adapts to which filter emptied the table.
  //
  // ...AND, since round 11, the NON-zero case too, whenever a chip or a pill is what is
  // narrowing the board. The zero case was the only one this note covered, and `filterTable`'s own
  // comment said so ("a lens switch with an active pill is the common ZERO case") -- but the
  // non-zero one is the one that leaves no trace: 11 rows become 2, every visible control still
  // reads unpressed, and the only surviving signal is a 12px 'N of 54'. The drawer rule above puts
  // the pressed pill back on screen; this says in words what is being shown and that it can be
  // cleared, which is the part that survives the reader shutting the drawer again.
  // Gated on a CHIP/PILL being active, not on the text box: a typed query is already legible in the
  // box the reader typed it into, and every other filter on the site is text-only (st/ro/wn/nw are
  // Leaderboard attributes and read '' everywhere else), so no other axis gains a line.
  var es=document.getElementById(inp.id+'-empty');
  var _chip=!!(st||ro||wn||nw);
  if((q||_chip)&&(shown===0||_chip)){
    if(!es){es=document.createElement('p');es.id=inp.id+'-empty';es.className='sec-note';
      var anchor=d.querySelector('.tbl-scroll');
      if(anchor&&anchor.parentNode===d)d.insertBefore(es,anchor);
      else if(anchor&&anchor.parentNode&&anchor.parentNode.parentNode===d)d.insertBefore(es,anchor.parentNode);
      else d.appendChild(es);}
    // the chip half of the message names whichever filters are active ('contested Strategist
    // heroes SpiritInBlack holds') — a lens switch with an active pill is the common zero case
    var lbl=[nw?'new':'',st,ro].filter(Boolean).join(' ');
    var parts=(lbl?(lbl+' '):'')+'heroes'+(wn?(' '+wn+' holds'):'');
    // THE INSTRUCTION COUNTS THE FILTERS IT JUST NAMED. `parts` enumerates every
    // active one, and the zero branch then ended "clear THE FILTER" while its two siblings ended
    // "the filters" -- so the one sentence that tells the reader what to do said it in the singular
    // in exactly the states where two, three or four controls are pressed, and following it does
    // not empty the board. Enumerated rather than sampled (2026-08-03): of the 1,310 chip/pill
    // combinations reachable with no query, 823 reach a singular sentence and 822 of them name 2-4
    // filters (145 name 2, 412 name 3, 265 name 4). EXACTLY ONE names a single filter, which is the
    // case the wording was written for. All three branches now take the word from the count, so the
    // singular is right when it is right and the three sentences cannot disagree again.
    var _nf=(q?1:0)+(st?1:0)+(ro?1:0)+(wn?1:0)+(nw?1:0);
    var _clr=' — clear the '+(_nf>1?'filters':'filter')+' to see every row.';
    // ...AND IT DOES NOT BLAME THE LENS FOR AN EMPTINESS THE LENS CANNOT FIX. An Unclaimed row
    // carries data-winner='' , so winnerHit rejects it under EVERY crown pill in EVERY lens: the
    // board is empty by construction, and the note's "in this lens" invited the reader's obvious
    // next move -- switch lens -- which prints the identical sentence over an identically empty
    // board. Said where it is true instead, and the lens clause is kept for every other case,
    // where it IS the reason.
    var _struct=!!(st==='unclaimed'&&wn);
    if(shown===0)
      es.textContent=q?('No '+(lbl||wn?parts+' match':'rows match')+' “'+inp.value.trim()+'”'+_clr)
                    :('No '+parts+(_struct?' — an unclaimed hero has nobody holding it, so that '
                        +'pair is empty in both lenses':' in this lens')+_clr);
    else
      es.textContent='Showing '+shown+' of '+total+' '+parts
                     +(q?(' matching “'+inp.value.trim()+'”'):'')
                     +_clr;
    es.style.display='';
  }else if(es){es.style.display='none';}
  markTableOverflow();
}
// Crown-state chips (Contested / Locked / Unclaimed): toggle the container's data-state and re-run
// the shared filter against the live text box, so text + state compose. Clicking the active chip
// again clears back to all rows.
function filterState(btn){
  var d=document.getElementById(btn.getAttribute('data-target')); if(!d)return;
  var want=btn.getAttribute('data-state'),cur=d.getAttribute('data-state')||'';
  var next=(cur===want)?'':want;
  d.setAttribute('data-state',next);
  var chips=btn.parentNode.getElementsByClassName('lb-chip');
  for(var i=0;i<chips.length;i++){var on=chips[i].getAttribute('data-state')===next;
    chips[i].setAttribute('aria-pressed',on?'true':'false');chips[i].classList.toggle('on',on);}
  var f=d.querySelector('.tbl-filter input');
  if(f)filterTable(f);
}
// Census pills: filterState's twin over data-winnerfilter — click a name to narrow the table to
// the heroes they hold; click again to clear. Pills are (un)pressed across ALL lens bands (the
// filter persists through a lens switch, so the pressed state must too).
function filterWinner(btn){
  var d=document.getElementById(btn.getAttribute('data-target')); if(!d)return;
  var want=btn.getAttribute('data-winner'),cur=d.getAttribute('data-winnerfilter')||'';
  var next=(cur===want)?'':want;
  d.setAttribute('data-winnerfilter',next);
  var pills=d.getElementsByClassName('lb-crown');
  for(var i=0;i<pills.length;i++){var on=pills[i].getAttribute('data-winner')===next;
    pills[i].setAttribute('aria-pressed',on?'true':'false');pills[i].classList.toggle('on',on);}
  var f=d.querySelector('.tbl-filter input');
  if(f)filterTable(f);
}
// Role chips (Vanguards / Duelists / Strategists): filterState's twin over data-rolefilter. The
// two chip groups live in SEPARATE .lb-chips parents, so each toggle only (un)presses its own
// group — the predicates AND in filterTable, so 'Contested + Strategists' composes.
function filterRole(btn){
  var d=document.getElementById(btn.getAttribute('data-target')); if(!d)return;
  var want=btn.getAttribute('data-role'),cur=d.getAttribute('data-rolefilter')||'';
  var next=(cur===want)?'':want;
  d.setAttribute('data-rolefilter',next);
  var chips=btn.parentNode.getElementsByClassName('lb-chip');
  for(var i=0;i<chips.length;i++){var on=chips[i].getAttribute('data-role')===next;
    chips[i].setAttribute('aria-pressed',on?'true':'false');chips[i].classList.toggle('on',on);}
  var f=d.querySelector('.tbl-filter input');
  filterTable(f||_chipOnlyInput(d));
}
// A CHIP ROW WITH NO TEXT BOX BESIDE IT (the Players axis's Hero standings, owner ask 2026-09-23).
// filterTable reads exactly four things off its input -- data-target, data-filtercols, value and
// id -- so this stands in for the box that is not there: no query, the chips' own container as
// the target, and the container's id for the count / "Showing N of M" note hooks. The Leaderboard
// path is untouched: its container has a real box, which wins above.
function _chipOnlyInput(d){
  return {value:'',id:d.id,getAttribute:function(a){return a==='data-target'?d.id:null;}};
}
// 'New' recency chip (crowns that flipped this season): filterState/filterRole's twin over
// data-newfilter, its own .lb-chips parent (see the comment at new_chip's render site for why).
function filterNew(btn){
  var d=document.getElementById(btn.getAttribute('data-target')); if(!d)return;
  var want=btn.getAttribute('data-new'),cur=d.getAttribute('data-newfilter')||'';
  var next=(cur===want)?'':want;
  d.setAttribute('data-newfilter',next);
  var chips=btn.parentNode.getElementsByClassName('lb-chip');
  for(var i=0;i<chips.length;i++){var on=chips[i].getAttribute('data-new')===next;
    chips[i].setAttribute('aria-pressed',on?'true':'false');chips[i].classList.toggle('on',on);}
  var f=d.querySelector('.tbl-filter input');
  if(f)filterTable(f);
}
// THE LOAD ORDER IS THE TIE-BREAK.
//
// `Array.prototype.sort` is stable, so a tie used to keep whatever order the rows were in AT THAT
// MOMENT -- i.e. the order the reader's PREVIOUS click left them in. That makes a sort on a column
// a function of click history, and the server's own tie-break invisible.
//
// DRIVEN over all 89 win-rate tables at 1440 CSS px, 2026-08-02: load, click **Games**, then click
// **Adjusted**, which lands in the exact state the page declares at load (data-col='4'
// data-dir='desc', aria-sort='descending', the ▼ and the .sorted tint on Adjusted). 14 of the 89
// came back in a different order than they loaded in, and 2 published a different #1:
// `phoenix-comp-winrate` loaded aCatinaBox first and ended Unknown Melody first;
// `psylocke-comp-winrate` loaded ProjektEclipse and ended Alluris. Both pairs print the same value
// and ship the same key (`data-sort='38.1'` for both phoenix rows) while the server had ordered
// them on the full-precision rate plus a games tie-break. The `#` column renumbers to match, so
// the section's published ranking and the deep-linked player at the top of it depended on click
// history, with no visible cue -- the rows are pixel-identical in every printed column.
//
// The fix is not a finer key on one column: it is to make the fallback DETERMINISTIC everywhere.
// The DOM order at first sort IS the server's order, so it is captured once per table and used as
// the final comparison. Any sort now returns tied rows to the order they arrived in, on every
// table on the site -- the leaderboard (which tie-breaks on pool size), the MVP table (on games),
// the record tables -- not just the one that was measured. Zero markup, so no page-size cost.
// Stamped on the ROW, not held on the table, so a client-side REBUILD re-derives it. renderSeason
// replaces a hero panel's ranking/powerstats/morestats/career bodies wholesale; every row is then
// new and carries no stamp, so the freshly rendered (server-ordered) rows become the new load
// order. A table that merely gains a row (the Teammates drilldown injects tr.tm-detail, which this
// file filters out of the sort anyway) keeps its stamps and the newcomer sorts last among ties.
function _loadIx(tb){
  var rs=tb.rows,fresh=true;
  for(var i=0;i<rs.length;i++){if(rs[i]._srtIx!==undefined){fresh=false;break;}}
  if(fresh)for(var j=0;j<rs.length;j++)rs[j]._srtIx=j;
  return function(r){return r._srtIx===undefined?1e9:r._srtIx;};
}
function sortTable(id, col){
  var tbl=document.getElementById(id), tb=tbl.tBodies[0];
  var ix=_loadIx(tb);
  // injected drilldown detail rows (tr.tm-detail) are not data -- never drag them through a sort
  var rows=Array.prototype.slice.call(tb.rows).filter(function(r){return !r.classList.contains('tm-detail');});
  var cur=(tbl.getAttribute('data-col')==col)?tbl.getAttribute('data-dir'):null;
  var asc=(cur==='desc');               // first click on a column sorts descending
  rows.sort(function(a,b){
    var ax=a.cells[col].getAttribute('data-sort'), bx=b.cells[col].getAttribute('data-sort');
    if(ax===null)ax=a.cells[col].textContent; if(bx===null)bx=b.cells[col].textContent;
    var av=parseFloat(ax), bv=parseFloat(bx), r;
    if(!isNaN(av)||!isNaN(bv)){          // numeric column: non-numbers (blanks) sink to the bottom
      // early return bypasses the asc/desc negation so a blank sinks in BOTH directions --
      // an ascending win% sort must not float 100+ no-data em-dash rows above every real 0%
      if(isNaN(av))return 1; if(isNaN(bv))return -1; r=av-bv;
    }else{                               // text column: case-insensitive alphabetical
      ax=(''+ax).trim().toLowerCase(); bx=(''+bx).trim().toLowerCase();
      // '' data-sort = declared no-data (Unclaimed winners, dash runner-ups): sink in BOTH
      // directions, like the numeric NaN sink above — otherwise first-click-descending tops
      // the table with a wall of placeholder rows ('' would also collate before every letter)
      if(ax===''&&bx!=='')return 1; if(bx===''&&ax!=='')return -1;
      r=ax<bx?-1:(ax>bx?1:0);
    }
    // ...and the tie-break, OUTSIDE the direction flip: tied rows return to the order they loaded
    // in whichever way the column is sorted, exactly as the blank sinks above do. Negating it
    // instead would make an ascending sort reverse every tie group, which is a second order the
    // page has never published.
    if(r===0)return ix(a)-ix(b);
    return asc?r:-r;
  });
  rows.forEach(function(r){tb.appendChild(r);});
  numpos(tbl);                          // renumber the position column to the new order
  tbl.setAttribute('data-col',col); tbl.setAttribute('data-dir',asc?'asc':'desc');
  // tint the sorted column's cells (.sorted) so the active sort reads on phones, where the
  // header arrow can sit off-screen; mirrors the server-side default_sort load state
  for(var ri=0;ri<rows.length;ri++){var cs=rows[ri].cells;
    for(var ci=0;ci<cs.length;ci++)cs[ci].classList.toggle('sorted',ci===col);}
  var ths=tbl.tHead.rows[0].cells;
  // reset only the SORTABLE headers: the server deliberately leaves #/Player without aria-sort,
  // and stamping 'none' onto them advertises sortability on unfocusable cells
  for(var i=0;i<ths.length;i++){if(!ths[i].classList.contains('srt'))continue;
    var s=ths[i].querySelector('.ind'); if(s)s.textContent=''; ths[i].setAttribute('aria-sort','none');}
  var ind=ths[col].querySelector('.ind'); if(ind)ind.textContent=asc?' ▲':' ▼';
  ths[col].setAttribute('aria-sort',asc?'ascending':'descending');
}
// Right-edge fade shows only when a table overflows (and hides once scrolled to the end). Recomputed on
// load/resize/scroll and by callers that change which panel is visible (hidden tables report zero width).
function ovf1(w){if(w&&w.parentNode)w.parentNode.classList.toggle('ovf',(w.scrollWidth-w.clientWidth-w.scrollLeft)>1);
  if(w&&w.classList&&w.classList.contains('tbl-wrap')){_wrapKbd(w);_wrapSortCue(w);}}
// A SCROLLER A KEYBOARD READER CANNOT REACH. At 390 the Record-by-map table's
// headline column -- the gap, its ±, its colour and the section's declared sort key -- sits 153px
// past the right edge of `.tbl-wrap` on 54 of 54 panels. A pointer reader gets the .ovf fade and
// swipes. A keyboard reader gets nothing: Chrome only makes a scroll container focusable by itself
// when it has NO focusable descendants, and this one has 21, so tabbing runs straight past the
// table. Tabbing onto the column's OWN sort header does not bring it into view either -- measured
// 2026-08-02, a real Tab onto `vs pooled 46.3% ▼` left wrap.scrollLeft at 0 and fired no scroll
// event, while scrollIntoView({inline:'nearest'}) on the same header scrolls it to 154.
//
// tabindex=0 makes the box itself a tab stop, which is what a keyboard reader arrow-scrolls; the
// group role + label stop it announcing as an unnamed generic. Applied only WHILE it overflows,
// so the site does not grow a tab stop per table on a desktop where nothing is hidden -- the
// horizontal-overflow test is the box's own, not ovf1's fade test, which goes false at the far end
// of a scroll the reader has already made.
// THE COLUMN THE TABLE RANKS ON, BROUGHT INTO VIEW (side-list item 2, ruled 2026-08-04).
//
// THE DEFECT. A `.srt-table` declares its order with `data-col`, and the two cues that mark it --
// the ▼ glyph and the `.sorted` tint -- live in that column. On a phone that column is off the
// right edge: measured 2026-08-02, the sorted column is >=90% off-screen at 390 CSS px on 32 of 66
// default-sorted tables sampled across 8 hero panels, including EVERY `-ranking` table (Avg Rank
// ▼, 0% visible), every `-maps` table (10%) and all 89 win-rate tables. So the reader lands on a
// ranked table with both signs of what ranks it off-screen, and `report.css`'s own comment says
// those cues exist "so the active sort reads on phones".
//
// WHY SCROLL RATHER THAN LABEL. The alternative is a "Sorted by X ▼" line above each table, which
// is new markup on ~1,000 tables and states the ranking in words a second time (the section notes
// already do). Scrolling puts the actual NUMBERS that produce the order in front of the reader,
// and it costs no markup at all. Columns 1 and 2 are `position:sticky` (report.css: left 0 and
// 46px), so # and Player stay pinned and the reader never loses which row is which.
//
// MINIMAL, ONCE, AND NEVER OVER THE READER. It scrolls by the smallest amount that brings the
// column's right edge inside the box, not to the end -- on the win-rate tables that keeps Win %
// on screen beside the Adjusted rate it is judged against. `data-sortcue` stamps the column it has
// already handled, so it fires once per table per sort key and a reader who scrolls back to the
// left is not yanked right again. It declines outright if the reader has already scrolled
// (`scrollLeft > 0`), and it reads no geometry from a hidden panel (`clientWidth <= 0`), where
// every rect is zero and the answer would be garbage -- that arm is why it is safe to call from
// `ovf1`, which every panel toggle already funnels through.
function _wrapSortCue(w){
  // A hidden panel needs no arm of its own: a display:none wrap reports scrollWidth and
  // clientWidth BOTH 0 (measured 2026-08-04), so the overflow test below returns for it. An
  // earlier draft carried a `clientWidth <= 0` guard here and a comment calling it load-bearing;
  // the mutation replay showed deleting it changed nothing, which is what a branch that cannot
  // fail looks like.
  if(!w)return;
  if((w.scrollWidth-w.clientWidth)<=1)return;                // nothing is off-screen, or hidden
  var tb=w.querySelector('table.srt-table'); if(!tb)return;
  var col=tb.getAttribute('data-col'); if(col===null)return; // no declared sort
  if(tb.getAttribute('data-sortcue')===col)return;           // already handled for THIS column
  var th=tb.querySelector("thead th[data-col='"+col+"']"); if(!th)return;
  tb.setAttribute('data-sortcue',col);
  if(w.scrollLeft>0)return;                                  // the reader is driving; leave it
  var wr=w.getBoundingClientRect(),tr=th.getBoundingClientRect();
  // THE STICKY COLUMNS PAINT OVER THE LEFT OF THIS BOX (report.css: columns 1 and 2 are
  // position:sticky at left 0 and 46px, read 2026-08-04), so the room a column can occupy is the wrap
  // MINUS them. Measuring against the wrap's own left edge counts pixels the reader cannot see.
  var hs=tb.querySelectorAll('thead th'),stick=0,i,cs;
  for(i=0;i<hs.length&&i<2;i++){
    cs=getComputedStyle(hs[i]);
    if(cs.position==='sticky')stick=Math.max(stick,hs[i].getBoundingClientRect().right-wr.left);
  }
  var left=wr.left+stick,usable=wr.right-left,max=w.scrollWidth-w.clientWidth,target;
  // WHAT IS BEING BROUGHT INTO VIEW IS THE CUE, not the column box, and three drafts of this got
  // that wrong in three different ways before the geometry was measured rather than assumed.
  // Every figure in this block was measured 2026-08-04 on the shipped build at a real 390 CSS px:
  //
  //   1. scroll every sorted column's RIGHT edge in. Wrong for a column too wide to fit:
  //      `magneto-ladder`'s is 431px against 171px of usable width at 390, and scrolling it took
  //      the column from 39.7% visible to 0.7%, hiding its own header.
  //   2. never scroll a column that cannot fit. Wrong when such a column sits LAST, where it is
  //      entirely off screen at rest -- declining leaves the reader with nothing.
  //   3. align an oversized column to its own START. Wrong for half the tables: `.srt-table.num`
  //      RIGHT-aligns its headers (measured: the ▼ sits 321px into a 350px column), so the label
  //      and glyph are at the column's END there, while the ladder's left-aligned header puts them
  //      94px from its start.
  //
  // Only one thing is true across all of those: the reader needs the header's label and ▼ on
  // screen. So that element is the target when the column cannot fit, and the column itself is the
  // target only when it can fit whole (where showing it also shows the cue, wherever it sits).
  var ind=th.querySelector('.ind');
  if(tr.width<=usable){
    var over=tr.right-wr.right;
    if(over<=1)return;                                       // already fully visible
    // A small pad past the right edge, never more than the slack: padding a column that only just
    // fits would push its left side back under the sticky cells measured above.
    target=w.scrollLeft+over+Math.max(0,Math.min(12,usable-tr.width));
  }else{
    if(!ind)return;                                          // no cue to aim at; leave it alone
    var ir=ind.getBoundingClientRect();
    if(ir.right<=wr.right-1&&ir.left>=left-1)return;          // the cue is already on screen
    target=w.scrollLeft+(ir.right-wr.right)+8;
  }
  target=Math.max(0,Math.min(max,target));
  if(Math.abs(target-w.scrollLeft)<=1)return;
  // No post-clamp re-check of the cue: it lives inside the table, so a target clamped to `max`
  // cannot leave it off the right edge, and the replay confirmed such a check never fires.
  w.scrollLeft=target;
}
function _wrapKbd(w){
  var over=(w.scrollWidth-w.clientWidth)>1;
  if(over===(w.getAttribute('tabindex')==='0'))return;      // already in the right state
  if(over){
    var tb=w.querySelector('table'),lab=tb&&tb.getAttribute('aria-label');
    w.setAttribute('tabindex','0');w.setAttribute('role','group');
    w.setAttribute('aria-label',(lab?lab+' — ':'')+'scrollable table');
  }else{
    w.removeAttribute('tabindex');w.removeAttribute('role');w.removeAttribute('aria-label');
  }
}
// Vertical twin of ovf1, for the DESKTOP tab bars only: .tabbar is capped at 96px and wraps, so it
// overflows on Y with scrollWidth===clientWidth -- ovf1 can never light for it (§Heroes round-1 item
// 64, measured 2026-07-30: 3 Duelist tabs sat below the fold at every width >= 1280, 16 at 660, with
// no affordance but the scrollbar). Same shape as ovf1: drop the fade once the reader has scrolled
// to the end.
function ovfy1(w){if(w&&w.parentNode)w.parentNode.classList.toggle('ovfy',(w.scrollHeight-w.clientHeight-w.scrollTop)>1);}
function markTableOverflow(){
  var ws=document.getElementsByClassName('tbl-wrap');
  for(var i=0;i<ws.length;i++)ovf1(ws[i]);
  // same affordance for the mobile tab rows (their .tab-scroll shells carry the fade): at 390px
  // the hero tabbar holds ~3 viewports of tabs with no visual hint that it scrolls
  ws=document.getElementsByClassName('tabbar');
  for(i=0;i<ws.length;i++){ovf1(ws[i]);ovfy1(ws[i]);}
}
// Power-score radar is a desktop side-by-side polar+legend; on phones it would clip to a sliver, so
// restack the legend BELOW the polar (full-width domain) under 640px. Guarded per-graph so desktop only
// relayouts to its own (unchanged) values, and crossing the breakpoint is the only real reflow.
function fitRadar(gd){
  if(!gd||!window.Plotly)return;
  var m=(innerWidth<=640)?'m':'d';
  if(gd._rmode!==m){
    gd._rmode=m; gd._sfitKey=null;
    var p=Plotly.relayout(gd, m==='m'
      ? {'polar.domain.x':[0,1],'margin.l':80,'margin.r':80,'legend.orientation':'h','legend.x':0.5,'legend.xanchor':'center','legend.y':-0.12,'legend.yanchor':'top'}
      : {'polar.domain.x':[0,0.62],'margin.l':130,'margin.r':16,'legend.orientation':'v','legend.x':0.80,'legend.xanchor':'left','legend.y':0.5,'legend.yanchor':'middle'});
    if(m==='m'&&p&&p.then){p.then(function(){fitSpokes(gd,0);});return;}
  }
  if(m==='m')fitSpokes(gd,0);
}
// The spoke labels are drawn OUTSIDE the polar circle, in the side margins, and plotly's main-svg is
// overflow:hidden -- a label wider than the margin it sits in is silently CUT, with no ellipsis to
// say so. The desktop pair (130/16) was measured against the longest label on the roster; the phone
// pair (80/80 above) is a TEMPLATE number that was never measured against what gets drawn, and at a
// real 390 CSS px it cut a spoke on 18 of the 89 rendered radar views, over 11 heroes (COUNTED, not
// 11x2: four of those heroes render a radar in one mode only). The Punisher's read "Adjudication
// Critical Hit", dropping the "Rate" that makes it a percentage, while the scored-statistics table
// directly below it printed the name in full; Elsa Bloodstone's read "Piercer Accuracy" instead of
// "Monster-Piercer Accuracy" (48px of a 131px label gone).
//
// So measure what is actually drawn. Two knobs, and the measurements say exactly what each one buys:
//   * SHIFT (move pixels from one margin to the other, sum held fixed) slides every label 1:1 and
//     leaves the polar radius alone -- verified exactly linear across 4 heroes x 3 splits. The TOTAL
//     slack (left + right) is invariant under it, so a shift alone fixes any radar whose two sides
//     have >= 2*PAD of slack between them. Most do: the long label is on ONE side, and the other side
//     is holding "Deaths" in an 80px margin. The Punisher's circle comes out no smaller than before.
//   * GROW (widen both margins) is the only thing that helps when the total is short -- it shrinks the
//     polar, +2 of margin buying +1 of slack per side. Elsa Bloodstone is the only hero it costs real
//     radius (total slack -19px at 390): her circle gives up 14.5px (89 -> 74.5) so her spoke can say
//     what it means. Black Widow grows too, but only by the 2px the rounding below asks for (radius
//     89 -> 88).
// The outcome at a real 390 CSS px, re-swept over ALL 89 rendered radar views (49 Quick Match + 40
// Competitive -- NOT 49 doubled): 63 untouched (they already cleared 80/80), 24 shifted with the
// radius unchanged (86.5 or 89px, identical to what 80/80 draws), 2 grown, 0 still cut. Quick Match
// alone is 34/13/2; the two grown are Elsa Bloodstone (134/55, radius 89 -> 74.5) and Black Widow
// (107/55, radius 89 -> 88, a 2px grow the rounding below pays for). Both knobs are
// re-measured each pass rather than trusted, so a model error self-corrects; 3 passes, and an
// in-flight flag so the resize/scroll/panel-switch callers can't interleave two fits on one figure.
// LIMIT, measured: below ~360px the polar floor wins and the fitter cannot seat every label -- at
// 320 CSS px (svg 268px) the margins may not exceed 168px between them, so 10 labels on 3 heroes
// (5 views) stay cut by 0.02-8.03px rather than shrink the circle past SPOKE_PLOT_MIN -- re-measured
// 2026-08-01: elsa_bloodstone/qm -8.03 and -7.24, emma_frost qm+comp -4.86 and -4.56, the_punisher
// qm+comp -0.49 and -0.02. Every cut view's margins sum to exactly 168, i.e. the fitter is pinned
// at its floor, which is the mechanism this paragraph describes. From
// 360 to 1440 the sweep is 0 cut, with 3.5px the tightest clearance (Emma Frost's "Psychic Spear
// Sentience" at 360; +3.8px at 390) -- re-measured 2026-08-01. SPOKE_PAD is 4, so ~3.5px is the
// expected steady state and the 1.1px this once read never should have been.
// GIVING THE MARGINS BACK. The fitter only ever GROWS a margin, so a figure fitted narrow kept its
// narrow fit when the viewport WIDENED inside the phone regime: both sides then read clear, the
// early-out at the top of the loop fired, and the polar never reclaimed the radius it no longer had
// to pay (measured: Elsa Bloodstone 134/55 after 390->480, against 129/56 on a fresh 480 load --
// up to ~2px of radius unclaimed, and reachable on any resize/rotate now that the deferred passes
// re-enter the fitter). So a fit at a NEW width re-opens at the template pair first and measures
// from there, which makes every width land on the same margins a fresh load at that width would.
var SPOKE_PAD=4,        // clearance to leave between the longest label and the svg edge
    SPOKE_MIN=8,        // never collapse a margin entirely -- the polygon would touch the edge
    SPOKE_PLOT_MIN=100, // ...and never squeeze the polar below this, however long the label
    SPOKE_M0=80;        // the phone branch's opening margins -- keep IDENTICAL to fitRadar's pair
function _spokeSlack(gd){
  var svg=gd.querySelector('svg.main-svg'); if(!svg)return null;
  var sr=svg.getBoundingClientRect(); if(!sr.width)return null;
  var ts=gd.querySelectorAll('.angularaxistick text'); if(!ts.length)return null;
  var L=1e9,R=1e9,i,r,any=false;
  for(i=0;i<ts.length;i++){
    r=ts[i].getBoundingClientRect(); if(!r.width)continue;
    any=true; L=Math.min(L,r.left-sr.left); R=Math.min(R,sr.right-r.right);
  }
  return any?{L:L,R:R,w:sr.width}:null;
}
function fitSpokes(gd,pass){
  if(!gd||!window.Plotly||!gd.layout||!gd.layout.margin)return;
  if(!pass){
    if(gd._sfitBusy)return;
    var s0=_spokeSlack(gd); if(!s0)return;
    var key='m:'+Math.round(s0.w);
    if(gd._sfitKey===key)return;                 // already fitted at this svg width
    gd._sfitKey=key;
    // Re-open at the template pair so this width is fitted from the same start a fresh load uses
    // (see the SPOKE_M0 note above). Keyed by width, so a figure that cannot reach the pair does
    // not loop; the re-entry below then runs the normal 3-pass fit with the margins reset.
    var mg0=gd.layout.margin;
    if((mg0.l!==SPOKE_M0||mg0.r!==SPOKE_M0)&&gd._sfitReset!==key){
      gd._sfitReset=key;
      var p0=Plotly.relayout(gd,{'margin.l':SPOKE_M0,'margin.r':SPOKE_M0});
      if(p0&&p0.then){p0.then(function(){gd._sfitKey=null;fitSpokes(gd,0);});return;}
    }
  }
  var s=_spokeSlack(gd); if(!s){gd._sfitBusy=false;return;}
  if(s.L>=SPOKE_PAD&&s.R>=SPOKE_PAD){gd._sfitBusy=false;return;}   // both sides clear: nothing to do
  if(pass>=3){gd._sfitBusy=false;return;}
  var mg=gd.layout.margin,l=mg.l,r=mg.r;
  var grow=Math.max(0,Math.ceil(2*SPOKE_PAD-(s.L+s.R)));           // widen both margins by grow/2 each
  var room=Math.max(0,(s.w-SPOKE_PLOT_MIN)-(l+r));
  grow=Math.min(grow,room);
  var nl=l+grow/2,nr=r+grow/2,dl=s.L+grow/2,dr=s.R+grow/2;
  var shift=(dr-dl)/2;                                             // equalize the two sides 1:1
  nl=Math.round(Math.max(SPOKE_MIN,nl+shift));
  nr=Math.round(Math.max(SPOKE_MIN,nr-shift));
  if(Math.abs(nl-l)<1&&Math.abs(nr-r)<1){gd._sfitBusy=false;return;}
  gd._sfitBusy=true;
  var q=Plotly.relayout(gd,{'margin.l':nl,'margin.r':nr});
  if(q&&q.then)q.then(function(){fitSpokes(gd,(pass||0)+1);});
  else gd._sfitBusy=false;
}
// §4 draw-on-demand: every hero figure ships as an inert JSON spec + an empty .lazyfig div
// (report._fig_html); NOTHING draws at page-open except what is visible. drawFig draws one
// placeholder (and frees its spec tag); drawLazyIn sweeps the visible undrawn figures under a
// root. fitRadars sweeps the whole document first, so every reveal path that already fits radars
// (load, resize, hero/mode/panel switches) draws lazily with no extra wiring; the view/chart
// toggles call drawLazyIn on just the pane they reveal.
function drawFig(gd){
  if(!gd||!window.Plotly||gd.classList.contains('drawn'))return;
  // THE PAGE FONT FIRST (Inter, 2026-09-23). Plotly measures legend and label text when it lays a
  // figure out, so a figure drawn while the font is still loading keeps the fallback font's metrics
  // after the swap (Inter sets ~5% wider). Hold the draw; the sweep re-runs once the set settles.
  // ...BUT NEVER FOR LONG (2026-09-24, owner report of a blank Power-Score radar card): the hold
  // is released by fonts.ready OR by a 1.5s timer, whichever comes first, and a timer release
  // retires the hold for the rest of the visit -- a font that has not settled by then is not
  // worth a chart, and a promise that never resolved would otherwise strand every figure on the
  // page blank with nothing to say why.
  if(document.fonts&&document.fonts.status==='loading'&&!drawFig._late){
    if(!drawFig._held){drawFig._held=1;
      var go=function(){if(!drawFig._held)return;drawFig._held=0;fitRadars();};
      document.fonts.ready.then(go);
      setTimeout(function(){if(drawFig._held){drawFig._late=1;go();}},1500);}
    return;}
  var sp=document.getElementById(gd.id+'-spec');
  if(!sp)return;
  var spec;
  try{spec=JSON.parse(sp.textContent);}catch(e){return;}
  gd.classList.add('drawn');
  // a draw that throws is NOT a drawn figure: un-mark it so the next sweep tries again, instead
  // of a blank card that every later sweep skips as finished
  try{Plotly.newPlot(gd,spec.data,spec.layout,{displayModeBar:false,responsive:true});}
  catch(e){gd.classList.remove('drawn');console.error(e);return;}
  sp.parentNode.removeChild(sp);
  // Role-map dots deep-link to their hero's page (customdata[3] = slug, set by quadrant_fig).
  // Pointer-only sugar on top of the tab nav, so it binds only where the hero tabs exist (the
  // combined page); on the standalone one-hero page the lookup misses and nothing is bound.
  // The cursor flips to a pointer over a dot so the affordance is visible before the click.
  // PLOTLY'S OWN LEGEND IS A REDRAW PATH, AND IT WAS THE FIFTH.
  //
  // Round 11 wired the Draw-all control into three paths that redraw the radar and its verification
  // pass found a fourth (applyHeroMode). All four are functions on this page. The legend is not:
  // plotly restyles `visible` itself when a legend entry is clicked, and the caption beside the
  // chart tells the reader the two affordances are equivalent ("in the legend, clicking a dimmed
  // name does the same"). Measured in Chrome at 1440 on 2026-08-03 over ALL 25 wraps that carry the
  // control: one click on a dimmed entry drew the whole pool on 25 of 25 while the button still
  // read `Draw all N` -- so pressing it then REMOVED 26 polygons, and after an isolate click the
  // button read `Back to top 10` on a 1-polygon figure with no sequence of presses that restored
  // the default view.
  //
  // Subscribing to the restyle is what makes the control's derivation total: it already recomputes
  // label and presence from the drawn traces, and this is the one mutation of those traces that no
  // function here performs. `plotly_restyle` fires after plotly has applied the change, for a
  // legend click, a legend double-click and radarDrawAll's own restyle alike (the last is a
  // harmless second sync -- syncRadarAll is idempotent and reads only the figure).
  //
  // Keyed on the .radarwrap ANCESTOR, not on a substring of the div id: the wrap's id is what
  // syncRadarAll's prefix is derived from everywhere else on the page (fitRadars, season.js), and
  // an id test would also have to be right about which figures are radars.
  if(gd.on&&gd.closest){
    var _rwrap=gd.closest('.radarwrap');
    if(_rwrap&&_rwrap.id&&gd.closest('.radarpane')){
      gd.on('plotly_restyle',function(){
        if(window.syncRadarAll)syncRadarAll(_rwrap.id.replace(/radarwrap$/,''));});
    }
  }
  if(gd.id.indexOf('-scatter-')>0&&gd.on){
    gd.on('plotly_click',function(d){
      var pt=d&&d.points&&d.points[0],s=pt&&pt.customdata&&pt.customdata[3];
      var t=s&&document.getElementById('tab-'+s);if(t)t.click();});
    gd.on('plotly_hover',function(){var dr=gd.querySelector('.nsewdrag');if(dr)dr.style.cursor='pointer';});
    gd.on('plotly_unhover',function(){var dr=gd.querySelector('.nsewdrag');if(dr)dr.style.cursor='';});
  }
}
function drawLazyIn(root){
  if(!root)return;
  var els=root.querySelectorAll('.lazyfig:not(.drawn)');
  // One figure that throws must not cost the rest of the sweep their draw (2026-09-24): the loop
  // used to die at the first throw, leaving every later visible figure a blank card.
  for(var i=0;i<els.length;i++){if(els[i].offsetParent!==null){
    try{drawFig(els[i]);}catch(e){console.error(e);}}}
}
// Only the polar radars get the desktop/mobile reflow — scope to .radarpane so the sibling bar/scatter
// figures in the same .radarwrap card are never handed polar-only relayout keys.
function fitRadars(){drawLazyIn(document);
  var gs=document.querySelectorAll('.radarpane .js-plotly-plot');
  for(var i=0;i<gs.length;i++){if(gs[i].offsetParent!==null)fitRadar(gs[i]);}
  // The Draw-all control derives its label, pressed state and PRESENCE from the drawn
  // figure, so it has to be synced on the FIRST draw as well as on the chart toggle and the season
  // rebuild. Without this it ships hidden and only appears after a Role-map round trip -- which is
  // how the first version of the round-11 fix behaved when it was driven, before this line.
  if(window.syncRadarAll){
    var ws=document.querySelectorAll('.radarwrap');
    for(var j=0;j<ws.length;j++){if(ws[j].id)syncRadarAll(ws[j].id.replace(/radarwrap$/,''));}
  }}
// Delegated sort click/keydown (report review #size-1): every sortable <th class='srt'> now carries
// only data-col (no onclick/onkeydown) -- one document-level listener here walks up to the closest
// <table> (its id is sortTable's first arg) instead of repeating a ~200B inline handler pair on each
// sortable header across hero/player/leaderboard tables (4,848 of them at 2026-07-21, ~1MB). Covers
// headers built at load AND ones synthesized later by season.js/map.js (their th also carries only
// data-col now), since
// this is a single delegated binding rather than one attached per <th>.
function _srtTh(el){return el&&el.closest?el.closest('th.srt'):null;}
function _srtFire(th){
  var tbl=th.closest('table'); if(!tbl)return;
  var col=th.getAttribute('data-col'); if(col===null)return;
  sortTable(tbl.id,+col);
}
addEventListener('click',function(e){var th=_srtTh(e.target);if(th)_srtFire(th);});
addEventListener('keydown',function(e){
  if(e.key!=='Enter'&&e.key!==' ')return;
  var th=_srtTh(e.target);if(!th)return;
  e.preventDefault();_srtFire(th);
});
// One measure-and-fit pass, plus DEFERRED repeats. Plotly.Plots.resize is throttled (~100ms
// internally), so the pass a resize event triggers measures the figure at its PRE-resize width:
// fitSpokes reads its own width key, sees the width it already fitted, and returns -- and then the
// figure re-lays out at the new width carrying the margins fitted for the width we just left. No
// other listener re-fits (the scroll one only repaints overflow fades), so that stale fit SURVIVES,
// and the label the fitter exists to protect gets cut again: measured in Chrome at a real phone DPR,
// narrowing 480 -> 390 cut The Punisher's "Adjudication Critical Hit Rate" by 3.0px and Elsa
// Bloodstone's "Monster-Piercer Accuracy" by 0.4px; 430 -> 320 cut 17.5px. The late passes re-run
// once the new geometry has landed. fitSpokes is width-keyed and idempotent (tests/js/spokes.ts), so
// a late pass on a figure that is already fitted at its current width does nothing at all.
(function(){var _late=[];
  // `syncNewChip` rides this pass so the Leaderboard's recency chip is already correct on a FRESH
  // LOAD of `#l/comp`, not only after a lens click -- a router-arrived lens performs no click, and
  // that is the entry point a shared link uses. Guarded on existence: the function ships in the
  // combined page's inline block, and this file is also served to the standalone hero pages, which
  // have no leaderboard at all.
  function pass(){markTableOverflow();fitRadars();
    if(typeof syncNewChip==='function')syncNewChip();}
  function tick(){pass();
    for(var i=0;i<_late.length;i++)clearTimeout(_late[i]);
    _late=[setTimeout(pass,240),setTimeout(pass,800)];}
  function bind(){
  // Delegated capture-phase scroll: covers .tbl-wrap nodes injected after load (the Maps leaderboards,
  // rebuilt on every mode/role switch). scroll doesn't bubble, but a capturing window listener still sees
  // it, and e.target is the scrolled wrap -- so we refresh just that one, as cheaply as the old per-node bind.
  addEventListener('scroll',function(e){var t=e.target;if(!t||!t.classList)return;
    var isbar=t.classList.contains('tabbar');
    if(isbar||t.classList.contains('tbl-wrap'))ovf1(t);
    if(isbar)ovfy1(t);},{passive:true,capture:true});
  // Collapsible sections: a table revealed by
  // opening a closed <details> reports zero scrollWidth/clientWidth until measured, same as any
  // other newly-visible table elsewhere on the page -- recheck every .tbl-wrap on any toggle.
  // 'toggle' doesn't bubble (like scroll above), so this also needs the capturing listener.
  // ...and the same listener is where the READER takes ownership of a drawer the filter is
  // driving. A toggle we performed carries the _fprog mark _detSet left on the element;
  // anything else is a click (or Enter) on the summary, and while a query is live that has to stick:
  // without this, `data-fbase` still said "we opened it" after the reader shut it and the very next
  // keystroke re-opened the drawer under them. `.filtering` is the wrap's own live-query class, so a
  // toggle with no query active is left completely alone.
  addEventListener('toggle',function(e){
    var el=e.target; if(!el||el.tagName!=='DETAILS'){return;}
    if(el._fprog){el._fprog--;}
    else if(el.closest&&el.closest('.filtering')){
      el.setAttribute('data-fbase',el.open?'open':'closed');
      el.setAttribute('data-fhold','1');
    }
    markTableOverflow();},{capture:true});
  // BIND FIRST, RUN SECOND.
  // This read `tick();addEventListener('resize',tick);addEventListener('load',tick);`. `tick`
  // calls markTableOverflow + fitRadars, and fitRadars ends in the syncRadarAll sweep -- so ANY
  // throw inside the first pass took the two listeners with it and the page silently lost every
  // later re-fit: no restack when the viewport crossed 640px, and neither deferred pass scheduled.
  // That is how one missing global also cost the standalone pages their phone layout.
  // Binding before the first pass makes the listeners unconditional -- a first pass that fails is
  // then repaired by the next resize instead of being permanent.
  addEventListener('resize',tick);addEventListener('load',tick);tick();
  // ...and once more when the page font has settled: every width tick measures (table overflow,
  // radar fit) is a text width, and the first pass can run before Inter has swapped in.
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(tick);}
  if(document.readyState!=='loading')bind();else document.addEventListener('DOMContentLoaded',bind);})();

// The group-winner crown mark, as client-rebuilt HTML (tab crowns, player badges, season-rebuild
// cells). Python twin: _crown() in src/report.py — the two must paint the identical mark.
// aria-label='crown' keeps the winner encoding audible, matching the server-rendered cells.
// The geometry itself lives ONCE per page in report.icon_sprite()'s <symbol id='i-crown'>; both
// twins are now just a <use> of it, so they cannot drift on path data at all.
var _CROWN="<svg class='ic ic-crown' role='img' aria-label='crown'><use href='#i-crown'/></svg>";
// The CONTESTED-crown mark and its key. Python twins: report._CROWN_TIE
// and report._CROWN_TIE_KEY — the two must paint the identical mark, because season.js rebuilds the
// same Power Ranking cell from the season blob's `ct` flag and the reader can toggle between them.
var _CROWNTIE="<sup class='ctie' aria-hidden='true' title='Tied on average rank with the runner-up "
  +"&#8212; the order between them is the tie-break (total Power Score), not the ranking'>=</sup>";
var _CTIEKEY=" &mdash; the <b>=</b> beside the crown means this one was";
// The private-career-row floor mark. Python twin:
// report._CAREER_FLOOR_MARK and the <span> career_table wraps it in -- the two must paint the
// IDENTICAL mark, because season.js rebuilds the Career totals cell from the season blob's `pv`
// flag and a reader can toggle between the two renders with the season dropdown. The key for it
// lives in the Career note, which season.js does not rewrite, so it stays on screen either way.
// The primary-hero clause is SCOPED to the three columns `_career_rebased` rebases.
// Time, KOs, Deaths and Assists are segment-basis store totals on a private row, so the old
// unscoped "primary-hero games only" was false of four of the seven columns the mark rides beside.
// Verbatim twin of report.py's `mark` in career_table (modulo the entity escapes), and
// tests/test_career_private_primary_basis.py now compares the two titles.
var _CFLOOR=" <span class='bprov chelp' title='rebuilt from shared matches &#8212; Matches, Wins "
  +"and Win % count primary-hero games only, and every figure in the row is a floor rather than a "
  +"true total'>&#8225;</span>";
// The Power Ranking row's private-player mark (2026-09-23): the caveat's "rebuilt from the games we
// hold" sentence, moved onto the row when the caption went to one line. Verbatim twin of
// pagehero._PRIV_RANK_FLAG (modulo the entity escapes); tests/test_visual_refresh.py compares them.
var _PFLOOR=" <span class='bprov chelp' title='rebuilt from the games we hold &#8212; matches shared "
  +"with tracked players (private tracker.gg profile) &#8212; the rates scored here are computed over "
  +"those lobbies only, so they are a floor, not a full career read'>&#8225;</span>";
// The OTHER career-row mark (ruled 2026-08-21): this row is not on the board above, because its
// primary-hero total is under the mode's game floor. Verbatim twin of career_table's `unranked`
// arm, whose title is composed from rank.MIN_GAMES via pagehero._ranked_floor_phrase -- so the
// floor numbers below are a DUPLICATE of that constant and tests/test_career_below_floor.py
// compares the two rendered titles, the same guard _CFLOOR is held by. A word rather than a glyph
// (see report.css .nranked): it states the row's category instead of footnoting its provenance.
var _NRANKF={qm:'50 quick-match games are needed to rank',
             comp:'25 competitive games are needed to rank'};
function _nrank(src){return " <span class='nranked chelp' title='Not ranked on this hero: "
  +_NRANKF[src]+" on the primary-hero basis, which this row is under. Its games are kept here "
  +"because this table counts play, not skill.'>not ranked</span>";}
function setPressed(list,btn){
  // role='tab' buttons (the hero/player clouds) follow the ARIA tabs pattern: aria-selected +
  // roving tabindex (active 0, rest -1). Everything else (vbtn/mbtn/rbtn toggles) keeps aria-pressed.
  for(var i=0;i<list.length;i++){var el=list[i],on=el===btn;el.classList.toggle('active',on);
    if(el.getAttribute('role')==='tab'){el.setAttribute('aria-selected',on?'true':'false');
      el.setAttribute('tabindex',on?'0':'-1');}
    else el.setAttribute('aria-pressed',on?'true':'false');}
}
// Arrow-key navigation for any [role='tablist'] (ARIA tabs keyboard pattern): Left/Right (or
// Up/Down) move through the VISIBLE tabs — role- or mode-filtered tabs are display:none and skip —
// Home/End jump to the ends, and selection follows focus (each tab's own click shows its panel).
document.addEventListener('keydown',function(e){
  // MODIFIED keystrokes belong to the browser, not to this handler. It dispatched
  // on e.key alone and read no modifier anywhere, so with focus on a hero tab **Alt+ArrowLeft --
  // the browser's Back shortcut -- moved the tab instead**, pushed a hash, and reported
  // defaultPrevented=true. Two rounds went into making Back usable after a traversal (the run
  // coalescing below) while this handler ate the key readers press to use it. The ARIA tabs
  // pattern specifies UNMODIFIED arrows; anything else is a browser or AT binding and must pass
  // through untouched.
  if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
  var t=e.target;if(!t||!t.getAttribute||t.getAttribute('role')!=='tab'||!t.closest)return;
  var bar=t.closest("[role='tablist']");if(!bar)return;
  var all=bar.querySelectorAll("[role='tab']"),vis=[],i;
  for(i=0;i<all.length;i++)if(all[i].offsetParent!==null)vis.push(all[i]);
  var cur=vis.indexOf(t);if(cur<0)return;var nxt=-1,k=e.key;
  if(k==='ArrowRight'||k==='ArrowDown')nxt=(cur+1)%vis.length;
  else if(k==='ArrowLeft'||k==='ArrowUp')nxt=(cur-1+vis.length)%vis.length;
  else if(k==='Home')nxt=0;
  else if(k==='End')nxt=vis.length-1;
  if(nxt<0)return;
  // This used to be a bare `focus(); click();`, so every arrow keystroke ran the
  // full activation -- panel swap, 54 crowns repainted, scrollTo -- and each one PUSHED a history
  // entry. Measured: six ArrowRights took history.length 26 -> 32, exactly +1 per keystroke, and
  // walking the 27-tab Duelist bar end to end cost 26 entries, burying the reader's origin so Back
  // was useless. That contradicts the model `_nav` is built on ("one USER click = ONE history
  // entry", written to stop Back landing on phantom middle states) and it is the same class ledger
  // item 62 was actioned for over ONE spurious entry.
  // ARIA APG's "selection follows focus" assumes activation is cheap; here it is a panel swap. So
  // the traversal still activates -- the pattern is intact and the panel keeps up with the focus --
  // but the pushes are suppressed while it happens, and the destination is recorded once below.
  // window._navRestoring is the same flag routeHash uses; guarded with try/finally so a throw
  // inside the activation cannot leave the whole page unable to push.
  // The re-push is per tablist, because each one owns its own hash grammar (`#h-` via _hhash,
  // `#m-` via _mhash). SUPPRESSION IS ONLY APPLIED WHERE THE RE-PUSH IS KNOWN: a tablist this
  // does not recognise keeps its existing behaviour exactly, rather than losing its hash updates
  // to a suppression with no counterpart. (_hhash/_mhash/_navRestoring are window globals -- the
  // router script is top-level, which the inline `onclick="showView(...)"` handlers prove.)
  var id=vis[nxt].id||'',repush=null;
  if(id.lastIndexOf('tab-',0)===0&&typeof window._hhash==='function')
    repush=function(){window._hhash(id.slice(4));};
  else if(id.lastIndexOf('mtab-',0)===0&&typeof window._mhash==='function'
          &&typeof window._mapMode==='function')
    repush=function(){window._mhash(id.slice(5),window._mapMode());};
  e.preventDefault();
  if(!repush){vis[nxt].focus();vis[nxt].click();return;}
  var wasRestoring=window._navRestoring;
  window._navRestoring=true;
  try{vis[nxt].focus();vis[nxt].click();}
  finally{window._navRestoring=wasRestoring;}
  // One entry per RUN, not per keystroke. Round 7's version suppressed the push
  // and then re-pushed on every key, so a 26-key traversal still cost 26 entries — the shipped code
  // and the pre-fix code were indistinguishable in history cost. The first key of a run pushes; the
  // rest replace. popstate clears the run, so pressing Back mid-traversal does not let the next key
  // overwrite the entry Back just landed on.
  //
  // WHAT THE RUN BOUNDARY ACTUALLY IS, corrected in round 9. This said
  // "`location.hash===_tabRunHash` self-clears the run: any other navigation moves the hash". It
  // does not. The test is hash IDENTITY, not "did anything happen", and two measured cases break
  // it:
  //   * navigate away and back -- an arrow run ending at #h-deadpool_vanguard, then the Maps axis,
  //     then the Heroes axis. Two real navigations, two entries pushed, and the Heroes button
  //     restores the axis's remembered hero, so location.hash returns to the SAME value. The next
  //     arrow key measures 0P/1R: the run never cleared.
  //   * no navigation at all -- a key pressed an hour after a traversal ended still measures 0P/1R,
  //     because the run has no boundary in TIME. Two separate visits collapse into one entry where
  //     a mouse user would get two.
  // The reader harm is small in both (the clobbered entry is a hash-duplicate of one already on the
  // stack) which is why the behaviour is left alone -- but the sentence claimed a mechanism the code
  // does not have, and a future reader would have believed it.
  if(!wasRestoring){
    var run=(_tabRunHash!==null&&location.hash===_tabRunHash);
    window._navReplace=run;
    try{repush();}finally{window._navReplace=false;}
    _tabRunHash=location.hash;
  }
});
var _tabRunHash=null;
addEventListener('popstate',function(){_tabRunHash=null;});
var _VIEWS=['qm','comp'];
// Each mode splits into TWO toggled fragments -- '-top' (Power Ranking) and '-bot' (Radar + stat/
// career tables) -- with the mode-agnostic Projected Competitive Rank section sandwiched between
// them in the DOM (report._hero_content, §Heroes review #13). Both fragments toggle together here;
// section ids inside them (.nowlines, .radarwrap, table ids) are unchanged, so renderSeason's
// lookups don't care which fragment currently holds them.
var _VSUF=['top','bot'];
function showView(slug,src,btn){
  for(var s=0;s<_VSUF.length;s++)for(var i=0;i<_VIEWS.length;i++){
    var el=document.getElementById(slug+'-view-'+_VIEWS[i]+'-'+_VSUF[s]);
    if(el)el.style.display=(_VIEWS[i]===src)?'':'none';}
  setPressed(btn.parentNode.getElementsByClassName('vbtn'),btn);
  var panel=document.getElementById('panel-'+slug); if(panel)panel.setAttribute('data-active',src);
  drawLazyIn(document.getElementById(slug+'-view-'+src+'-bot'));   // the figures live in the bottom fragment
  var gd=document.getElementById(slug+'-radar-'+src);
  if(gd&&window.Plotly&&gd.classList.contains('drawn')){Plotly.Plots.resize(gd);fitRadar(gd);}   // width-fit a radar drawn while hidden
  // THE LENS SWITCH IS A REDRAW PATH TOO (measured 2026-08-03). drawLazyIn above is
  // the first draw of THIS lens's radar, and the Draw-all control's label, pressed state and
  // PRESENCE are all derived from the drawn traces -- the server ships the
  // button `hidden` and syncRadarAll is what puts it on screen. Round 11 wired the other three
  // paths and not this one, so a reader who switched lens met a collapsed pool with no keyboard
  // route to it: 16 of the 25 wraps that carry the control, measured in Chrome at 1440.
  // The combined page overrides showView with applyHeroMode (report.py), which carries the twin.
  if(window.syncRadarAll)syncRadarAll(slug+'-'+src+'-');
  markTableOverflow();   // newly-shown tables can now be measured for the fade
}
// Radar / Role-map toggle inside one view's radarwrap: show the chosen .chartpane, hide the rest,
// and resize the revealed Plotly figure (figures drawn while their pane was display:none have zero width
// until resized). pfx is '<slug>-<source>-'; the radar pane also needs the desktop/mobile width-fit.
function showChart(pfx,kind,btn){
  var w=document.getElementById(pfx+'radarwrap'); if(!w)return;
  // The section caption above the card describes the RADAR (spokes, legend-click isolate) — hide it
  // while the Role map is up, whose own in-pane note describes the scatter. renderSeason re-shows it.
  var rc=document.getElementById(pfx+'radarcap'); if(rc)rc.style.display=(kind==='radar')?'':'none';
  var panes=w.getElementsByClassName('chartpane');
  for(var i=0;i<panes.length;i++){var on=panes[i].getAttribute('data-chart')===kind;
    panes[i].style.display=on?'':'none';
    if(on&&window.Plotly){drawLazyIn(panes[i]);   // first reveal of this pane draws its figure
      var gd=panes[i].querySelector('.js-plotly-plot');
      if(gd){Plotly.Plots.resize(gd); if(kind==='radar'){fitRadar(gd);syncRadarAll(pfx);}}}}
  setPressed(btn.parentNode.getElementsByClassName('vbtn'),btn);
}

// THE LEGEND IS THE ONLY WAY TO REACH A COLLAPSED POLYGON, AND IT IS POINTER-ONLY.
//
// Plotly draws its legend as SVG with no focusable entries -- measured across 10 views on
// 2026-08-02, every radar .figbox contained ZERO elements matching
// a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"]),[contenteditable],
// details>summary, and the box itself carries role='img' with no tabindex. So the caption's "click
// a dimmed name to draw the whole pool" describes an affordance a keyboard-only reader has no way
// to use, and on a deep pool that is most of the data: cloak_and_dagger/qm leaves 26 of 36 polygons
// legendonly. The _radar_aria summary is not a substitute -- it is bounded by the SPOKE count.
//
// THIS CONTROL STORES NOTHING.
//
// Remembering what was drawn so it can be put back does not survive a season pick: that calls
// Plotly.react and replaces the traces, so the remembered array outlives the figure it described
// and the put-back blanks the chart; a count baked into the label is likewise the
// all-time pool's on 357 of them; and it survived onto season pools that collapse nothing.
//
// Everything is derived from the figure that is on screen right now. Each trace's name begins
// "#<rank>", which is the same rank the server gated `visible` on, so the default view is
// recomputable at any moment -- no state to go stale.

// THIS DECLARATION LIVES WITH THE CODE THAT READS IT.
//
// Keep IDENTICAL to RADAR_DEFAULT_SHOWN in src/report.py (radar_fig) -- the server render, the
// season rebuild in season.js and the put-back below must all collapse the same rank cutoff.
//
// It used to be declared in season.js, which report.py concatenates ONLY into the combined page,
// while view.js ships on every build target and references it unconditionally. So each standalone
// one-hero page (`python src/report.py <slug>`) threw `RADAR_DEFAULT_SHOWN is not defined` on load:
// syncRadarAll and showChart both died, the Draw-all button stayed `hidden` forever on the 5 of 11
// pages that carry one -- with 26 of 36 polygons collapsed and no keyboard route to them, exactly
// the state round 10 added the button to end -- and sort.js's `tick()` aborted before the
// `addEventListener('resize'/'load')` calls that follow it, so the radar never restacked for a
// phone either (polar pinned at domain.x [0,0.62] in a 338px svg). One missing declaration, both
// symptoms; measured in Chrome on freshly built cloak_and_dagger.html and magneto.html 2026-08-03.
var RADAR_DEFAULT_SHOWN=10;

// Is this trace one the server would draw by default? (visible iff rank <= RADAR_DEFAULT_SHOWN)
function _radarDefaultOn(tr){
  var m = /^#(\d+)\b/.exec((tr && tr.name) || '');
  return m ? (parseInt(m[1], 10) <= RADAR_DEFAULT_SHOWN) : true;
}

function _radarGd(pfx){
  var w = document.getElementById(pfx + 'radarwrap'); if(!w) return null;
  var pane = w.querySelector(".chartpane[data-chart='radar']"); if(!pane) return null;
  return pane.querySelector('.js-plotly-plot');
}

// Label, pressed state and PRESENCE, all recomputed from the drawn figure. Called after every
// redraw: the lazy first draw, the chart toggle, and season.js's rebuild.
function syncRadarAll(pfx){
  var w = document.getElementById(pfx + 'radarwrap'); if(!w) return;
  var btn = w.querySelector('.radarall'); if(!btn) return;
  var gd = _radarGd(pfx);
  if(!gd || !gd.data || !gd.data.length){ btn.hidden = true; return; }
  var collapsible = 0, drawnAll = true;
  for(var i = 0; i < gd.data.length; i++){
    if(!_radarDefaultOn(gd.data[i])) collapsible++;
    if(gd.data[i].visible === 'legendonly') drawnAll = false;
  }
  // A pool this season draws in full has nothing for this button to do -- the caption drops its
  // Draw-all sentence in exactly that case, and until round 11 the button did not.
  btn.hidden = (collapsible === 0);
  // NO aria-pressed, BECAUSE THE NAME MOVES. (measured 2026-08-03)
  //
  // This carried aria-pressed AND rewrote its own textContent from the same state, so the two
  // channels asserted opposite things: pressed (36 of 36 drawn) announced as "Back to top 10,
  // toggle button, pressed", whose only natural reading is that ten polygons are drawn. It was the
  // ONLY assignment to textContent on an aria-pressed element in the five JS assets -- every other
  // pressed control on the page (1,362 of 1,387) keeps a fixed name and moves only .active + the
  // attribute. A button whose label changes to name the NEXT action is not a toggle: the label is
  // the state channel, and a second one can only contradict it. Removing the attribute is what
  // makes the announcement true, so nothing here writes it and the server renders none.
  //
  // THE PUT-BACK LABEL NAMES THE COUNT IT WILL PAINT, NOT THE CUTOFF.
  //
  // radarDrawAll re-applies the SERVER'S rule (visible iff rank <= RADAR_DEFAULT_SHOWN) off each
  // trace's own `#<rank>` name, and where players TIE at the cutoff that paints MORE than the
  // constant -- doctor_strange/comp S1.5 puts back 11 of 12 under a label that promised 10, beside
  // a caption two elements above reading "Only the top 11 are drawn by default". That is round 5's
  // _radar_cap_html defect (pool size vs painted count) in the control the caption now names first;
  // that function's own comment says naming the constant "would be a second, quieter version of the
  // same defect". `gd.data.length - collapsible` IS the put-back count -- the same traces
  // _radarDefaultOn just accepted -- so the digit cannot disagree with what the press does.
  btn.textContent = drawnAll ? ('Back to top ' + (gd.data.length - collapsible))
                             : ('Draw all ' + gd.data.length);
}

function radarDrawAll(pfx, btn){
  var w = document.getElementById(pfx + 'radarwrap'); if(!w || !window.Plotly) return;
  var pane = w.querySelector(".chartpane[data-chart='radar']"); if(!pane) return;
  drawLazyIn(pane);                          // the pane may never have been revealed
  var gd = _radarGd(pfx); if(!gd || !gd.data) return;
  var drawnAll = true;
  for(var i = 0; i < gd.data.length; i++){
    if(gd.data[i].visible === 'legendonly'){ drawnAll = false; break; }
  }
  // Put-back re-applies the SERVER'S rule rather than a remembered snapshot, so it is correct
  // against whatever traces are currently drawn -- including a season's.
  var want = gd.data.map(function(tr){
    return drawnAll ? (_radarDefaultOn(tr) ? true : 'legendonly') : true;
  });
  Plotly.restyle(gd, {visible: want});
  syncRadarAll(pfx);
}

/* ONE-LINE CAPTIONS (owner-approved 2026-09-23, from the rivalsdata review). A Heroes-axis section
   leads with ONE line -- the first sentence of its caveat box (.disclaimer) or, where it has none,
   of its first note (.sec-note) -- and everything after that sentence moves, WORD FOR WORD, into
   the section's own "How ..." disclosure (a section with none gets one). DISPLAY-ONLY: the server
   markup and every Python/JS twin string stay exactly as they were, which is what the lockstep
   tests compare; the moved nodes keep their ids, so season.js still finds every note it rewrites,
   and retuck() re-splits a caption after such a rewrite (season.js's season rebuild calls it). */
function _tkSplit(p){
  /* a note whose whole text sits in ONE wrapper <span id=...> (the ones season.js rewrites) splits
     inside it; the id stays on the visible half, which is the half season.js writes into */
  var kids=Array.prototype.filter.call(p.childNodes,function(n){return n.nodeType===1||n.textContent.trim();});
  if(kids.length===1&&kids[0].tagName==='SPAN'){
    var inner=_tkSplit(kids[0]),vs=kids[0].cloneNode(false),rs=kids[0].cloneNode(false);
    rs.removeAttribute('id');vs.appendChild(inner.vis);rs.appendChild(inner.rest);
    var v=document.createDocumentFragment(),r=document.createDocumentFragment();
    v.appendChild(vs);r.appendChild(rs);return {vis:v,rest:r,split:inner.split};}
  /* the first sentence can end INSIDE an element (<b>... not a skill estimate.</b> It ...) or right
     BEFORE one (... by sample size. <b>Win %</b> is ...); a full stop followed by a capital is the
     boundary, so "tracker.gg" and "51.1%" never split. A full stop followed by a BOLD element is a
     boundary whatever its case (2026-09-24): the player prose opens sentences on bolded lowercase
     terms (". <b>vs the group</b> ranks them ...", ". <b>vs benchmark</b> ranks ..."), and requiring a
     capital there left an 86-word "one-line" caption on Player DNA. */
  var nodes=Array.prototype.slice.call(p.childNodes),vis=document.createDocumentFragment(),
      rest=document.createDocumentFragment(),done=false,armed=false;
  nodes.forEach(function(node,i){
    if(done){rest.appendChild(node);return;}
    if(node.nodeType===3){var s=node.textContent,m,nx;
      if(armed&&/^\s+[A-Z\u201c"(]/.test(s)){rest.appendChild(document.createTextNode(s.replace(/^\s+/,'')));done=true;return;}
      m=s.match(/^([\s\S]*?[.!?])\s+(?=[A-Z\u201c"(])([\s\S]*)$/);
      if(m){vis.appendChild(document.createTextNode(m[1]));rest.appendChild(document.createTextNode(m[2]));done=true;return;}
      nx=nodes[i+1];m=s.match(/^([\s\S]*[.!?])\s+$/);
      if(m&&nx&&nx.nodeType===1&&(nx.tagName==='B'||/^[A-Z\u201c"(]/.test(nx.textContent.trim()))){vis.appendChild(document.createTextNode(m[1]));done=true;return;}
      if(s.trim())armed=false;vis.appendChild(node);return;}
    vis.appendChild(node);
    if(node.nodeType===1&&node.textContent.trim())armed=/[.!?]\s*$/.test(node.textContent);});
  return {vis:vis,rest:rest,split:done};}
function _tkOwn(el){
  /* NEVER MUTATE A FOLD SOURCE IN PLACE. The repeated-block fold (pagebytes._FOLD_HYDRATOR) keeps
     each block's FIRST copy -- the data-rb element -- as the live source it clones into every later
     placeholder, including the ones inside a hero panel imported from its template long after this
     ran. Tucking a source edited every future clone: a disclosure arrived already carrying another
     panel's moved notes, and a split caption arrived as its first sentence alone, with the rest
     lost. So swap a clone into the page and edit that; the registry keeps the pristine original. */
  if(!el||!el.hasAttribute||!el.hasAttribute('data-rb'))return el;
  var c=el.cloneNode(true);c.removeAttribute('data-rb');el.parentNode.replaceChild(c,el);return c;}
function _tkRest(cap){
  /* the caption's remainder: one <p> at the head of the section's first disclosure, made once */
  if(cap._tkr)return cap._tkr;
  var sec=cap.parentNode,d=_tkOwn(sec.querySelector('details.explainer'));
  if(!d){d=document.createElement('details');d.className='explainer';
    d.innerHTML="<summary>More on this section</summary><div class='expl-body'></div>";
    sec.insertBefore(d,cap.nextSibling);cap._tkMade=d;}
  var b=d.querySelector('.expl-body')||d,r=document.createElement('p');
  r.className='tk-rest';b.insertBefore(r,b.firstChild);cap._tkr=r;return r;}
/* A disclosure THIS made that has nothing in it is a control that opens onto nothing -- a one-player
   hero's "no group to compare against yet" is one sentence, and every such section shipped an empty
   "More on this section" (2026-09-24). Hidden until a re-tuck gives it a remainder: a season
   rewrite can lengthen a one-sentence note. A section's own disclosure is never touched. */
function _tkShow(cap){var d=cap._tkMade;if(!d)return;
  d.hidden=cap._tkr.hidden&&!d.querySelector('.tk-moved');}
function _tkApply(cap){var r=_tkRest(cap),s=_tkSplit(cap);
  cap.textContent='';cap.appendChild(s.vis);r.textContent='';r.appendChild(s.rest);r.hidden=!s.split;
  _tkShow(cap);}
/* PLAYER PANELS TOO (cosmetic sweep 2026-09-24): a profile's sections led with the same walls of
   text the hero panels had (Player DNA 138 words, Matchups 84 + 90), so they take the same one-line
   caption. One guard is theirs alone: a player section whose notes a SCRIPT owns -- an id on a note
   or inside one, e.g. the seasonal chart's empty-state line -- is left as it is, because moving that
   note into a closed disclosure would hide the very message the script shows. (Hero notes with ids
   are season.js's, which re-tucks them through retuck() instead.) */
function _tkScripted(ps){for(var k=0;k<ps.length;k++){var n=ps[k];if(n&&(n.id||n.querySelector('[id]')))return true;}
  return false;}
function tuckNotes(root){
  if(!root||!root.querySelectorAll)return;
  var ss=root.querySelectorAll('.hero-panel section, .player-panel section');
  for(var i=0;i<ss.length;i++){var sec=ss[i];if(sec._tk)continue;sec._tk=1;
    var disc=sec.querySelector(':scope > p.disclaimer'),
        notes=Array.prototype.slice.call(sec.querySelectorAll(':scope > p.sec-note'));
    if(sec.closest('.player-panel')&&_tkScripted([disc].concat(notes)))continue;
    var cap=_tkOwn(disc||notes.shift());
    if(!cap)continue;
    cap.classList.add('tucked');_tkApply(cap);
    /* the section's other notes follow the remainder into the disclosure, in page order */
    var after=cap._tkr;
    for(var j=0;j<notes.length;j++){var nt=_tkOwn(notes[j]);nt.classList.add('tk-moved');
      after.parentNode.insertBefore(nt,after.nextSibling);after=nt;}
    _tkShow(cap);}}
function retuck(el){var c=el&&el.closest?el.closest('.tucked'):null;if(c)_tkApply(c);}
if(document.readyState!=='loading')tuckNotes(document);
else document.addEventListener('DOMContentLoaded',function(){tuckNotes(document);});
