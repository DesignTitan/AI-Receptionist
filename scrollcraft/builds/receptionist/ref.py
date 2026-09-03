import sys, pathlib, math

def bars(n=64):
    out=[]
    for i in range(n):
        v=abs(math.sin(i*0.7))*0.55 + abs(math.sin(i*0.23+1.1))*0.45
        out.append(int(18+v*78))
    return "".join(f'<i style="height:{h}%"></i>' for h in out)

ORB = lambda a,b,c,d: (f'<span class="orb"><i style="background:{a}"></i><i style="background:{b}"></i>'
                       f'<i style="background:{c}"></i><i style="background:{d}"></i></span>')

BASE = """<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<style>
  * { box-sizing: border-box; }
  html, body { margin:0; width:820px; height:964px; overflow:hidden; font-family:Inter,-apple-system,system-ui,sans-serif; -webkit-font-smoothing:antialiased; }
  .scene { position:relative; width:820px; height:964px; overflow:hidden; background:#15100e; }
  /* heavily blurred landscape, as in the reference: colour and tone, no detail */
  .photo { position:absolute; inset:-8%; background-image:url("desert.jpg"); background-size:cover; background-position:50% 62%;
           filter: blur(26px) saturate(115%) brightness(.62); }
  .vig { position:absolute; inset:0; background:
      radial-gradient(120% 80% at 50% 40%, rgba(0,0,0,0) 40%, rgba(8,6,6,.55) 100%),
      linear-gradient(180deg, rgba(10,8,8,.42) 0%, rgba(10,8,8,0) 30%, rgba(10,8,8,.35) 100%); }
  .grain { position:absolute; inset:0; opacity:.09; mix-blend-mode:overlay;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }

  /* ── the pane ── */
  .panel { position:absolute; left:56px; right:56px; top:50%; transform:translateY(-50%);
    border-radius:26px; overflow:hidden; color:#fff;
    __PANE__ }
  .pad { padding:22px 24px 0; }

  /* header: avatar with a ring, name, sub, and a chip with an internal divider */
  .head { display:flex; align-items:center; gap:14px; }
  .orb { position:relative; width:46px; height:46px; border-radius:50%; overflow:hidden; flex:none;
         box-shadow:0 0 0 2px rgba(255,255,255,.85), 0 6px 16px -8px rgba(0,0,0,.7); }
  .orb i { position:absolute; border-radius:50%; filter:blur(9px); }
  .orb i:nth-child(1){inset:-30% 30% 30% -30%} .orb i:nth-child(2){inset:-20% -30% 40% 20%}
  .orb i:nth-child(3){inset:35% -20% -35% 10%} .orb i:nth-child(4){inset:30% 25% -30% -25%}
  .who { min-width:0; }
  .who b { display:block; font-size:16px; font-weight:600; letter-spacing:-.005em; }
  .who span { display:block; font-size:13.5px; color:rgba(255,255,255,.56); margin-top:2px; }
  .chip { margin-left:auto; display:flex; align-items:center; gap:12px; padding:8px 14px 8px 12px; border-radius:14px;
          background:rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.14); font-size:13.5px; font-weight:500; }
  .chip svg { width:16px; height:16px; stroke:rgba(255,255,255,.75); fill:none; stroke-width:1.7; }
  .chip .div { width:1px; height:18px; background:rgba(255,255,255,.18); }

  /* filter pills */
  .pills { display:flex; gap:10px; margin-top:18px; }
  .pill { padding:9px 18px; border-radius:999px; font-size:13.5px; font-weight:500; color:rgba(255,255,255,.62);
          border:1px solid rgba(255,255,255,.14); }
  .pill.on { background:rgba(255,255,255,.16); border-color:rgba(255,255,255,.22); color:#fff; }

  /* full-bleed table: header, then rows with an alternating tint */
  .thead { display:grid; grid-template-columns:var(--cols); gap:14px; padding:16px 24px 12px; margin-top:18px;
           font-size:13px; color:rgba(255,255,255,.62); border-bottom:1px solid rgba(255,255,255,.10); }
  .thead .r { text-align:right; }
  .row { display:grid; grid-template-columns:var(--cols); gap:14px; align-items:center; padding:14px 24px; }
  .row.alt { background:rgba(255,255,255,.055); }
  .lead { display:flex; align-items:center; gap:10px; }
  .badge { width:26px; height:26px; border-radius:50%; display:grid; place-items:center; font-size:12.5px; font-weight:600;
           background:rgba(255,255,255,.10); color:rgba(255,255,255,.7); }
  .badge.hot { background:rgba(214,158,46,.30); color:#f0c15e; }
  .medal { width:14px; height:14px; stroke:#e2a93f; fill:none; stroke-width:1.6; }
  .m { display:flex; align-items:center; gap:11px; min-width:0; }
  .m .av { width:30px; height:30px; border-radius:50%; overflow:hidden; position:relative; flex:none; }
  .m b { display:block; font-size:14px; font-weight:500; }
  .m span { display:block; font-size:12.5px; color:rgba(255,255,255,.52); margin-top:1px; }
  .val { text-align:right; }
  .val b { display:block; font-size:14px; font-weight:600; font-variant-numeric:tabular-nums; }
  .val span { display:block; font-size:12.5px; color:rgba(255,255,255,.45); margin-top:1px; font-variant-numeric:tabular-nums; }
  .val span.up { color:#8fd3a8; }
  .tag { font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:999px; }
  .t-warn { background:rgba(214,158,46,.24); color:#f0c15e; }
  .t-info { background:rgba(140,146,255,.24); color:#c2c6ff; }
  .t-ok { background:rgba(110,200,150,.22); color:#9fe0bb; }
  .book { display:grid; grid-template-columns:360px 1fr; gap:30px; padding:18px 24px 0; }
  .prof .shot { width:100%; aspect-ratio:11/12; object-fit:cover; border-radius:12px; display:block;
                box-shadow:inset 0 0 0 1px rgba(255,255,255,.16); }
  .prof .nm { display:flex; align-items:center; gap:10px; margin-top:14px; }
  .prof .nm b { font-size:19px; font-weight:600; letter-spacing:-.01em; }
  .prof .nm .rate { margin-left:auto; font-size:12.5px; font-weight:600; padding:4px 10px; border-radius:12px;
                    background:rgba(255,255,255,.12); box-shadow:inset 0 0 0 1px rgba(255,255,255,.16); }
  .prof .role { font-size:13.5px; color:rgba(255,255,255,.58); margin-top:3px; }
  .prof .spec { display:inline-block; margin-top:10px; font-size:11.5px; font-weight:600; padding:4px 11px; border-radius:12px;
                background:rgba(214,158,46,.24); color:#f0c15e; }
  .prof .bio { font-size:13px; line-height:1.55; color:rgba(255,255,255,.78); margin-top:12px; }
  .prof .facts { margin-top:14px; }
  .prof .fact { display:grid; grid-template-columns:96px 1fr; gap:10px; padding:9px 0; font-size:12.5px; }
  .prof .fact + .fact { border-top:1px solid rgba(255,255,255,.10); }
  .prof .fact span:first-child { font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.5); padding-top:2px; }
  .bk h4 { margin:0; font-size:19px; font-weight:600; letter-spacing:-.01em; }
  .bk .note { margin:5px 0 0; font-size:13px; line-height:1.5; color:rgba(255,255,255,.58); }
  .sect { padding:18px 24px 0; }
  .bk .sect { padding:18px 0 0; }
  .next { display:grid; gap:11px; }
  .next > div { display:grid; grid-template-columns:26px 1fr; gap:12px; align-items:start; font-size:13px; line-height:1.5; color:rgba(255,255,255,.82); }
  .next b { width:24px; height:24px; border-radius:50%; display:grid; place-items:center; font-size:12px; font-weight:600;
            background:rgba(255,255,255,.12); box-shadow:inset 0 0 0 1px rgba(255,255,255,.16); }
  .sect .lbl { font-size:11px; letter-spacing:.09em; text-transform:uppercase; color:rgba(255,255,255,.55); margin-bottom:10px; }
  .days { display:flex; gap:10px; }
  .day { flex:1; text-align:center; padding:10px 6px 9px; border-radius:12px;
         background:rgba(255,255,255,.07); box-shadow:inset 0 0 0 1px rgba(255,255,255,.12); }
  .day .d { font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.55); }
  .day .n { font-size:19px; font-weight:600; margin-top:2px; }
  .day .o { font-size:10.5px; color:rgba(255,255,255,.5); margin-top:2px; }
  .day.on { background:rgba(255,255,255,.9); box-shadow:none; }
  .day.on .d, .day.on .o { color:rgba(20,22,28,.6); }
  .day.on .n { color:#14161c; }
  .day.off { opacity:.42; }
  .times { display:flex; gap:10px; }
  .time { flex:1; text-align:center; padding:12px 8px; border-radius:12px; font-size:14px; font-weight:500;
          background:rgba(255,255,255,.07); box-shadow:inset 0 0 0 1px rgba(255,255,255,.12); }
  .foot { padding:16px 24px 20px; }
  .cta { height:52px; border-radius:14px; background:#fff; color:#14161c; font-size:15.5px; font-weight:600; display:grid; place-items:center; }
  /* flat sections used by the call / record cards */
  .hr { height:1px; background:rgba(255,255,255,.10); }
  .stats { display:flex; padding:16px 24px; }
  .stats > div { flex:1; }
  .stats > div + div { padding-left:16px; border-left:1px solid rgba(255,255,255,.10); }
  .stats .k { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.5); }
  .stats .v { font-size:14px; margin-top:4px; }
  .stats .on .k { color:#c2c6ff; } .stats .on .v { font-weight:600; }
  .turns { display:grid; gap:10px; padding:16px 24px; }
  .turn { display:grid; grid-template-columns:54px 1fr; gap:12px; font-size:13.5px; line-height:1.5; }
  .turn span:first-child { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.5); padding-top:3px; }
  .wave { display:flex; align-items:center; gap:14px; padding:16px 24px; }
  .wave .play { width:34px; height:34px; border-radius:50%; background:#fff; display:grid; place-items:center; flex:none; }
  .wave .play svg { width:12px; height:12px; fill:#14161c; }
  .wave .bars { flex:1; display:flex; align-items:center; gap:2px; height:28px; }
  .wave .bars i { width:3px; flex:none; border-radius:2px; background:rgba(255,255,255,.5); }
  .wave .t { font-size:13px; color:rgba(255,255,255,.6); font-variant-numeric:tabular-nums; }
  .sum { padding:16px 24px; font-size:13.5px; line-height:1.55; }
  .sum b { display:block; font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#9fe0bb; margin-bottom:6px; }
</style></head><body>
<div class="scene">
  <div class="photo"></div><div class="vig"></div><div class="grain"></div>
  <div class="panel">__BODY__</div>
</div></body></html>"""

