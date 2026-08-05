#!/usr/bin/env python3
"""Validação real do portal modular com recursos servidos por interceptação.

O navegador do ambiente bloqueia localhost. A página é montada em about:blank,
mas CSS e módulos ES são atendidos por Playwright em um domínio virtual. Assim,
dynamic import, CSS por rota e o grafo real de módulos continuam sendo exercitados.
WebGL é mantido em modo 2D seguro; o foco é carregamento sob demanda e sessão.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright

MIME = {
    '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
    '.webmanifest': 'application/manifest+json', '.glb': 'model/gltf-binary',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
}
LAB_MODULES = {
    '/js/modules/hall.js', '/js/modules/coulomb.js', '/js/modules/ohm.js',
    '/js/modules/magnetism.js', '/js/modules/energy.js', '/js/modules/mechanics.js',
    '/js/modules/waves.js', '/js/modules/thermal.js', '/js/modules/advanced.js',
}
HEAVY_MARKERS = (
    '/vendor/three/', '.glb', '/css/electrical-bench.css', '/css/hall-premium.css',
    '/css/magnetism-lab.css', '/css/energy-lab.css', '/css/mechanics-lab.css',
    '/css/waves-lab.css', '/css/thermal-lab.css', '/css/advanced-lab.css',
)


def instrument_html(root: Path) -> str:
    source = (root / 'index.html').read_text(encoding='utf-8')
    seed = {
        'fisica-imersiva-360.settings.v12': json.dumps({
            'force2d': True, 'postProcessing': False, 'sound': False,
            'reduceMotion': True, 'experienceMode': 'guided',
            'tutorialAutoStart': False, 'allowRemoteThree': False,
        })
    }
    bootstrap = f"""
