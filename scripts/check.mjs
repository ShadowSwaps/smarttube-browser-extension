import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const manifest = JSON.parse(await readFile('extension/manifest.json','utf8'));
assert.equal(manifest.manifest_version,3);
assert.deepEqual(manifest.permissions,['storage','activeTab']);
assert.deepEqual(manifest.host_permissions,['https://sponsor.ajay.app/*']);
for (const file of await readdir('extension')) {
  if (file.endsWith('.js')) execFileSync(process.execPath,['--check',`extension/${file}`]);
  if (file.endsWith('.html')) {
    const html = await readFile(`extension/${file}`,'utf8');
    assert(!/on(?:click|load|change)=/.test(html),'No inline event handlers');
    assert(!/<script[^>]+src=["']https?:/.test(html),'No remote executable scripts');
  }
}
console.log('Manifest permissions, JavaScript syntax and packaged script checks passed.');
