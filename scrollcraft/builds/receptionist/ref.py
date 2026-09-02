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
      <div class="who"><b>Book with Sasha Reyes</b><span>Master Colourist · Solstice Salon &amp; Spa</span></div>
      <div class="chip">{MONITOR}<span class="div"></span>3 open</div>
    </div>
    <div class="pills"><span class="pill on">Choose a time</span><span class="pill">Your details</span><span class="pill">Confirm</span></div>
  </div>
  <div class="thead" style="--cols:1fr 150px 150px"><span>Day</span><span>Open</span><span class="r">Earliest</span></div>
  <div class="row alt" style="--cols:1fr 150px 150px"><div class="m"><div><b>Wednesday, Sep 2</b><span>Today</span></div></div><div class="say">3 slots</div><div class="val"><b>1:30 PM</b></div></div>
  <div class="row" style="--cols:1fr 150px 150px"><div class="m"><div><b>Thursday, Sep 3</b><span>Tomorrow</span></div></div><div class="say">5 slots</div><div class="val"><b>9:00 AM</b></div></div>
  <div class="row alt" style="--cols:1fr 150px 150px"><div class="m"><div><b>Friday, Sep 4</b><span>Colour and cut</span></div></div><div class="say">3 slots</div><div class="val"><b>11:15 AM</b></div></div>
  <div class="row" style="--cols:1fr 150px 150px"><div class="m"><div><b>Saturday, Sep 5</b><span>Fills quickly</span></div></div><div class="say">5 slots</div><div class="val"><b>2:00 PM</b></div></div>
  <div class="foot"><div class="cta">Continue</div></div>
"""

STAGE["call"] = f"""
  <div class="pad">
    <div class="head">
      {ORB('#7c6cff','#8ab4ff','#4ad6c2','#c2c6ff')}
      <div class="who"><b>You&rsquo;re booked, Nadia</b><span>Reference HS-QR4WSV · Halide Studio</span></div>
      <div class="chip">{MONITOR}<span class="div"></span>Ringing</div>
    </div>
    <div class="pills"><span class="pill">Queued</span><span class="pill on">Calling</span><span class="pill">Done</span></div>
  </div>
  <div class="thead" style="--cols:220px 1fr 110px"><span>Stage</span><span>What happens</span><span class="r">At</span></div>
  <div class="row alt" style="--cols:220px 1fr 110px"><div class="m"><div><b>Queued</b></div></div><div class="say">The booking is handed to the assistant.</div><div class="val"><b>0:00</b></div></div>
  <div class="row" style="--cols:220px 1fr 110px"><div class="m"><div><b>Calling you</b></div></div><div class="say">Your phone rings, from the salon&rsquo;s own number.</div><div class="val"><b>0:02</b></div></div>
  <div class="row alt" style="--cols:220px 1fr 110px"><div class="m"><div><b>On the call</b></div></div><div class="say">Confirm, move it, or cancel — on the phone.</div><div class="val"><b>0:09</b></div></div>
  <div class="row" style="--cols:220px 1fr 110px"><div class="m"><div><b>Done</b></div></div><div class="say">Outcome recorded and sent to the front desk.</div><div class="val"><b>0:46</b></div></div>
  <div class="foot"><div class="cta">Listen in</div></div>
