# PushPulse

The push heartbeat of your GitHub repos. Paste a repo (private ones work too) and see how many pushes landed recently. Every window always shows a number, zeros included:

> In the last hour **0 pushes**, last 6 hours **20 pushes**, 24 hours **31 pushes**, 7 days **88 pushes**.

**Live app:** https://yobotn.github.io/pushpulse/

## What it does

- Counts real **pushes** on all branches (including force pushes and PR merges), not commits. One push with 30 commits counts once.
- Windows: last hour, 6 hours, 24 hours, 7 days. There's also a 24-hour sparkline and a feed of recent pushes.
- Sends a browser notification for every new push while the tab is open.
- Sends a periodic summary notification (hourly, every 6 h or daily).
- Watches several repos at once. It's one static HTML file with no backend and no build step.

## Private repos

Create a [fine-grained token](https://github.com/settings/personal-access-tokens/new) scoped to the repos you want, with **Repository permissions → Metadata: Read-only**. Paste it next to the repo. The token is saved in your browser's localStorage and is only ever sent to `api.github.com`.

## Background alerts (optional)

A web page can't notify you after it's closed. For alerts that keep coming, fork this repo and let GitHub Actions post an hourly summary to [ntfy.sh](https://ntfy.sh) (free, with phone and desktop apps):

1. Fork the repo, then open **Settings → Secrets and variables → Actions**.
2. Variables: `PULSE_ENABLED=true`, `WATCH_REPOS=owner/repo,owner/other`.
3. Secrets: `NTFY_TOPIC` (a long random topic name; subscribe to it in the ntfy app) and `WATCH_TOKEN` (the token from above, needed for private repos).
4. Every hour you get something like: *"PushPulse: 3 pushes in the last hour"* with per-repo counts. Quiet hours send a low-priority "quiet hour" note, so you always get a result.

## How it works

It uses GitHub's [repository activity API](https://docs.github.com/en/rest/repos/repos#list-repository-activities) (`GET /repos/{owner}/{repo}/activity`), which records each push event with timestamp, branch and actor. Branch deletions are excluded.

## Run locally

Open `index.html` in a browser. That's all.

## License

MIT