PANES = {
 # "T": the pane on a transparent canvas, for the parallax layer. No backdrop-filter (nothing to
 # blur); the photo behind is already blurred, so a neutral milk at a touch more alpha stands in
 # for D's blur + desaturate.
 "T": "background:rgba(226,229,238,.21); border:1px solid rgba(255,255,255,.17); box-shadow:0 40px 90px -40px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.2);",
 "A": "background:rgba(255,255,255,.09); border:1px solid rgba(255,255,255,.13); backdrop-filter:blur(34px) saturate(125%); box-shadow:0 40px 90px -40px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.16);",
 "B": "background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.16); backdrop-filter:blur(34px) saturate(125%); box-shadow:0 40px 90px -40px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.2);",
 "C": "background:rgba(255,255,255,.17); border:1px solid rgba(255,255,255,.2); backdrop-filter:blur(40px) saturate(120%); box-shadow:0 40px 90px -40px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.24);",
 # neutral: the sand is desaturated inside the glass, so the pane reads grey like the reference
 "D": "background:rgba(236,238,244,.13); border:1px solid rgba(255,255,255,.16); backdrop-filter:blur(36px) saturate(72%) brightness(1.02); box-shadow:0 40px 90px -40px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.2);",
}

MONITOR = '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M9 21h6M12 17v4"/></svg>'
MEDAL = '<svg class="medal" viewBox="0 0 24 24"><path d="M12 3v7M8.5 5.5L12 10l3.5-4.5"/><circle cx="12" cy="15.5" r="4.5"/></svg>'


