#!/usr/bin/env python3
"""Piloto WebGL por software para validar o pipeline bruto do navegador.

Executa Chromium em uma sessão Xvfb e força SwiftShader. Valida criação do
contexto, compilação/linkagem de shaders, desenho, leitura de pixel,
redimensionamento e perda/restauração. Não substitui GPU física.
"""
from __future__ import annotations
import argparse, json, os, re, subprocess, time
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright

PROFILES = [
    ('desktop', {'width': 1365, 'height': 768}),
    ('mobile', {'width': 390, 'height': 844}),
]

def build_html(root: Path) -> str:
    source = (root / 'js/render/webgl-preflight.js').read_text(encoding='utf-8')
    source = re.sub(r'export\s+async\s+function\s+runWebGLPreflight', 'async function runWebGLPreflight', source)
    source = re.sub(r'export\s+function\s+getLastWebGLPreflight', 'function getLastWebGLPreflight', source)
    source = re.sub(r'export\s+function\s+formatWebGLPreflight', 'function formatWebGLPreflight', source)
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{{margin:0;background:#030811;color:#dff8ff;font:16px system-ui}}
      main{{min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box}}
      section{{width:min(760px,100%);border:1px solid #2b819b;border-radius:22px;padding:22px;background:#07141f}}
      canvas{{width:100%;height:260px;border-radius:14px;background:#020711;image-rendering:auto}}
      pre{{white-space:pre-wrap;overflow-wrap:anywhere;color:#bdefff}}
    </style></head><body><main><section><h1>Piloto WebGL R6</h1><canvas id="probe"></canvas><pre id="result">Executando…</pre></section></main>
    <script>{source}
    (async()=>{{
      const canvas=document.querySelector('#probe');
      const report=await runWebGLPreflight({{canvas,preferWebGL2:true,testRecovery:true,width:512,height:260}});
      document.querySelector('#result').textContent=formatWebGLPreflight(report);
      document.body.dataset.webglReady='true'; window.__webglReport=report;
    }})().catch(error=>{{document.body.dataset.webglReady='error';window.__webglError=String(error);}});
    </script></body></html>'''

def start_xvfb(display: str):
    env = os.environ.copy(); env['DISPLAY'] = display
    process = subprocess.Popen(['Xvfb', display, '-screen', '0', '1440x1000x24', '-ac', '+extension', 'GLX', '+render', '-noreset'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(.45)
    return process, env

def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--output', type=Path, default=None)
    args=parser.parse_args(); root=args.root.resolve()
    output=(args.output or root/'validation/r6-webgl-pilot.json').resolve()
    shots=output.parent/'screenshots'; shots.mkdir(parents=True, exist_ok=True)
    html=build_html(root)
    xvfb, env=start_xvfb(':99')
    profiles=[]
    try:
      with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium', headless=False, env=env, args=[
          '--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader',
          '--disable-background-timer-throttling','--disable-renderer-backgrounding'
        ])
        for name, viewport in PROFILES:
          context=browser.new_context(viewport=viewport, service_workers='block')
          page=context.new_page(); messages=[]
          page.on('console', lambda msg: messages.append({'type':msg.type,'text':msg.text}) if msg.type in {'error','warning'} else None)
          page.on('pageerror', lambda err: messages.append({'type':'pageerror','text':str(err)}))
          page.set_content(html, wait_until='domcontentloaded', timeout=30000)
          page.wait_for_function("document.body.dataset.webglReady === 'true' || document.body.dataset.webglReady === 'error'", timeout=10000)
          report=page.evaluate('window.__webglReport || {available:false,error:window.__webglError||"sem relatório"}')
          page.screenshot(path=str(shots/f'{name}-webgl-pilot.png'), full_page=True)
          # Segundo desenho após alterar o tamanho valida viewport e contexto persistente.
          page.set_viewport_size({'width': max(320, viewport['width']-80), 'height': max(600, viewport['height']-60)})
          resize_ok=page.evaluate("() => { const c=document.querySelector('canvas'); c.width=320;c.height=180; const gl=c.getContext('webgl2')||c.getContext('webgl'); return !!gl && gl.drawingBufferWidth===320 && gl.drawingBufferHeight===180; }")
          passed=bool(report.get('available') and report.get('drawPassed') and report.get('shaderPassed') and report.get('recovery',{}).get('restored') and resize_ok and not messages)
          profiles.append({'profile':name,'viewport':viewport,'report':report,'resizePassed':resize_ok,'messages':messages,'passed':passed})
          context.close()
        browser.close()
    finally:
      xvfb.terminate()
      try: xvfb.wait(timeout=2)
      except subprocess.TimeoutExpired: xvfb.kill()
    result={'schemaVersion':1,'generatedAt':datetime.now(timezone.utc).isoformat(),'version':'0.4.5','mode':'xvfb-swiftshader-webgl-pilot','scope':'Contexto, shaders, desenho, pixel, resize e perda/restauração. Não representa GPU física.','profiles':profiles,'passed':all(p['passed'] for p in profiles)}
    output.parent.mkdir(parents=True,exist_ok=True); output.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'passed':result['passed'],'output':str(output)},ensure_ascii=False))
    return 0 if result['passed'] else 1

if __name__=='__main__': raise SystemExit(main())
