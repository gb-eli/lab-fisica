#!/usr/bin/env python3
"""Playtest estrutural em navegador sem servidor HTTP.

O ambiente de validação pode bloquear localhost. O script empacota os módulos ES
em memória, injeta o HTML/CSS em about:blank e exercita a plataforma no modo 2D
seguro. Isso testa DOM, navegação, controles, limpeza de rotas e responsividade.
Não substitui o playtest WebGL em hardware real.
"""
from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright

IMPORT_RE = re.compile(r"import\s*\{([\s\S]*?)\}\s*from\s*['\"]([^'\"]+)['\"]\s*;", re.M)
EXPORT_FUNCTION_RE = re.compile(r"export\s+(async\s+)?function\s+([A-Za-z_$][\w$]*)")
EXPORT_CLASS_RE = re.compile(r"export\s+class\s+([A-Za-z_$][\w$]*)")
EXPORT_VALUE_RE = re.compile(r"export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)")
ROUTES = ['hall', 'coulomb', 'ohm', 'magnetism', 'energy', 'mechanics', 'waves', 'thermal', 'advanced', 'roadmap']
VIEW_NAMES = ['overview', 'scene', 'controls', 'results', 'support']


def build_bundle(root: Path) -> str:
    modules: dict[str, str] = {}
    seen: set[Path] = set()

    def module_key(path: Path) -> str:
        return str(path.relative_to(root)).replace('\\', '/')

    def resolve(base: Path, specifier: str) -> Path:
        path = (base.parent / specifier).resolve()
        if path.suffix == '':
            path = path.with_suffix('.js')
        if not str(path).startswith(str(root)):
            raise ValueError(f'Importação fora do projeto: {specifier}')
        return path

    def transform(path: Path) -> None:
        path = path.resolve()
        if path in seen:
            return
        seen.add(path)
        source = path.read_text(encoding='utf-8')

        def replace_import(match: re.Match[str]) -> str:
            raw_names, specifier = match.group(1).strip(), match.group(2)
            dependency = resolve(path, specifier)
            transform(dependency)
            names: list[str] = []
            for raw in raw_names.split(','):
                raw = raw.strip()
                if not raw:
                    continue
                if ' as ' in raw:
                    original, alias = [part.strip() for part in raw.split(' as ', 1)]
                    names.append(f'{original}: {alias}')
                else:
                    names.append(raw)
            return f"const {{ {', '.join(names)} }} = __require__({json.dumps(module_key(dependency))});"

        source = IMPORT_RE.sub(replace_import, source)
        exports: list[str] = []

        def replace_function(match: re.Match[str]) -> str:
            exports.append(match.group(2))
            return f"{match.group(1) or ''}function {match.group(2)}"

        def replace_class(match: re.Match[str]) -> str:
            exports.append(match.group(1))
            return f'class {match.group(1)}'

        def replace_value(match: re.Match[str]) -> str:
            exports.append(match.group(2))
            return f'{match.group(1)} {match.group(2)}'

        source = EXPORT_FUNCTION_RE.sub(replace_function, source)
        source = EXPORT_CLASS_RE.sub(replace_class, source)
        source = EXPORT_VALUE_RE.sub(replace_value, source)
        source = source.replace('import.meta.url', json.dumps(f'https://offline.invalid/{module_key(path)}'))
        source += '\n' + '\n'.join(f'exports.{name} = {name};' for name in dict.fromkeys(exports))
        modules[module_key(path)] = source

    transform(root / 'js/app.js')
    wrappers = '\n'.join(
        f"__modules__[{json.dumps(name)}]=function(exports,__require__){{\n{source}\n}};"
        for name, source in modules.items()
    )
    return f"""
(function(){{
  const __modules__={{}}, __cache__={{}};
  {wrappers}
  function __require__(id){{
    if (__cache__[id]) return __cache__[id].exports;
    const module={{exports:{{}}}};
    __cache__[id]=module;
    if (!__modules__[id]) throw new Error('Módulo ausente: '+id);
    __modules__[id](module.exports,__require__);
    return module.exports;
  }}
  __require__('js/app.js');
}})();
"""


