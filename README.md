# PushPulse

The push heartbeat of your GitHub repos. Paste a repo (private ones work too) and see how many pushes landed recently. Every window always shows a number, zeros included:

> In the last hour **0 pushes**, last 6 hours **20 pushes**, 24 hours **31 pushes**, 7 days **88 pushes**.

**Live app:** https://yobotn.github.io/pushpulse/

## What it does

- Counts real **pushes** on all branches (including force pushes and PR merges), not commits. One push with 30 commits counts once.
- Windows: last hour, 6 hours, 24 hours, 7 days. There's also a 24-hour sparkline and a feed of recent pushes.
- **Project history heat map**: a daily, GitHub-style heat map of pushes or commits across the whole life of the repo. Drag the two handles of the range slider (over a weekly overview of the full history) to pick any period, or use the 3 months / 1 year / All presets. It shows the total, active days, busiest day and longest streak for the selected range.
- Sends a browser notification for every new push while the tab is open.
- Sends a periodic summary notification (hourly, every 6 h or daily).
- Watches several repos at once. It's one static HTML file with no backend and no build step.

## Private repos

Click **🔑 Create a read-only token** in the app ([or use this link](https://github.com/settings/personal-access-tokens/new?name=PushPulse&description=Read-only+token+for+PushPulse+push+tracking&expires_in=90&metadata=read&contents=read)). GitHub opens with everything pre-filled (read-only Metadata + Contents, 90 days). Choose the repos and click Generate. Paste it next to the repo. The token is saved in your browser's localStorage and is only ever sent to `api.github.com`.

## Background alerts (optional)

A web page can't notify you after it's closed. For alerts that keep coming, fork this repo and let GitHub Actions post an hourly summary to [ntfy.sh](https://ntfy.sh) (free, with phone and desktop apps):

1. Fork the repo, then open **Settings → Secrets and variables → Actions**.
2. Variables: `PULSE_ENABLED=true`, `WATCH_REPOS=owner/repo,owner/other`.
3. Secrets: `NTFY_TOPIC` (a long random topic name; subscribe to it in the ntfy app) and `WATCH_TOKEN` (the token from above, needed for private repos).
4. Every hour you get something like: *"PushPulse: 3 pushes in the last hour"* with per-repo counts. Quiet hours send a low-priority "quiet hour" note, so you always get a result.

## How it works

It uses GitHub's [repository activity API](https://docs.github.com/en/rest/repos/repos#list-repository-activities) (`GET /repos/{owner}/{repo}/activity`), which records each push event with timestamp, branch and actor. Branch deletions are excluded.

The history heat map loads on demand when you open it. Pushes come from the same activity log (without a time limit); commits come from `GET /repos/{owner}/{repo}/commits` (default branch, by author date). Up to 3,000 items are loaded per metric, and the result is cached in your browser until you click Reload. Without a token, one full load can use up to 31 of GitHub's 60 requests per hour.

## Run locally

Open `index.html` in a browser. That's all.

## License

MIT
