import sys, pathlib
# One template, three features. Layout mirrors the reference: tool buttons top-left,
# action top-right, a frosted panel with the feature's own UI, a white primary button,
# a short list beneath. Ground is a dune landscape drawn as layered gradients.
BASE = """<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 820px; height: 964px; overflow: hidden; font-family: Inter, -apple-system, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
  .scene { position: relative; width: 820px; height: 964px; overflow: hidden; background: #0a0a0c; }
  .sky { position: absolute; inset: 0 0 56% 0; background: linear-gradient(180deg, #2b3444 0%, #4a4b52 38%, #8f7358 74%, #d0a273 100%); }
  .sun { position: absolute; left: 66%; top: 40%; width: 520px; height: 340px; transform: translate(-50%,-50%); border-radius: 50%;
         background: radial-gradient(closest-side, rgba(255,206,150,.85), rgba(255,170,105,.28) 52%, rgba(255,170,105,0) 76%); filter: blur(22px); }
  .dune { position: absolute; left: -14%; right: -14%; border-radius: 50% 50% 0 0 / 100% 100% 0 0; }
  /* far ridge, then two mid dunes with a lit crest, then the dark foreground */
  .d1 { bottom: 44%; height: 22%; background: linear-gradient(180deg, #c29a70 0%, #8d6a48 70%); }
  .d2 { bottom: 30%; height: 34%; left: -34%; right: 26%; background: linear-gradient(180deg, #d8ab7a 0%, #7d5836 78%); }
  .d3 { bottom: 12%; height: 40%; left: 14%; right: -34%; background: linear-gradient(180deg, #e0b586 0%, #6d4a2c 80%); }
  .d4 { bottom: -14%; height: 44%; left: -20%; right: 10%; background: linear-gradient(180deg, #6a462b 0%, #2a1b11 78%); }
  .d5 { bottom: -30%; height: 46%; background: linear-gradient(180deg, #221710 0%, #0b0806 70%); }
  .haze { position: absolute; inset: 0; background:
      linear-gradient(180deg, rgba(12,12,16,.42) 0%, rgba(12,12,16,.06) 26%, rgba(20,12,6,.10) 60%, rgba(8,6,5,.55) 100%); }
  .grain { position: absolute; inset: 0; opacity: .13; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
  .tools { position: absolute; left: 22px; top: 22px; display: flex; gap: 10px; z-index: 3; }
  .tool { width: 42px; height: 42px; border-radius: 12px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(14px); display: grid; place-items: center; color: rgba(255,255,255,.9); }
  .tool svg { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  .action { position: absolute; right: 22px; top: 22px; height: 42px; padding: 0 18px; border-radius: 12px; background: rgba(255,255,255,.14);
            border: 1px solid rgba(255,255,255,.18); backdrop-filter: blur(14px); color: #fff; font-size: 14px; font-weight: 600;
            display: flex; align-items: center; gap: 8px; z-index: 3; }
  .action i { width: 7px; height: 7px; border-radius: 50%; background: #6ee7a0; box-shadow: 0 0 0 4px rgba(110,231,160,.22); }
  .panel { position: absolute; left: 34px; right: 34px; top: 50%; transform: translateY(-50%); border-radius: 24px; padding: 24px;
    background: linear-gradient(180deg, rgba(255,255,255,.15), rgba(255,255,255,.06)); border: 1px solid rgba(255,255,255,.2);
    backdrop-filter: blur(26px) saturate(140%); box-shadow: 0 40px 80px -40px rgba(0,0,0,.75), inset 0 1px 0 rgba(255,255,255,.28);
    color: #fff; z-index: 2; }
  .phead { display: flex; align-items: center; gap: 12px; padding: 2px 4px 16px; }
  .ptitle { font-size: 18px; font-weight: 600; letter-spacing: -.01em; }
  .ppill { margin-left: auto; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 999px; }
  .p-ok { background: rgba(110,231,160,.18); color: #8ff0b7; }
  .p-live { background: rgba(154,157,255,.2); color: #c3c5ff; }
  .p-warn { background: rgba(240,160,75,.18); color: #f5bd7c; }
  .ui { border-radius: 16px; overflow: hidden; background: rgba(10,9,14,.42); border: 1px solid rgba(255,255,255,.13); }
  .btn { margin-top: 16px; height: 58px; border-radius: 14px; background: #fff; color: #0d0c10; font-size: 17px; font-weight: 600;
         display: grid; place-items: center; box-shadow: 0 10px 26px -12px rgba(0,0,0,.7); }
  /* feature UI bits */
  .bar { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: rgba(255,255,255,.07); border-bottom: 1px solid rgba(255,255,255,.09); font-size: 13px; color: rgba(255,255,255,.82); }
  .bar .pill { margin-left: auto; font-size: 11.5px; font-weight: 600; padding: 3px 9px; border-radius: 999px; }
  .body { padding: 14px; display: grid; gap: 10px; }
  .wave { display: flex; align-items: center; gap: 12px; }
  .wave .play { width: 34px; height: 34px; border-radius: 50%; background: #fff; display: grid; place-items: center; }
  .wave .play svg { width: 13px; height: 13px; fill: #0d0c10; }
  .wave .bars { flex: 1; display: flex; align-items: center; gap: 2px; height: 28px; }
  .wave .bars i { width: 3px; flex: none; border-radius: 2px; background: rgba(255,255,255,.45); }
  .wave .t { font-size: 12.5px; color: rgba(255,255,255,.6); font-variant-numeric: tabular-nums; }
  .turn { display: grid; grid-template-columns: 54px 1fr; gap: 10px; font-size: 13px; line-height: 1.5; }
  .turn span:first-child { font-size: 10.5px; letter-spacing: .09em; text-transform: uppercase; color: rgba(255,255,255,.5); padding-top: 3px; }
  .turn span:last-child { color: rgba(255,255,255,.9); }
  .sum { padding: 11px 12px; border-radius: 10px; background: rgba(110,231,160,.14); border: 1px solid rgba(110,231,160,.28); font-size: 13px; line-height: 1.5; }
  .sum b { display: block; font-size: 10.5px; letter-spacing: .09em; text-transform: uppercase; color: #6ee7a0; margin-bottom: 5px; font-weight: 600; }
  .row { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px; padding: 11px 12px; border-radius: 10px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); }
  .row .who { font-size: 13.5px; font-weight: 500; }
  .row .meta { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 2px; }
  .tag { font-size: 11.5px; font-weight: 600; padding: 4px 10px; border-radius: 999px; }
  .t-ok { background: rgba(110,231,160,.16); color: #8ff0b7; }
  .t-warn { background: rgba(240,160,75,.16); color: #f5bd7c; }
  .t-info { background: rgba(154,157,255,.16); color: #b9bbff; }
  .steps { display: flex; gap: 8px; }
  .step { flex: 1; padding: 10px; border-radius: 10px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); }
  .step .k { font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.5); }
  .step .v { font-size: 13px; margin-top: 4px; }
  .step.on { background: rgba(154,157,255,.16); border-color: rgba(154,157,255,.35); }
  .step.on .k { color: #b9bbff; }
</style></head><body>
<div class="scene">
  <div class="sky"></div><div class="sun"></div>
  <div class="dune d1"></div><div class="dune d2"></div><div class="dune d3"></div><div class="dune d4"></div><div class="dune d5"></div>
  <div class="haze"></div><div class="grain"></div>
  <div class="tools">
    <div class="tool"><svg viewBox="0 0 24 24"><path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h13M21 17h-1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="19" cy="17" r="2"/></svg></div>
    <div class="tool"><svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M3.5 10h17M10 10v9.5"/></svg></div>
    <div class="tool"><svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M4.9 6.9l2.8 2.8M16.3 14.3l2.8 2.8M3 12h4M17 12h4M4.9 17.1l2.8-2.8M16.3 9.7l2.8-2.8"/></svg></div>
  </div>
  <div class="action"><i></i>__ACTION__</div>
  <div class="panel">
    <div class="phead"><div class="ptitle">__EYEBROW__</div><div class="ppill __PILLC__">__PILL__</div></div>
    __UI__
    <div class="btn">__CTA__</div>
  </div>
</div></body></html>"""