CALL = f"""
  <div class="pad">
    <div class="head">
      {ORB('#7c6cff','#ff9a5c','#ff5f7e','#4ad6c2')}
      <div class="who"><b>Confirmation call</b><span>Nadia Feld · +1 415 555 0134</span></div>
      <div class="chip">{MONITOR}<span class="div"></span>Ringing</div>
    </div>
    <div class="pills"><span class="pill">Queued</span><span class="pill on">Calling</span><span class="pill">Done</span></div>
  </div>
  <div class="thead" style="--cols:118px 1fr 74px"><span>Speaker</span><span>Said</span><span class="r">At</span></div>
  <div class="row alt" style="--cols:118px 1fr 74px">
    <div class="m">{ORB('#7c6cff','#8ab4ff','#4ad6c2','#c2c6ff')}<div><b>Ava</b></div></div>
    <div class="say">Hi Nadia, this is Ava calling from Halide Studio. This call is recorded.</div>
    <div class="val"><b>0:02</b></div>
  </div>
  <div class="row" style="--cols:118px 1fr 74px">
    <div class="m">{ORB('#ffb36b','#ff7a59','#f0c15e','#ffd6a5')}<div><b>Nadia</b></div></div>
    <div class="say">Yes, speaking.</div>
    <div class="val"><b>0:09</b></div>
  </div>
  <div class="row alt" style="--cols:118px 1fr 74px">
    <div class="m">{ORB('#7c6cff','#8ab4ff','#4ad6c2','#c2c6ff')}<div><b>Ava</b></div></div>
    <div class="say">I have you for Wednesday at one. Does that still work?</div>
    <div class="val"><b>0:14</b></div>
  </div>
  <div class="row" style="--cols:118px 1fr 74px">
    <div class="m">{ORB('#ffb36b','#ff7a59','#f0c15e','#ffd6a5')}<div><b>Nadia</b></div></div>
    <div class="say">That works.</div>
    <div class="val"><b>0:21</b></div>
  </div>
  <div class="foot"><div class="cta">Listen in</div></div>
"""