<base href="https://fisica.test/">
<script>
(() => {{
  window.__TEST_ISSUES__ = [];
  addEventListener('fisica:issue', event => window.__TEST_ISSUES__.push(event.detail));
  const store = new Map(Object.entries({json.dumps(seed)}));
  const storage = {{
    getItem: key => store.has(String(key)) ? store.get(String(key)) : null,
    setItem: (key, value) => store.set(String(key), String(value)),
    removeItem: key => store.delete(String(key)), clear: () => store.clear(),
    key: index => Array.from(store.keys())[index] || null,
    get length() {{ return store.size; }}
  }};
  Object.defineProperty(window, 'localStorage', {{ value: storage }});
  history.pushState = () => {{}};
  history.replaceState = () => {{}};
  window.alert = () => {{}};
  window.confirm = () => true;
  if (!window.ResizeObserver) window.ResizeObserver = class {{ observe(){{}} disconnect(){{}} }};
  if (!window.IntersectionObserver) window.IntersectionObserver = class {{
    constructor(callback){{ this.callback=callback; }}
    observe(target){{ this.callback([{{isIntersecting:true,target}}]); }}
    disconnect(){{}}
  }};
}})();
</script>
"""
    return source.replace('<head>', '<head>' + bootstrap, 1)


def wait_route(page, route: str, timeout: int = 15000) -> None:
    page.wait_for_function(
        "route => window.__FISICA_DEBUG__?.getCurrentRoute() === route && document.body.dataset.currentRoute === route",
        arg=route, timeout=timeout,
    )
    page.wait_for_timeout(350)


def resource_paths(page) -> list[str]:
    return page.evaluate("() => performance.getEntriesByType('resource').map(e => new URL(e.name).pathname)")


def visible_overflow(page) -> list[dict[str, Any]]:
    return page.evaluate("""() => [...document.querySelectorAll('body *')]
      .filter(el => {
        const s=getComputedStyle(el), r=el.getBoundingClientRect();
        if (s.display==='none' || s.visibility==='hidden' || r.width<=0 || r.height<=0) return false;
        if (!(r.right > innerWidth + 7 || r.left < -7)) return false;
        let p=el.parentElement;
        while(p){
          const ps=getComputedStyle(p), pr=p.getBoundingClientRect();
          if (['hidden','clip','auto','scroll'].includes(ps.overflowX) &&
              (r.right > pr.right + 1 || r.left < pr.left - 1)) return false;
          p=p.parentElement;
        }
        return true;
      }).slice(0,10).map(el => ({tag:el.tagName, cls:String(el.className).slice(0,100), text:(el.textContent||'').trim().slice(0,80)}))""")


def run_profile(browser, root: Path, profile: str, viewport: dict[str, int], output_dir: Path) -> dict[str, Any]:
    context = browser.new_context(viewport=viewport, service_workers='block')
    page = context.new_page()
    request_log: list[str] = []
    browser_errors: list[dict[str, str]] = []

    def fulfill(route):
        url = route.request.url
        path = '/' + url.split('fisica.test', 1)[-1].split('?', 1)[0].split('#', 1)[0].lstrip('/')
        request_log.append(path)
        file_path = (root / path.lstrip('/')).resolve()
        if not str(file_path).startswith(str(root)) or not file_path.is_file():
            route.fulfill(status=404, body='not found')
            return
        route.fulfill(status=200, path=str(file_path), content_type=MIME.get(file_path.suffix, 'application/octet-stream'))

    page.route('https://fisica.test/**', fulfill)
    page.on('console', lambda message: browser_errors.append({'kind':'console','type':message.type,'text':message.text}) if message.type in {'error','warning'} else None)
    page.on('pageerror', lambda error: browser_errors.append({'kind':'pageerror','type':'error','text':str(error)}))
    page.set_content(instrument_html(root), wait_until='domcontentloaded', timeout=30000)
    page.wait_for_function("document.body.dataset.appReady === 'true'", timeout=15000)
    wait_route(page, 'home')

    initial_requests = list(request_log)
    initial_resources = resource_paths(page)
    initial_lab_modules = sorted(set(initial_requests).intersection(LAB_MODULES))
    initial_heavy = sorted({path for path in initial_requests if any(marker in path for marker in HEAVY_MARKERS)})
    initial_canvases = page.locator('canvas.physics-webgl, canvas[data-webgl-canvas]').count()
    initial_route_styles = page.locator('link[data-route-style]').count()

    output_dir.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(output_dir / f'{profile}-portal-home.png'), full_page=True)

    # Sessão do estudante.
    page.locator('#btn-student-session').click()
    page.locator('#student-name').fill('Estudante Teste')
    page.locator('#student-class').fill('2DS A')
    page.locator('#student-shift').select_option('manha')
    page.locator('#student-pin').fill('2026')
    page.locator('#student-login').click()
    page.wait_for_timeout(250)
    logged_in = page.evaluate("window.__FISICA_DEBUG__.getStudentSession().loggedIn")
    page.locator('#student-session-dialog .modal__head button').click()
    page.wait_for_timeout(100)

    # Eletrostática sob demanda.
    before_coulomb = len(request_log)
    page.locator('[data-open-lab="coulomb"]').click()
    wait_route(page, 'coulomb', 20000)
    coulomb_requests = request_log[before_coulomb:]
    coulomb_loaded = '/js/modules/coulomb.js' in coulomb_requests
    coulomb_styles = page.evaluate("() => [...document.querySelectorAll('link[data-route-style]')].map(link => new URL(link.href).pathname)")
    page.screenshot(path=str(output_dir / f'{profile}-coulomb-demand.png'), full_page=True)

    # Volta ao portal e verifica limpeza da rota.
    page.locator('[data-route="home"]').first.click()
    wait_route(page, 'home', 20000)
    cleanup_report = page.evaluate("window.__FISICA_DEBUG__.getRouteResources()")
    styles_after_home = page.locator('link[data-route-style]').count()
    canvases_after_home = page.locator('canvas.physics-webgl, canvas[data-webgl-canvas]').count()

    # Eletricidade deve baixar só agora.
    before_ohm = len(request_log)
    page.locator('[data-open-lab="ohm"]').click()
    wait_route(page, 'ohm', 25000)
    ohm_requests = request_log[before_ohm:]
    ohm_loaded = '/js/modules/ohm.js' in ohm_requests
    page.screenshot(path=str(output_dir / f'{profile}-ohm-demand.png'), full_page=True)
    page.locator('[data-route="home"]').first.click()
    wait_route(page, 'home', 25000)

    session_snapshot = page.evaluate("window.__FISICA_DEBUG__.getStudentSession()")
    tracked_routes = {item['route']: item for item in session_snapshot['routes']}
    issues = page.evaluate('window.__TEST_ISSUES__')
    overflow = visible_overflow(page)

    route_releases = [entry for entry in cleanup_report['entries'] if 'unloadedAt' in entry]
    passed = all([
        not initial_lab_modules, not initial_heavy, initial_canvases == 0, initial_route_styles == 0,
        logged_in, coulomb_loaded, ohm_loaded, styles_after_home == 0, canvases_after_home == 0,
        cleanup_report['activeRoute'] == 'home',
        any(entry['route'] == 'coulomb' and entry.get('activeRuntimes') == 0 for entry in route_releases),
        'coulomb' in tracked_routes, 'ohm' in tracked_routes,
        not browser_errors, not overflow,
    ])

    result = {
        'profile': profile, 'viewport': viewport, 'passed': passed,
        'initial': {
            'requestCount': len(initial_requests), 'resourceCount': len(initial_resources),
            'labModules': initial_lab_modules, 'heavyAssets': initial_heavy,
            'webglCanvasCount': initial_canvases, 'routeStyleCount': initial_route_styles,
        },
        'coulomb': {'loadedOnDemand': coulomb_loaded, 'newRequests': coulomb_requests, 'routeStyles': coulomb_styles},
        'ohm': {'loadedOnDemand': ohm_loaded, 'newRequestCount': len(ohm_requests)},
        'cleanup': {
            'stylesAfterHome': styles_after_home, 'canvasesAfterHome': canvases_after_home,
            'activeRoute': cleanup_report['activeRoute'], 'releaseEntries': route_releases,
        },
        'session': {
            'loggedIn': session_snapshot['loggedIn'], 'profile': session_snapshot['profile'],
            'trackedRoutes': sorted(tracked_routes), 'labActiveSeconds': session_snapshot['labActiveSeconds'],
        },
        'issues': issues, 'browserErrors': browser_errors, 'horizontalOverflow': overflow,
    }
    context.close()
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--output', type=Path, default=None)
    args = parser.parse_args()
    root = args.root.resolve()
    output = (args.output or root / 'validation/r8-modular-browser.json').resolve()
    screenshot_dir = output.parent / 'screenshots'

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path='/usr/bin/chromium', headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        )
        profiles = [
            run_profile(browser, root, 'desktop', {'width': 1365, 'height': 768}, screenshot_dir),
            run_profile(browser, root, 'mobile', {'width': 390, 'height': 844}, screenshot_dir),
        ]
        browser.close()

    report = {
        'schemaVersion': 1,
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'version': '0.4.9',
        'mode': 'virtual-origin-es-modules-force-2d',
        'scope': 'Portal inicial, imports dinâmicos, CSS por rota, limpeza de recursos, sessão e responsividade.',
        'profiles': profiles,
        'passed': all(item['passed'] for item in profiles),
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'passed': report['passed'], 'output': str(output)}, ensure_ascii=False))
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