def bars(seed=0):
    import math
    out=[]
    for i in range(64):
        v=abs(math.sin(i*0.7))*0.55 + abs(math.sin(i*0.23+1.1))*0.45
        out.append(int(18+v*78))
    return "".join(f'<i style="height:{h}%"></i>' for h in out)

FEATURES = {
 "call": dict(action="On a call", eyebrow="Confirmation call", pill="Ringing", pillc="p-live",
   ui=f'''<div class="ui"><div class="bar">Nadia Feld · +1 415 555 0134<span class="pill t-info">0:04</span></div>
     <div class="body"><div class="steps">
       <div class="step"><div class="k">Queued</div><div class="v">Handed over</div></div>
       <div class="step on"><div class="k">Calling</div><div class="v">Ringing now</div></div>
       <div class="step"><div class="k">Outcome</div><div class="v">Pending</div></div>
     </div>
     <div class="turn"><span>Ava</span><span>Hi Nadia, this is Ava calling from Halide Studio. This call is recorded. I have you for Wednesday at one. Does that still work?</span></div>
     <div class="turn"><span>Nadia</span><span>Yes, that works.</span></div></div></div>''',
   cta="Listen in"),
 "record": dict(action="Recorded", eyebrow="Call record", pill="Confirmed", pillc="p-ok",
   ui=f'''<div class="ui"><div class="bar">Nadia Feld · Halide Studio · Sep 2<span class="pill t-ok">0:46</span></div>
     <div class="body"><div class="wave"><div class="play"><svg viewBox="0 0 12 12"><path d="M2 1l9 5-9 5z"/></svg></div>
       <div class="bars">{bars()}</div><div class="t">0:46</div></div>
     <div class="sum"><b>Summary</b>Client confirmed the session on the first attempt. Asked to have a link ready beforehand. No changes requested.</div>
     <div class="turn"><span>Ava</span><span>Perfect, I have you down. Anything you would like the director to look at beforehand?</span></div>
     <div class="turn"><span>Nadia</span><span>I will send a link over today.</span></div></div></div>''',
   cta="Play the recording"),
 "flag": dict(action="6 to review", eyebrow="Needs attention", pill="6 this week", pillc="p-warn",
   ui='''<div class="ui"><div class="bar">Flagged for a person<span class="pill t-warn">6</span></div>
     <div class="body">
       <div class="row"><div><div class="who">Tobias Lang</div><div class="meta">Sat, Sep 5 · 8:00 AM · Northlake Family Health</div></div><span class="tag t-warn">No answer</span></div>
       <div class="row"><div><div class="who">Priya Raman</div><div class="meta">Thu, Sep 3 · 9:10 AM · asked for the afternoon</div></div><span class="tag t-info">Reschedule</span></div>
       <div class="row"><div><div class="who">Felix Brandt</div><div class="meta">Mon, Sep 7 · 5:00 PM · Solstice Salon &amp; Spa</div></div><span class="tag t-warn">No answer</span></div>
       <div class="row"><div><div class="who">Kenji Watanabe</div><div class="meta">Mon, Sep 7 · 1:00 PM · Halide Studio</div></div><span class="tag t-warn">No answer</span></div>
     </div></div>''',
   cta="Open the first one"),
}
key=sys.argv[1]; f=FEATURES[key]
html=(BASE.replace("__ACTION__",f["action"]).replace("__EYEBROW__",f["eyebrow"])
      .replace("__UI__",f["ui"]).replace("__CTA__",f["cta"])
      .replace("__PILL__",f["pill"]).replace("__PILLC__",f["pillc"]))
pathlib.Path(sys.argv[2]).write_text(html); print("wrote", sys.argv[2])
