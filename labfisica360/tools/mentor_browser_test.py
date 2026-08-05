#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright

MIME={'.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.glb':'model/gltf-binary','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'}

def instrument_html(root:Path)->str:
    src=(root/'index.html').read_text(encoding='utf-8')
    seed={'fisica-imersiva-360.settings.v12':json.dumps({'force2d':True,'postProcessing':False,'sound':False,'reduceMotion':True,'experienceMode':'guided','tutorialAutoStart':False,'allowRemoteThree':False,'learningMode':'free','mentorId':None})}
    bootstrap=f'''<base href="https://fisica.test/"><script>(()=>{{window.__TEST_ISSUES__=[];addEventListener('fisica:issue',e=>window.__TEST_ISSUES__.push(e.detail));const store=new Map(Object.entries({json.dumps(seed)}));const storage={{getItem:k=>store.has(String(k))?store.get(String(k)):null,setItem:(k,v)=>store.set(String(k),String(v)),removeItem:k=>store.delete(String(k)),clear:()=>store.clear(),key:i=>Array.from(store.keys())[i]||null,get length(){{return store.size}}}};Object.defineProperty(window,'localStorage',{{value:storage}});history.pushState=()=>{{}};history.replaceState=()=>{{}};window.alert=()=>{{}};window.confirm=()=>true;if(!window.ResizeObserver)window.ResizeObserver=class{{observe(){{}}disconnect(){{}}}};if(!window.IntersectionObserver)window.IntersectionObserver=class{{constructor(cb){{this.cb=cb}}observe(t){{this.cb([{{isIntersecting:true,target:t}}])}}disconnect(){{}}}};}})();</script>'''
    return src.replace('<head>','<head>'+bootstrap,1)

def set_input(page, selector, value):
    page.locator(selector).evaluate("(el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}", value)
    page.wait_for_timeout(160)

def check_highlight(page, selector, highlighted):
    page.wait_for_selector(selector, timeout=7000)
    highlighted.append(page.locator(selector).evaluate("el=>el.classList.contains('mentor-guided-target')"))

def login(page, name):
    page.locator('#btn-student-session').click()
    page.locator('#student-name').fill(name)
    page.locator('#student-class').fill('2DS')
    page.locator('#student-shift').select_option('manha')
    page.locator('#student-pin').fill('2026')
    page.locator('#student-login').click()
    page.locator('#student-session-dialog .modal__head button').click()

def complete_curie_thermal(page, highlighted):
    check_highlight(page, '[data-thermal-mode="calorimetry"]', highlighted)
    page.locator('[data-thermal-mode="calorimetry"]').click(); page.wait_for_timeout(160)
    check_highlight(page, '[data-param="coldSpecificHeat"]', highlighted)
    set_input(page, '[data-param="coldSpecificHeat"]', 3800)
    check_highlight(page, '[data-param="hotTemperature"]', highlighted)
    set_input(page, '[data-param="hotTemperature"]', 110)
    page.wait_for_selector('[data-mentor-manual]:not([hidden])'); page.locator('[data-mentor-manual]').click(); page.wait_for_timeout(220)

def complete_tesla_magnetism(page, highlighted):
    page.locator('[data-route="home"]').first.click(); page.wait_for_function("window.__FISICA_DEBUG__.getCurrentRoute()==='home'",timeout=15000)
    page.locator('[data-open-lab="magnetism"]').click(); page.wait_for_function("window.__FISICA_DEBUG__.getCurrentRoute()==='magnetism'",timeout=20000); page.wait_for_timeout(450)
    check_highlight(page, '[data-mag-mode="transformer"]', highlighted)
    page.locator('[data-mag-mode="transformer"]').click(); page.wait_for_timeout(160)
    check_highlight(page, '[data-param="primaryTurns"]', highlighted)
    set_input(page, '[data-param="primaryTurns"]', 900)
    check_highlight(page, '[data-param="secondaryTurns"]', highlighted)
    set_input(page, '[data-param="secondaryTurns"]', 1200)
    page.wait_for_selector('[data-mentor-manual]:not([hidden])'); page.locator('[data-mentor-manual]').click(); page.wait_for_timeout(220)