def build_html(root: Path, bundle: str) -> str:
    source = (root / 'index.html').read_text(encoding='utf-8')
    source = re.sub(r'<link[^>]+rel="manifest"[^>]*>', '', source)
    def inline_stylesheet(match: re.Match[str]) -> str:
        href_match = re.search(r'href="([^"]+)"', match.group(0))
        if not href_match:
            return ''
        path = (root / href_match.group(1)).resolve()
        return f'<style data-source="{href_match.group(1)}">{path.read_text(encoding="utf-8")}</style>'
    source = re.sub(r'<link[^>]+rel="stylesheet"[^>]*>', inline_stylesheet, source)
    source = re.sub(r'<script\s+type="module"\s+src="js/app.js"></script>', '', source)
    polyfill = """
<script>
(() => {
  const seed = {'fisica-imersiva-360.settings.v9': JSON.stringify({
    force2d: true, postProcessing: false, sound: false, reduceMotion: true,
    experienceMode: 'guided', tutorialAutoStart: false
  })};
  const store = new Map(Object.entries(seed));
  const storage = {
    getItem: key => store.has(String(key)) ? store.get(String(key)) : null,
    setItem: (key, value) => store.set(String(key), String(value)),
    removeItem: key => store.delete(String(key)), clear: () => store.clear(),
    key: index => Array.from(store.keys())[index] || null,
    get length() { return store.size; }
  };
  Object.defineProperty(window, 'localStorage', { value: new Proxy(storage, {
    ownKeys: () => Array.from(store.keys()),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
  })});
  if (!window.matchMedia) window.matchMedia = () => ({ matches:false, addEventListener(){}, removeEventListener(){} });
  if (!window.ResizeObserver) window.ResizeObserver = class { observe(){} disconnect(){} };
  if (!window.IntersectionObserver) window.IntersectionObserver = class {
    constructor(callback){ this.callback=callback; }
    observe(target){ this.callback([{isIntersecting:true,target}]); }
    disconnect(){}
  };
  if (!HTMLDialogElement.prototype.showModal) HTMLDialogElement.prototype.showModal = function(){ this.open=true; };
  if (!HTMLDialogElement.prototype.close) HTMLDialogElement.prototype.close = function(){ this.open=false; };
  window.confirm = () => true;
  window.alert = () => {};
})();
</script>
"""
    source = source.replace('</head>', f'{polyfill}</head>')
    return source.replace('</body>', f'<script>{bundle}</script></body>')


def route_to(page, route: str) -> None:
    page.evaluate("route => { location.hash = '#' + route; window.dispatchEvent(new HashChangeEvent('hashchange')); }", route)
    page.wait_for_function("route => document.body.dataset.currentRoute === route", arg=route, timeout=5000)
    page.wait_for_timeout(120)


def visible_overflow(page) -> list[dict[str, Any]]:
    return page.evaluate("""() => [...document.querySelectorAll('body *')]
      .filter(el => {
        const s=getComputedStyle(el), r=el.getBoundingClientRect();
        if (s.display==='none' || s.visibility==='hidden' || r.width<=0 || r.height<=0) return false;
        if (!(r.right > innerWidth + 6 || r.left < -6)) return false;
        let parent=el.parentElement;
        while(parent){
          const ps=getComputedStyle(parent), pr=parent.getBoundingClientRect();
          if (['hidden','clip','auto','scroll'].includes(ps.overflowX) &&
              (r.right > pr.right + 1 || r.left < pr.left - 1)) return false;
          parent=parent.parentElement;
        }
        return true;
      })
      .slice(0,12)
      .map(el => ({tag:el.tagName, cls:el.className?.toString().slice(0,100)||'', text:(el.textContent||'').trim().slice(0,80), rect:el.getBoundingClientRect().toJSON()}))""")


