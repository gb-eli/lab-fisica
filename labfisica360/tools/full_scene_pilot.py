#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, os, subprocess, time
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright
ROUTES=('hall','coulomb','ohm'); PROFILES=(('desktop',{'width':1365,'height':768}),('mobile',{'width':390,'height':844}))
def main()->int:
 p=argparse.ArgumentParser(); p.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1]); p.add_argument('--port',type=int,default=8788); p.add_argument('--allow-remote',action='store_true'); a=p.parse_args(); root=a.root.resolve()
 output=root/'validation/r7-full-scenes.json'; records=[]
 server=subprocess.Popen(['python3','-m','http.server',str(a.port),'--bind','127.0.0.1'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 env=os.environ.copy(); env['DISPLAY']=':98'; xvfb=subprocess.Popen(['Xvfb',':98','-screen','0','1440x1000x24','-ac','+extension','GLX','+render','-noreset'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(.8)
 try:
  with sync_playwright() as pw:
   browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=False,env=env,args=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
   for profile,viewport in PROFILES:
    context=browser.new_context(viewport=viewport,service_workers='block'); page=context.new_page()
    page.add_init_script(f"localStorage.setItem('fisica-imersiva-360.settings.v12', JSON.stringify({{force2d:false,safe3d:true,allowRemoteThree:{str(a.allow_remote).lower()},firstFrameTimeout:9000,tutorialAutoStart:false}}));")
    for route in ROUTES:
     messages=[]
     page.on('console',lambda msg: messages.append({'type':msg.type,'text':msg.text}) if msg.type in {'error','warning'} else None)
     page.on('pageerror',lambda err: messages.append({'type':'pageerror','text':str(err)}))
     try:
      page.goto(f'http://127.0.0.1:{a.port}/index.html#{route}',wait_until='domcontentloaded',timeout=15000)
      page.wait_for_timeout(10000)
      state=page.evaluate("() => ({isWebgl:!!document.querySelector('.is-webgl canvas:not([hidden])'),fallback:!!document.querySelector('.stage--fallback,.is-render-timeout'),currentRoute:document.body.dataset.currentRoute||'',canvasCount:document.querySelectorAll('canvas').length})")
     except Exception as error:
      state={'isWebgl':False,'fallback':False,'navigationBlocked':True,'error':str(error)}
     records.append({'profile':profile,'viewport':viewport,'route':route,'state':state,'messages':messages})
    context.close()
   browser.close()
 finally:
  server.terminate(); xvfb.terminate()
  for proc in (server,xvfb):
   try: proc.wait(timeout=2)
   except subprocess.TimeoutExpired: proc.kill()
 local_ready=all((root/'vendor/three'/name).is_file() for name in ('three.module.min.js','three.core.min.js'))
 ready=sum(1 for r in records if r['state'].get('isWebgl')); nav_blocked=any(r['state'].get('navigationBlocked') for r in records)
 status='approved' if local_ready and ready==len(records) else ('blocked-navigation-policy' if nav_blocked else 'blocked-local-three')
 report={'schemaVersion':1,'version':'0.4.6','generatedAt':datetime.now(timezone.utc).isoformat(),'mode':'local-with-remote-fallback' if a.allow_remote else 'local-only','localVendorReady':local_ready,'routes':list(ROUTES),'records':records,'scenesReady':ready,'expectedScenes':len(records),'passed':status=='approved','status':status}
 output.parent.mkdir(parents=True,exist_ok=True); output.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8'); print(json.dumps({'status':status,'scenesReady':ready,'expected':len(records)},ensure_ascii=False)); return 0
if __name__=='__main__': raise SystemExit(main())