RECORD = f"""
  <div class="pad">
    <div class="head">
      {ORB('#4ad6c2','#7c6cff','#ff9a5c','#ff5f7e')}
      <div class="who"><b>Call record</b><span>Nadia Feld · Halide Studio · Sep 2</span></div>
      <div class="chip">{MONITOR}<span class="div"></span>Confirmed</div>
    </div>
    <div class="pills"><span class="pill">Recording</span><span class="pill on">Summary</span><span class="pill">Transcript</span></div>
    <div class="wave" style="padding-left:0;padding-right:0">
      <div class="play"><svg viewBox="0 0 12 12"><path d="M2 1l9 5-9 5z"/></svg></div>
      <div class="bars">{bars()}</div><div class="t">0:46</div>
    </div>
  </div>
  <div class="thead" style="--cols:1fr 96px"><span>What Ava recorded</span><span class="r">Outcome</span></div>
  <div class="row alt" style="--cols:1fr 96px">
    <div class="say">Client confirmed the session on the first attempt.</div>
    <div class="val"><span class="tag t-ok">Confirmed</span></div>
  </div>
  <div class="row" style="--cols:1fr 96px">
    <div class="say">Asked to have a link ready beforehand.</div>
    <div class="val"><b>Noted</b></div>
  </div>
  <div class="row alt" style="--cols:1fr 96px">
    <div class="say">No changes requested to the time.</div>
    <div class="val"><b>0:46</b></div>
  </div>
  <div class="foot"><div class="cta">Play the recording</div></div>
"""

