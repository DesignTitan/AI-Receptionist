// Rebuild the HTML/CSS product illustrations used by the homepage.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = resolve(import.meta.dirname, '..');
const source = join(root, 'scrollcraft/builds/receptionist');
const temporary = mkdtempSync(join(tmpdir(), 'receptionist-previews-'));
try {
  const outputs = [
    ...['book', 'after', 'noshow', 'voice'].map(key => [key, 'stage', `06-${key}-p.webp`]),
    ...['call', 'record', 'flag'].flatMap(key => [[key, 'card', `04-${key}-p.webp`], [key, 'wide', `04-${key}-p-w.webp`]]),
  ];
  for (const [key, mode, filename] of outputs) {
    const html = join(temporary, 'preview.html');
    execFileSync('python3', [join(source, 'ref.py'), html, 'D', key, mode, 'panel']);
    writeFileSync(html, readFileSync(html, 'utf8').replace('<head>', `<head><base href="${pathToFileURL(source + '/').href}">`));
    execFileSync(process.execPath, [join(source, 'render.mjs'), html, join(root, 'public/scrollcraft', filename), mode, 'png'], { cwd: root, stdio: 'inherit' });
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
