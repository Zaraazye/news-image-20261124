// Entry program for news-image-20261124 (Node 22, standard library only).
// The image beside this file is the entry; this program copies it to the
// output directory as entry.png. It runs twice in the grader and both runs
// write the same bytes, because the source image never changes.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The grader runs this program twice (live, then replay) and both runs must
// produce byte-identical output. Copying fixed bytes guarantees that: no
// timestamps, no randomness, no network — the same source image every time.
function resolveOutputDir() {
  // In the grader the harness sets MAKEFUN_OUTPUT_DIR. Locally, /output is
  // the default; if it cannot be created (no permission), fall back to an
  // `out` directory beside this file so `node main.ts` still works.
  const candidates = [
    process.env.MAKEFUN_OUTPUT_DIR,
    '/output',
    join(dirname(fileURLToPath(import.meta.url)), 'out'),
  ];
  for (const dir of candidates) {
    if (!dir) continue;
    try {
      mkdirSync(dir, { recursive: true });
      return dir;
    } catch {
      // try the next candidate
    }
  }
  throw new Error('no writable output directory found');
}

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolveOutputDir();
const bytes = readFileSync(join(here, 'entry.png'));
// Gate self-check: the entry must be a whole PNG of at most 1 MiB, or the
// sealed scorer would list it 0. Fail loudly instead of writing bad bytes.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error('entry.png is not a PNG');
}
if (bytes.length > 1048576) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB gate`);
}
writeFileSync(join(outDir, 'entry.png'), bytes);