"""

STAGE["record"] = f"""
  <div class="pad">
    <div class="head">
      {ORB('#4ad6c2','#7c6cff','#ff9a5c','#ff5f7e')}
      <div class="who"><b>Calls today</b><span>12 placed · 9 confirmed · 77% reached</span></div>
      <div class="chip">{MONITOR}<span class="div"></span>Live</div>
    </div>
    <div class="pills"><span class="pill">All</span><span class="pill on">Confirmed</span><span class="pill">Needs a person</span></div>
  </div>
  <div class="thead" style="--cols:1fr 260px 150px"><span>Client</span><span>Business</span><span class="r">Outcome</span></div>
  <div class="row alt" style="--cols:1fr 260px 150px"><div class="m">{ORB('#ffb36b','#ff7a59','#8b5cf6','#f0c15e')}<div><b>Nadia Feld</b><span>Recording · transcript · summary</span></div></div><div class="say">Halide Studio</div><div class="val"><span class="tag t-ok">Confirmed</span></div></div>
  <div class="row" style="--cols:1fr 260px 150px"><div class="m">{ORB('#8ab4ff','#6ee7a0','#7c6cff','#ffd166')}<div><b>Mira Castellanos</b><span>Recording · transcript · summary</span></div></div><div class="say">Halide Studio</div><div class="val"><span class="tag t-ok">Confirmed</span></div></div>
  <div class="row alt" style="--cols:1fr 260px 150px"><div class="m">{ORB('#ff8fab','#ffd6a5','#9bf6ff','#bdb2ff')}<div><b>Priya Raman</b><span>Asked for the afternoon</span></div></div><div class="say">Northlake Family Health</div><div class="val"><span class="tag t-info">Reschedule</span></div></div>
  <div class="row" style="--cols:1fr 260px 150px"><div class="m">{ORB('#a0c4ff','#caffbf','#ffc6ff','#fdffb6')}<div><b>Felix Brandt</b><span>Flagged for a person</span></div></div><div class="say">Solstice Salon &amp; Spa</div><div class="val"><span class="tag t-warn">No answer</span></div></div>
  <div class="foot"><div class="cta">Open the newest record</div></div>
"""

STAGE["flag"] = f"""
  <div class="pad">
    <div class="head">
      {ORB('#7c6cff','#ff9a5c','#ff5f7e','#4ad6c2')}
      <div class="who"><b>Needs attention</b><span>6 flagged this week · across three businesses</span></div>
      <div class="chip">{MONITOR}<span class="div"></span>6</div>
    </div>
    <div class="pills"><span class="pill">Today</span><span class="pill on">This week</span><span class="pill">All time</span></div>
  </div>
  <div class="thead" style="--cols:1fr 300px 150px"><span>Client</span><span>Booking</span><span class="r">Flag</span></div>
  <div class="row alt" style="--cols:1fr 300px 150px"><div class="m">{ORB('#ffb36b','#ff7a59','#8b5cf6','#f0c15e')}<div><b>Tobias Lang</b><span>Northlake Family Health</span></div></div><div class="say">Sat, Sep 5 · 8:00 AM</div><div class="val"><span class="tag t-warn">No answer</span></div></div>
  <div class="row" style="--cols:1fr 300px 150px"><div class="m">{ORB('#8ab4ff','#6ee7a0','#7c6cff','#ffd166')}<div><b>Priya Raman</b><span>Asked for the afternoon</span></div></div><div class="say">Thu, Sep 3 · 9:10 AM</div><div class="val"><span class="tag t-info">Reschedule</span></div></div>
  <div class="row alt" style="--cols:1fr 300px 150px"><div class="m">{ORB('#ff8fab','#ffd6a5','#9bf6ff','#bdb2ff')}<div><b>Felix Brandt</b><span>Solstice Salon &amp; Spa</span></div></div><div class="say">Mon, Sep 7 · 5:00 PM</div><div class="val"><span class="tag t-warn">No answer</span></div></div>
  <div class="row" style="--cols:1fr 300px 150px"><div class="m">{ORB('#a0c4ff','#caffbf','#ffc6ff','#fdffb6')}<div><b>Kenji Watanabe</b><span>Halide Studio</span></div></div><div class="say">Mon, Sep 7 · 1:00 PM</div><div class="val"><span class="tag t-warn">No answer</span></div></div>
  <div class="foot"><div class="cta">Open the first one</div></div>
"""

variant = sys.argv[2] if len(sys.argv) > 2 else "B"
key     = sys.argv[3] if len(sys.argv) > 3 else "flag"
mode    = sys.argv[4] if len(sys.argv) > 4 else "card"   # card | wide | stage

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

pathlib.Path(sys.argv[1]).write_text(html)
print("wrote", sys.argv[1])