FLAG = f"""
  <div class="pad">
    <div class="head">
      {ORB('#7c6cff','#ff9a5c','#ff5f7e','#4ad6c2')}
      <div class="who"><b>Needs attention</b><span>6 flagged this week · across three businesses</span></div>
      <div class="chip">{MONITOR}<span class="div"></span>Live</div>
    </div>
    <div class="pills"><span class="pill">Today</span><span class="pill on">This week</span><span class="pill">All time</span></div>
  </div>
  <div class="thead" style="--cols:64px 1fr 132px"><span>Flag</span><span>Client</span><span class="r">Booking</span></div>
  <div class="row alt" style="--cols:64px 1fr 132px">
    <div class="lead">{MEDAL}<span class="badge hot">1</span></div>
    <div class="m">{ORB('#ffb36b','#ff7a59','#8b5cf6','#f0c15e')}<div><b>Tobias Lang</b><span>Northlake Family Health</span></div></div>
    <div class="val"><b>Sat, Sep 5</b><span>8:00 AM</span></div>
  </div>
  <div class="row" style="--cols:64px 1fr 132px">
    <div class="lead">{MEDAL}<span class="badge hot">2</span></div>
    <div class="m">{ORB('#8ab4ff','#6ee7a0','#7c6cff','#ffd166')}<div><b>Priya Raman</b><span>asked for the afternoon</span></div></div>
    <div class="val"><b>Thu, Sep 3</b><span class="up">9:10 AM</span></div>
  </div>
  <div class="row alt" style="--cols:64px 1fr 132px">
    <div class="lead">{MEDAL}<span class="badge hot">3</span></div>
    <div class="m">{ORB('#ff8fab','#ffd6a5','#9bf6ff','#bdb2ff')}<div><b>Felix Brandt</b><span>Solstice Salon &amp; Spa</span></div></div>
    <div class="val"><b>Mon, Sep 7</b><span>5:00 PM</span></div>
  </div>
  <div class="row" style="--cols:64px 1fr 132px">
    <div class="lead"><span style="width:14px"></span><span class="badge">4</span></div>
    <div class="m">{ORB('#a0c4ff','#caffbf','#ffc6ff','#fdffb6')}<div><b>Kenji Watanabe</b><span>Halide Studio</span></div></div>
    <div class="val"><b>Mon, Sep 7</b><span>1:00 PM</span></div>
  </div>
  <div class="foot"><div class="cta">Open the first one</div></div>
"""


STAGE = {}

STAGE["book"] = f"""
  <div class="pad">
    <div class="head">
      {ORB('#ff8fab','#ffd6a5','#bdb2ff','#9bf6ff')}
      <div class="who"><b>Solstice Salon &amp; Spa</b><span>Hair · Skin · Massage · book with any of our people</span></div>
      <div class="chip">{MONITOR}<span class="div"></span>Book now</div>
    </div>
  </div>
  <div class="book">
    <div class="prof">
      <img class="shot" src="stylist.png" alt="">
      <div class="nm"><b>Sasha Reyes</b><span class="rate">★ 4.9</span></div>
      <div class="role">Master Colourist</div>
      <div class="spec">Colour</div>
      <div class="bio">Sasha has spent twelve years doing the colour other salons send people to her to fix. Balayage, lived-in blondes and corrective work — she will tell you honestly what your hair can take in one sitting and what it cannot.</div>
      <div class="facts">
        <div class="fact"><span>Experience</span><span>12 years · 388 guest reviews</span></div>
        <div class="fact"><span>Speaks</span><span>English, Spanish</span></div>
        <div class="fact"><span>Location</span><span>Solstice on Second, second floor</span></div>
      </div>
    </div>
    <div class="bk">
      <h4>Book an appointment</h4>
      <p class="note">All times shown in America/New York. After booking, the receptionist calls you within a minute to confirm.</p>
      <div class="pills" style="margin-top:16px"><span class="pill on">Choose a time</span><span class="pill">Your details</span><span class="pill">Confirm</span></div>
      <div class="sect">
        <div class="lbl">Pick a day</div>
        <div class="days">
          <div class="day on"><div class="d">Wed</div><div class="n">2</div><div class="o">3 open</div></div>
          <div class="day"><div class="d">Thu</div><div class="n">3</div><div class="o">5 open</div></div>
          <div class="day"><div class="d">Fri</div><div class="n">4</div><div class="o">3 open</div></div>
          <div class="day"><div class="d">Sat</div><div class="n">5</div><div class="o">5 open</div></div>
          <div class="day off"><div class="d">Sun</div><div class="n">6</div><div class="o">Closed</div></div>
          <div class="day off"><div class="d">Mon</div><div class="n">7</div><div class="o">Closed</div></div>
          <div class="day"><div class="d">Tue</div><div class="n">8</div><div class="o">5 open</div></div>
        </div>
      </div>
      <div class="sect">
        <div class="lbl">Available times · afternoon, EDT</div>
        <div class="times">
          <div class="time">1:30 PM</div>
          <div class="time">3:00 PM</div>
          <div class="time">4:30 PM</div>
        </div>
      </div>
      <div class="sect"><div class="cta">Continue</div></div>
      <div class="sect">
        <div class="lbl">What happens next</div>
        <div class="next">
          <div><b>1</b><span>The receptionist calls you inside a minute to confirm.</span></div>
          <div><b>2</b><span>Confirm, move it or cancel — on the phone, in one go.</span></div>
          <div><b>3</b><span>The salon sees the call, the transcript and the outcome.</span></div>
        </div>
      </div>
    </div>
  </div>
  <div class="foot"></div>
"""