def run_profile(browser,root:Path,name:str,viewport:dict,outdir:Path,mentor_id:str):
    context=browser.new_context(viewport=viewport,service_workers='block')
    page=context.new_page(); requests=[]; errors=[]
    def fulfill(route):
        url=route.request.url; path='/'+url.split('fisica.test',1)[-1].split('?',1)[0].split('#',1)[0].lstrip('/'); requests.append(path)
        fp=(root/path.lstrip('/')).resolve()
        if not str(fp).startswith(str(root)) or not fp.is_file(): route.fulfill(status=404,body='not found'); return
        route.fulfill(status=200,path=str(fp),content_type=MIME.get(fp.suffix,'application/octet-stream'))
    page.route('https://fisica.test/**',fulfill)
    page.on('console',lambda m: errors.append({'type':m.type,'text':m.text}) if m.type in {'error','warning'} else None)
    page.on('pageerror',lambda e: errors.append({'type':'pageerror','text':str(e)}))
    page.set_content(instrument_html(root),wait_until='domcontentloaded',timeout=30000)
    page.wait_for_function("document.body.dataset.appReady==='true'",timeout=15000)
    initial=list(requests); mentor_initial=[p for p in initial if '/mentors/' in p or p.endswith('/css/mentor-guided.css')]
    login(page, f'Aluno {mentor_id.title()}')
    page.locator('[data-home-mentors]').click(); page.wait_for_selector('#mentor-selector-dialog[open]')
    mentor_cards=page.locator('[data-mentor-card]').count()
    route_items=page.locator(f'[data-mentor-card="{mentor_id}"] ol li').count()
    page.locator(f'[data-select-mentor="{mentor_id}"]').click()
    expected='thermal' if mentor_id=='curie' else 'ohm'
    page.wait_for_function("r=>window.__FISICA_DEBUG__.getCurrentRoute()===r",arg=expected,timeout=20000)
    page.wait_for_selector('.mentor-hud:not([hidden])'); page.wait_for_timeout(550)
    mentor_requests=[p for p in requests if '/mentors/' in p or p.endswith('/css/mentor-guided.css')]
    highlighted=[]
    if mentor_id=='curie': complete_curie_thermal(page, highlighted)
    else: complete_tesla_magnetism(page, highlighted)
    completed='Experiência concluída' in page.locator('[data-mentor-step-title]').inner_text()
    guided_session=page.evaluate("window.__FISICA_DEBUG__.getStudentSession()")
    steps=guided_session.get('session',{}).get('learning',{}).get('mentorSteps',[]) if guided_session.get('session') else []
    route=page.evaluate("window.__FISICA_DEBUG__.getCurrentRoute()")
    page.screenshot(path=str(outdir/f'{name}-mentor-{mentor_id}.png'),full_page=True)
    page.locator('[data-mentor-free]').click(); page.wait_for_timeout(150)
    free_mode=page.evaluate("document.body.classList.contains('learning-mode-free')")
    hud_hidden=page.locator('.mentor-hud').is_hidden()
    overflow=page.evaluate("document.documentElement.scrollWidth<=window.innerWidth+7")
    result={'profile':name,'viewport':viewport,'mentor':mentor_id,'route':route,'passed':not mentor_initial and mentor_cards==6 and route_items==5 and len(mentor_requests)>=7 and all(highlighted) and completed and len(steps)>=4 and free_mode and hud_hidden and overflow and not errors,'initialMentorRequests':mentor_initial,'mentorRequests':mentor_requests,'mentorCards':mentor_cards,'routeItems':route_items,'highlighted':highlighted,'completed':completed,'sessionMentorEvents':len(steps),'freeMode':free_mode,'hudHidden':hud_hidden,'overflowOk':overflow,'errors':errors}
    context.close(); return result

def main():
    root=Path(__file__).resolve().parents[1]; out=root/'validation/r9-mentor-browser.json'; shots=root/'validation/screenshots'; shots.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
        profiles=[run_profile(browser,root,'desktop',{'width':1365,'height':768},shots,'curie'),run_profile(browser,root,'mobile',{'width':390,'height':844},shots,'tesla')]
        browser.close()
    report={'schemaVersion':2,'version':'0.4.9','generatedAt':datetime.now(timezone.utc).isoformat(),'scope':'Seis mentores, expansão para Termofluidos e Eletromagnetismo, destaques, progressão, sessão, modo livre e mobile.','profiles':profiles,'passed':all(p['passed'] for p in profiles)}
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8'); print(json.dumps({'passed':report['passed'],'output':str(out)},ensure_ascii=False)); return 0 if report['passed'] else 1
if __name__=='__main__': raise SystemExit(main())
