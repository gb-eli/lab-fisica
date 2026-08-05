#!/usr/bin/env python3
"""Baixa e valida a cópia local do Three.js usada pela plataforma.

O script é determinístico e não altera a versão automaticamente. Em ambientes
sem rede, use --check para obter um diagnóstico legível sem remover arquivos.
"""
from __future__ import annotations
import argparse, hashlib, json, sys, urllib.request
from pathlib import Path

VERSION = '0.184.0'
FILES = {
    'three.module.min.js': f'https://cdn.jsdelivr.net/npm/three@{VERSION}/build/three.module.min.js',
    'three.core.min.js': f'https://cdn.jsdelivr.net/npm/three@{VERSION}/build/three.core.min.js',
}
MIN_SIZE = {'three.module.min.js': 300_000, 'three.core.min.js': 300_000}

def digest(path: Path) -> str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024), b''): h.update(chunk)
    return h.hexdigest()

def validate(root: Path):
    results=[]
    for name,url in FILES.items():
        path=root/name
        exists=path.is_file()
        size=path.stat().st_size if exists else 0
        text=''
        if exists:
            try: text=path.read_text(encoding='utf-8', errors='ignore')[:4000]
            except OSError: pass
        valid=exists and size>=MIN_SIZE[name] and ('Three.js Authors' in text or 'REVISION' in text or name=='three.core.min.js')
        results.append({'file':name,'url':url,'exists':exists,'size':size,'valid':valid,'sha256':digest(path) if valid else None})
    return results

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1]/'vendor/three')
    parser.add_argument('--download',action='store_true')
    parser.add_argument('--check',action='store_true')
    parser.add_argument('--timeout',type=int,default=30)
    args=parser.parse_args(); root=args.root.resolve(); root.mkdir(parents=True,exist_ok=True)
    errors=[]
    if args.download:
        for name,url in FILES.items():
            target=root/name; partial=target.with_suffix(target.suffix+'.part')
            try:
                request=urllib.request.Request(url,headers={'User-Agent':'Fisica-Imersiva-360-vendor/0.4.6'})
                with urllib.request.urlopen(request,timeout=args.timeout) as response, partial.open('wb') as out:
                    while chunk:=response.read(1024*1024): out.write(chunk)
                partial.replace(target)
            except Exception as error:
                partial.unlink(missing_ok=True); errors.append(f'{name}: {error}')
    results=validate(root)
    report={'schemaVersion':1,'threeVersion':VERSION,'ready':all(item['valid'] for item in results),'files':results,'errors':errors}
    (root/'vendor-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if report['ready'] else 2
if __name__=='__main__': raise SystemExit(main())