STAGE["after"] = f"""
  <div class="pad">
    <div class="head">
      {ORB('#7c6cff','#4ad6c2','#8ab4ff','#c2c6ff')}
      <div class="who"><b>Taken while you were closed</b><span>11 of last week&rsquo;s 38 bookings came in after hours</span></div>
      <div class="chip">{MONITOR}<span class="div"></span>Open 24/7</div>
    </div>
    <div class="pills"><span class="pill">Last night</span><span class="pill on">This week</span><span class="pill">This month</span></div>
  </div>
  <div class="thead" style="--cols:200px 1fr 220px"><span>Booked at</span><span>Client</span><span class="r">Confirmed</span></div>
  <div class="row alt" style="--cols:200px 1fr 220px"><div class="m"><div><b>9:12 PM</b><span>Tuesday</span></div></div><div class="m">{ORB('#ffb36b','#ff7a59','#8b5cf6','#f0c15e')}<div><b>Nadia Feld</b><span>Colour · 90 minutes</span></div></div><div class="val"><b>9:13 PM</b><span class="up">61 seconds later</span></div></div>
  <div class="row" style="--cols:200px 1fr 220px"><div class="m"><div><b>11:48 PM</b><span>Wednesday</span></div></div><div class="m">{ORB('#8ab4ff','#6ee7a0','#7c6cff','#ffd166')}<div><b>Tobias Lang</b><span>Consultation</span></div></div><div class="val"><b>11:49 PM</b><span class="up">44 seconds later</span></div></div>
  <div class="row alt" style="--cols:200px 1fr 220px"><div class="m"><div><b>6:04 AM</b><span>Thursday</span></div></div><div class="m">{ORB('#ff8fab','#ffd6a5','#9bf6ff','#bdb2ff')}<div><b>Priya Raman</b><span>Massage · 60 minutes</span></div></div><div class="val"><b>6:05 AM</b><span class="up">38 seconds later</span></div></div>
  <div class="row" style="--cols:200px 1fr 220px"><div class="m"><div><b>Sun 3:20 PM</b><span>Closed that day</span></div></div><div class="m">{ORB('#a0c4ff','#caffbf','#ffc6ff','#fdffb6')}<div><b>Felix Brandt</b><span>Cut · 45 minutes</span></div></div><div class="val"><b>3:21 PM</b><span class="up">52 seconds later</span></div></div>
  <div class="foot"><div class="cta">See the overnight bookings</div></div>
"""

STAGE["noshow"] = f"""
  <div class="pad">
    <div class="head">
      {ORB('#6ee7a0','#4ad6c2','#8ab4ff','#c2ffd6')}
      <div class="who"><b>Fewer empty chairs</b><span>Confirmed on the phone, not by a text nobody opens</span></div>
      <div class="chip">{MONITOR}<span class="div"></span>September</div>
    </div>
    <div class="pills"><span class="pill on">This month</span><span class="pill">Last month</span><span class="pill">Year to date</span></div>
  </div>
  <div class="thead" style="--cols:1fr 200px 200px"><span></span><span>Before</span><span class="r">With the desk</span></div>
  <div class="row alt" style="--cols:1fr 200px 200px"><div class="m"><div><b>Bookings confirmed</b><span>Reached on the first call</span></div></div><div class="say">61%</div><div class="val"><b>94%</b><span class="up">+33 points</span></div></div>
  <div class="row" style="--cols:1fr 200px 200px"><div class="m"><div><b>No-shows</b><span>Nobody arrived, nobody called</span></div></div><div class="say">14</div><div class="val"><b>5</b><span class="up">9 fewer</span></div></div>
  <div class="row alt" style="--cols:1fr 200px 200px"><div class="m"><div><b>Slots put back</b><span>Cancelled early enough to refill</span></div></div><div class="say">2</div><div class="val"><b>11</b><span class="up">Refilled the same week</span></div></div>
  <div class="row" style="--cols:1fr 200px 200px"><div class="m"><div><b>Value recovered</b><span>At your average ticket</span></div></div><div class="say">—</div><div class="val"><b>$2,240</b><span class="up">This month</span></div></div>
  <div class="foot"><div class="cta">Open the month</div></div>
"""

