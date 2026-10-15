# Talk track: Run your backend on Vercel

**Length:** about 2.5 minutes · **Demo:** https://backend-on-vercel-walkthrough.vercel.app
**Setup:** open the demo on stage 1 ("The issue"). Simulated walkthrough with example data. Southerly Media is a fictional company.

---

### 1. The issue (≈35s) · Screen: "The issue"

"Here's a pattern I see in almost every enterprise account in ANZ. The website is on Vercel. The backend is somewhere else.

Take Southerly Media, a fictional streaming and news company. *(point left)* Their Next.js storefront runs on Vercel. *(point right)* But the Python pricing API, the media service that needs ffmpeg, and the queue worker that cuts highlight clips all live on a separate container cluster.

Two platforms. Two deploy pipelines. Two places to look when something breaks."

**Click:** "Replay the release"

"Last Friday they launched a Finals Pass. The storefront shipped the new $14.99 price in minutes. The pricing API was stuck in the other pipeline. For 29 minutes, the banner said $14.99 and the checkout charged $19.99. Support tickets, two dashboards, and a worker box nobody owns on a Friday."

**Click:** "Put it in one repo"

### 2. One repo (≈30s) · Screen: "One repo"

"Here's what changes. Nothing gets rewritten. *(click through the files on the left)* The storefront stays Next.js. The pricing API stays Python. The media service keeps ffmpeg — it just brings it along in a container. The worker keeps pulling jobs from the queue, all day.

They simply move next to the storefront, in one repo, in one Vercel project. *(click vercel.json)* One file ties it together."

*(optional: toggle "Code" for the engineers in the room, then back to "Plain English")*

**Click:** "Ship it with one push"

### 3. One git push (≈25s) · Screen: "One git push"

**Click:** "git push"

"One git push. *(point at the four rows)* Storefront, Python API, ffmpeg container and the worker build in the same deployment and go live as one unit.

No second pipeline. No release order to get right. And if they need to roll back, they roll back once — and everything goes back together."

**Click:** "Preview the next change"

### 4. Preview the change (≈30s) · Screen: "Preview the change"

"Now the next promo. Every pull request gets a preview of the storefront and the Python pricing API together. *(point at the banner and the checkout)* Marketing isn't looking at a mock-up. They're looking at the real price coming from the real API on the same branch. $14.99 on the banner, $14.99 at checkout.

*(click "Last Friday (two platforms)")* Compare that with last Friday: the price change lived on the other platform, so nobody saw banner and checkout together until customers did. *(click back to "Preview on Vercel")*"

**Click:** "Run it on a busy night"

### 5. One dashboard (≈25s) · Screen: "One dashboard"

"Saturday night, finals traffic. On-call opens one project. *(point left)* Every part of the stack and its status. *(point at the logs)* Every log, side by side — storefront, pricing, media, worker.

*(point at the amber line)* A worker instance falls over — Vercel restarts it, and the queue keeps moving. *(click a service on the left to filter)* One place to look, not two."

**Click:** "Before / after"

### 6. Before / after (≈25s) · Screen: "Before / after"

"*(point left)* Before: two platforms, two pipelines sequenced by hand, previews of the frontend only, two dashboards, two rollbacks — and 29 minutes of mismatched prices.

*(point right)* After: one platform, one git push, previews of frontend and backend together, one project to watch, one rollback.

Southerly Media didn't rewrite a line of their backend. They just stopped running a second platform for it. Fewer things to run, and releases that land together.

If your team is running a separate cluster just for a Python API or a queue worker, let's look at what it would take to bring it home to Vercel."
