// Hourly background summary for PushPulse. Zero dependencies (Node 20+).
// Env: WATCH_REPOS="owner/a,owner/b"  GH_TOKEN (read access)  NTFY_TOPIC (your private ntfy.sh topic)
const repos = (process.env.WATCH_REPOS || '').split(',').map(s => s.trim()).filter(Boolean);
const token = process.env.GH_TOKEN;
const topic = process.env.NTFY_TOPIC;
if (!repos.length || !topic) { console.log('WATCH_REPOS or NTFY_TOPIC not set, nothing to do.'); process.exit(0); }

const H = 3600e3;
const plural = n => `${n} push${n === 1 ? '' : 'es'}`;

async function pushes(name) {
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(`https://api.github.com/repos/${name}/activity?time_period=day&per_page=100`, { headers });
  if (!r.ok) throw new Error(`${name}: GitHub returned ${r.status}`);
  return (await r.json()).filter(a => a.activity_type !== 'branch_deletion').map(a => ({ ...a, ts: Date.parse(a.timestamp) }));
}

const now = Date.now();
const lines = [];
let lastHour = 0;
for (const name of repos) {
  try {
    const ev = await pushes(name);
    const c = w => ev.filter(e => now - e.ts <= w).length;
    lastHour += c(H);
    const latest = ev[0] ? ` (latest: ${ev[0].actor?.login} → ${ev[0].ref.replace('refs/heads/', '')})` : '';
    lines.push(`${name}: last hour ${plural(c(H))}, last 6h ${plural(c(6 * H))}, 24h ${plural(c(24 * H))}${c(H) ? latest : ''}`);
  } catch (e) { lines.push(`${e.message}`); }
}

const body = lines.join('\n');
console.log(body);
await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
  method: 'POST',
  body,
  headers: { Title: lastHour ? `PushPulse: ${plural(lastHour)} in the last hour` : 'PushPulse: quiet hour', Tags: lastHour ? 'green_circle' : 'zzz', Priority: lastHour ? '3' : '2' }
});