def exercise_route(page, route: str) -> dict[str, Any]:
    route_to(page, route)
    before_errors = page.evaluate("() => document.querySelectorAll('.route-error,.boot-error').length")
    title = page.locator('#view h1, #view h2').first.text_content() if page.locator('#view h1, #view h2').count() else ''
    view_results: dict[str, bool] = {}
    for name in VIEW_NAMES:
        button = page.locator(f'[data-experience-view="{name}"]')
        if button.count() and button.first.is_visible():
            button.first.click()
            page.wait_for_timeout(40)
            view_results[name] = page.evaluate("name => document.querySelector('.experience-route')?.dataset.experienceView === name", name)
    select = page.locator('[data-experience-scenario-slot] select')
    scenario_changed = None
    if select.count() and select.first.is_visible():
        options = select.first.locator('option').count()
        if options > 1:
            value = select.first.locator('option').nth(1).get_attribute('value')
            select.first.select_option(value)
            page.wait_for_timeout(80)
            scenario_changed = select.first.input_value() == value
    restart_selector = '[data-mechanics-restart],[data-waves-restart],[data-thermal-restart],[data-energy-restart],[data-mag-restart],[data-advanced-restart],[data-reset],[data-action="reset"]'
    restart_clicked = False

    def click_visible_restart() -> bool:
        candidates = page.locator(restart_selector)
        for index in range(candidates.count()):
            candidate = candidates.nth(index)
            if candidate.is_visible():
                try:
                    candidate.scroll_into_view_if_needed(timeout=800)
                    candidate.click(timeout=1500)
                    page.wait_for_timeout(60)
                    return True
                except Exception:
                    continue
        return False

    # Os módulos posicionam Reiniciar em áreas diferentes. Teste a cena primeiro
    # e, quando necessário, a área de controles, sempre por clique visível.
    scene_button = page.locator('[data-experience-view="scene"]')
    if scene_button.count() and scene_button.first.is_visible():
        scene_button.first.click()
        page.wait_for_timeout(40)
    restart_clicked = click_visible_restart()
    if not restart_clicked:
        controls_button = page.locator('[data-experience-view="controls"]')
        if controls_button.count() and controls_button.first.is_visible():
            controls_button.first.click()
            page.wait_for_timeout(40)
        restart_clicked = click_visible_restart()
    return {
        'route': route,
        'title': (title or '').strip(),
        'routeErrorCount': before_errors,
        'viewSwitches': view_results,
        'scenarioChanged': scenario_changed,
        'restartClicked': restart_clicked,
        'horizontalOverflow': visible_overflow(page),
        'bodyScrollWidth': page.evaluate('document.documentElement.scrollWidth'),
        'viewportWidth': page.evaluate('innerWidth'),
    }


def run_profile(browser, html: str, profile: str, viewport: dict[str, int], screenshots: Path) -> dict[str, Any]:
    context = browser.new_context(viewport=viewport, service_workers='block')
    page = context.new_page()
    errors: list[dict[str, str]] = []
    page.on('console', lambda message: errors.append({'kind':'console','type':message.type,'text':message.text}) if message.type in {'error','warning'} else None)
    page.on('pageerror', lambda error: errors.append({'kind':'pageerror','type':'error','text':str(error)}))
    page.set_content(html, wait_until='domcontentloaded', timeout=30000)
    page.wait_for_function("document.body.dataset.appReady === 'true'", timeout=10000)
    results = [exercise_route(page, route) for route in ROUTES]
    # Trocas rápidas exercitam descarte assíncrono e limpeza de rota.
    for route in ['mechanics', 'waves', 'thermal', 'hall', 'ohm', 'roadmap']:
        route_to(page, route)
    page.wait_for_timeout(250)
    screenshots.mkdir(parents=True, exist_ok=True)
    for route in ['hall', 'coulomb', 'ohm', 'roadmap']:
        route_to(page, route)
        page.screenshot(path=str(screenshots / f'{profile}-{route}.png'), full_page=True)
    page.locator('#btn-settings').click()
    settings_open = page.locator('#settings-dialog').evaluate('(dialog) => dialog.open')
    context.close()
    return {
        'profile': profile,
        'viewport': viewport,
        'routes': results,
        'settingsDialogOpened': settings_open,
        'runtimeMessages': errors,
        'passed': settings_open and not errors and all(item['routeErrorCount'] == 0 for item in results)
          and all(not item['horizontalOverflow'] for item in results),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--output', type=Path, default=None)
    args = parser.parse_args()
    root = args.root.resolve()
    output = (args.output or root / 'validation/r5-browser-smoke.json').resolve()
    screenshots = output.parent / 'screenshots'
    html = build_html(root, build_bundle(root))
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path='/usr/bin/chromium', headless=True,
            args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']
        )
        profiles = [
            run_profile(browser, html, 'desktop', {'width':1365,'height':768}, screenshots),
            run_profile(browser, html, 'mobile', {'width':390,'height':844}, screenshots),
        ]
        browser.close()
    report = {
        'schemaVersion': 1,
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'version': '0.4.4',
        'mode': 'browser-smoke-force-2d',
        'scope': 'DOM, rotas, controles, limpeza, fallback 2D e responsividade. WebGL não validado.',
        'profiles': profiles,
        'passed': all(profile['passed'] for profile in profiles),
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'passed': report['passed'], 'output': str(output)}, ensure_ascii=False))
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
