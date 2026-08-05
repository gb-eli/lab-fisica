#!/usr/bin/env python3
from pathlib import Path
import json
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright
MIME={'.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.glb':'model/gltf-binary','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'}
ROUTES=['mechanics','coulomb','ohm','magnetism','energy','waves','thermal','advanced']
def html(root):
 s=(root/'index.html').read_text(); seed=json.dumps({'fisica-imersiva-360.settings.v12':json.dumps({'force2d':True,'reduceMotion':True,'learningMode':'free','tutorialAutoStart':False,'allowRemoteThree':False})})
 boot=f'''<base href="https://fisica.test/"><script>(()=>{{const m=new Map(Object.entries({seed}));Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>m.get(String(k))??null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),key:i=>[...m.keys()][i]??null,get length(){{return m.size}}}}}});history.pushState=()=>{{}};history.replaceState=()=>{{}};window.alert=()=>{{}};window.confirm=()=>true;if(!window.ResizeObserver)window.ResizeObserver=class{{observe(){{}}disconnect(){{}}}};if(!window.IntersectionObserver)window.IntersectionObserver=class{{constructor(c){{this.c=c}}observe(t){{this.c([{{isIntersecting:true,target:t}}])}}disconnect(){{}}}}}})()</script>'''
 return s.replace('<head>','<head>'+boot,1)
def main():
 root=Path(__file__).resolve().parents[1]; out=root/'validation/r9-mentor-target-coverage.json'; errors=[]; results=[]
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']); page=b.new_page(viewport={'width':1365,'height':768})
  def fulfill(route):
   path='/'+route.request.url.split('fisica.test',1)[-1].split('?',1)[0].split('#',1)[0].lstrip('/'); fp=(root/path.lstrip('/')).resolve()
   route.fulfill(status=200,path=str(fp),content_type=MIME.get(fp.suffix,'application/octet-stream')) if fp.is_file() else route.fulfill(status=404,body='not found')
  page.route('https://fisica.test/**',fulfill); page.on('pageerror',lambda e: errors.append(str(e))); page.set_content(html(root),wait_until='domcontentloaded'); page.wait_for_function("document.body.dataset.appReady==='true'")
  for route_name in ROUTES:
   if page.evaluate("window.__FISICA_DEBUG__.getCurrentRoute()")!='home':
    page.locator('[data-route="home"]').first.click(); page.wait_for_function("window.__FISICA_DEBUG__.getCurrentRoute()==='home'")
   page.locator(f'[data-open-lab="{route_name}"]').click(); page.wait_for_function("r=>window.__FISICA_DEBUG__.getCurrentRoute()===r",arg=route_name,timeout=20000); page.wait_for_timeout(450)
   tracks=page.evaluate("""async route=>{const {MENTOR_TRACKS}=await import('./js/mentors/tracks/core-tracks.js');return Object.entries(MENTOR_TRACKS).flatMap(([mentor,routes])=>routes[route]?[{mentor,steps:routes[route].steps.map(({id,selector,event})=>({id,selector,event}))}]:[])} """,route_name)
   for track in tracks:
    if route_name=='advanced' and track['steps']:
     first=track['steps'][0]['selector']
     if page.locator(first).count():
      page.locator(first).click(); page.wait_for_timeout(80)
    for step in track['steps']:
     results.append({'mentor':track['mentor'],'route':route_name,'id':step['id'],'selector':step['selector'],'exists':page.locator(step['selector']).count()>0})
  b.close()
 report={'schemaVersion':2,'version':'0.4.9','generatedAt':datetime.now(timezone.utc).isoformat(),'routes':ROUTES,'total':len(results),'found':sum(1 for x in results if x['exists']),'missing':[x for x in results if not x['exists']],'errors':errors}; report['passed']=report['found']==report['total'] and not errors; out.write_text(json.dumps(report,ensure_ascii=False,indent=2)); print(json.dumps({'passed':report['passed'],'found':report['found'],'total':report['total'],'missing':len(report['missing'])})); return 0 if report['passed'] else 1
if __name__=='__main__': raise SystemExit(main())
