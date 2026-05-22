#!/bin/bash
set -e
python3 - <<'PYEOF'
import os, json
from pathlib import Path

def parse_frontmatter(text):
    if not text.startswith('---'):
        return {}
    end = text.find('---', 3)
    if end == -1:
        return {}
    meta = {}
    for line in text[3:end].strip().splitlines():
        if ':' not in line:
            continue
        k, _, v = line.partition(':')
        k = k.strip()
        v = v.strip().strip('"\'')
        if v.startswith('[') and v.endswith(']'):
            meta[k] = [s.strip().strip('"\'') for s in v[1:-1].split(',') if s.strip()]
        else:
            meta[k] = v
    return meta

for ctype in ['news', 'team', 'activities', 'sponsorship']:
    folder = Path(f'content/{ctype}')
    if not folder.exists():
        continue
    items = []
    for f in sorted(folder.glob('*.md'), reverse=True):
        meta = parse_frontmatter(f.read_text(encoding='utf-8'))
        meta['_slug'] = f.stem
        meta['_file'] = f.name
        items.append(meta)
    (folder / 'index.json').write_text(
        json.dumps(items, ensure_ascii=False, indent=2),
        encoding='utf-8'
    )
    print(f'{ctype}: {len(items)} items')
PYEOF