STAGE["voice"] = f"""
  <div class="pad">
    <div class="head">
      {ORB('#ff9a5c','#ff5f7e','#7c6cff','#ffd6a5')}
      <div class="who"><b>She sounds like your business</b><span>Your words, your rules, your number on their screen</span></div>
      <div class="chip">{MONITOR}<span class="div"></span>3 businesses</div>
    </div>
    <div class="pills"><span class="pill">Northlake Family Health</span><span class="pill on">Solstice Salon &amp; Spa</span><span class="pill">Halide Studio</span></div>
  </div>
  <div class="thead" style="--cols:220px 1fr"><span>Setting</span><span>What the caller gets</span></div>
  <div class="row alt" style="--cols:220px 1fr"><div class="m"><div><b>Opening line</b></div></div><div class="say">&ldquo;Hi Nadia, this is Ava calling from Solstice Salon &amp; Spa. This call is recorded.&rdquo;</div></div>
  <div class="row" style="--cols:220px 1fr"><div class="m"><div><b>Never says</b></div></div><div class="say">Prices, medical advice, or anything you have not approved.</div></div>
  <div class="row alt" style="--cols:220px 1fr"><div class="m"><div><b>If they ask</b></div></div><div class="say">She says she is an AI, plainly, and carries on.</div></div>
  <div class="row" style="--cols:220px 1fr"><div class="m"><div><b>Calls from</b></div></div><div class="say">Your own number, so it is not a stranger ringing.</div></div>
  <div class="foot"><div class="cta">Hear her greeting</div></div>
"""

variant = sys.argv[2] if len(sys.argv) > 2 else "B"
key     = sys.argv[3] if len(sys.argv) > 3 else "flag"
mode    = sys.argv[4] if len(sys.argv) > 4 else "card"   # card | wide | stage
layer   = sys.argv[5] if len(sys.argv) > 5 else "full"   # full | bg | panel  (bg + panel = the parallax pair)

BODIES = {"call": CALL, "record": RECORD, "flag": FLAG}
body = STAGE[key] if mode == "stage" else BODIES[key]
html = BASE.replace("__PANE__", PANES[variant]).replace("__BODY__", body)

if mode == "wide":
    # a landscape frame for stacked card layouts, where the image slot is short and wide
    html = (html.replace("width:820px; height:964px", "width:1200px; height:760px")
                .replace(".panel { position:absolute; left:56px; right:56px;", ".panel { position:absolute; left:90px; right:90px;")
                .replace("background-position:50% 62%", "background-position:50% 56%"))
elif mode == "stage":
    # a 16:10 frame for the core-features tab stage
    html = (html.replace("width:820px; height:964px", "width:1600px; height:1000px")
                .replace(".panel { position:absolute; left:56px; right:56px;", ".panel { position:absolute; left:150px; right:150px;")
                .replace("background-position:50% 62%", "background-position:50% 58%"))

if layer == "bg":
    html = html.replace('<div class="panel">', '<div class="panel" style="display:none">')
elif layer == "panel":
    html = (html.replace('<div class="photo"></div><div class="vig"></div><div class="grain"></div>', '')
                .replace("overflow:hidden; background:#15100e;", "overflow:hidden; background:transparent;")
                .replace(PANES[variant], PANES["T"]))
pathlib.Path(sys.argv[1]).write_text(html)
print("wrote", sys.argv[1])
