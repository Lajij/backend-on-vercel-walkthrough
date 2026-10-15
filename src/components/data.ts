export const COMPANY = "Southerly Media";
export const DOMAIN = "southerly-media.example";

export type RepoFile = {
  path: string;
  kind: "frontend" | "python" | "container" | "daemon" | "config";
  plain: string;
  code: string;
};

export const REPO_FILES: RepoFile[] = [
  {
    path: "vercel.json",
    kind: "config",
    plain:
      "One file at the root ties it all together: the storefront, the Python pricing API, the ffmpeg media service and the background worker live in one project.",
    code: `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "web":     { "root": "web/" },
    "pricing": { "root": "api/",   "entrypoint": "main:app" },
    "media":   { "root": "media/", "entrypoint": "Dockerfile.vercel" }
  },
  "daemons": {
    "clips": {
      "root": "worker/",
      "entrypoint": "Dockerfile",
      "command": ["celery", "-A", "tasks", "worker", "--loglevel=info"],
      "replicas": { "syd1": 2 }
    }
  },
  "rewrites": [
    { "source": "/api/price/(.*)", "destination": { "service": "pricing" } },
    { "source": "/api/media/(.*)", "destination": { "service": "media" } },
    { "source": "/(.*)",           "destination": { "service": "web" } }
  ]
}`,
  },
  {
    path: "web/app/page.tsx",
    kind: "frontend",
    plain: "The storefront. The same Next.js app that already ran on Vercel — nothing changes here.",
    code: `export default async function Home() {
  const url = new URL("/api/price/finals-pass?region=AU", process.env.SITE_URL);
  const { price } = await fetch(url).then((r) => r.json());

  return (
    <Hero
      title="Finals Pass"
      subtitle="Every final. Every replay. Every highlight."
      price={price}
    />
  );
}`,
  },
  {
    path: "api/main.py",
    kind: "python",
    plain:
      "The pricing API, in Python, exactly as the data team wrote it. It used to live on the container cluster. Now it ships with the storefront.",
    code: `from fastapi import FastAPI
from pricing import bundle_price

app = FastAPI()

@app.get("/api/price/{plan}")
def price(plan: str, region: str = "AU"):
    return {
        "plan": plan,
        "region": region,
        "price": bundle_price(plan, region),
    }`,
  },
  {
    path: "media/Dockerfile.vercel",
    kind: "container",
    plain:
      "The media service needs ffmpeg, a system library. A container brings it along, so thumbnails and clip previews no longer need their own box.",
    code: `FROM python:3.12-slim

RUN apt-get update \\
 && apt-get install -y --no-install-recommends ffmpeg \\
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN pip install --no-cache-dir fastapi uvicorn

CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port \${PORT:-80}"]`,
  },
  {
    path: "worker/Dockerfile",
    kind: "daemon",
    plain:
      "The queue worker that cuts highlight clips and unlocks passes after checkout. It runs all day, pulling jobs — now on Vercel, deployed with everything else.",
    code: `FROM python:3.12-slim

RUN apt-get update \\
 && apt-get install -y --no-install-recommends ffmpeg \\
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN pip install --no-cache-dir celery redis

# command is set in vercel.json:
# celery -A tasks worker --loglevel=info`,
  },
  {
    path: "worker/tasks.py",
    kind: "daemon",
    plain: "The jobs themselves: cut the clip, unlock the pass. Plain Python the team already had.",
    code: `from celery import Celery
from clips import cut_highlight
from entitlements import unlock_pass

app = Celery("tasks", broker=BROKER_URL)

@app.task
def make_highlight(match_id: str, start: int, end: int):
    cut_highlight(match_id, start, end)   # ffmpeg under the hood

@app.task
def grant_finals_pass(order_id: str):
    unlock_pass(order_id)`,
  },
];

export type BuildUnit = {
  id: string;
  name: string;
  what: string;
  type: string;
  ms: number;
};

export const BUILD_UNITS: BuildUnit[] = [
  { id: "web", name: "web", what: "Storefront", type: "Next.js", ms: 2600 },
  { id: "pricing", name: "pricing", what: "Pricing API", type: "Python · FastAPI", ms: 3200 },
  { id: "media", name: "media", what: "Thumbnails & clip previews", type: "Container · ffmpeg", ms: 3900 },
  { id: "clips", name: "clips", what: "Highlight & pass worker", type: "Daemon · 2 instances · syd1", ms: 4500 },
];

export const BEFORE_TIMELINE = [
  { t: "15:40", who: "Pipeline A · Vercel", text: "Storefront with the new $14.99 Finals Pass banner deploys in minutes.", tone: "ok" },
  { t: "15:42", who: "Pipeline B · Cluster", text: "Pricing API image build queued behind another team's release.", tone: "warn" },
  { t: "15:58", who: "Customers", text: "Banner says $14.99. Checkout still charges $19.99. Support tickets start.", tone: "bad" },
  { t: "16:07", who: "On-call", text: "Two dashboards, two log tools. Which side is wrong?", tone: "bad" },
  { t: "16:11", who: "Pipeline B · Cluster", text: "Pricing API finally rolls out. 29 minutes of mismatched prices.", tone: "warn" },
  { t: "16:30", who: "Queue worker", text: "Highlight clips back up on the worker box. Nobody owns that box on Fridays.", tone: "bad" },
] as const;

export type LogLine = { t: string; svc: "web" | "pricing" | "media" | "clips"; level: "info" | "warn"; msg: string };

export const LOGS: LogLine[] = [
  { t: "19:30:02", svc: "web", level: "info", msg: "GET / 200 · Finals Pass hero rendered" },
  { t: "19:30:02", svc: "pricing", level: "info", msg: "GET /api/price/finals-pass?region=AU 200 · price=14.99" },
  { t: "19:30:03", svc: "media", level: "info", msg: "GET /api/media/thumb/m-2291 200 · ffmpeg frame @ 00:41:12" },
  { t: "19:30:04", svc: "clips", level: "info", msg: "Task make_highlight[m-2291 41:05–41:35] received" },
  { t: "19:30:06", svc: "clips", level: "info", msg: "Task make_highlight succeeded in 2.1s" },
  { t: "19:30:07", svc: "web", level: "info", msg: "POST /checkout 200 · order SM-88412" },
  { t: "19:30:07", svc: "pricing", level: "info", msg: "GET /api/price/finals-pass?region=NZ 200 · price=16.49" },
  { t: "19:30:08", svc: "clips", level: "info", msg: "Task grant_finals_pass[SM-88412] succeeded" },
  { t: "19:30:11", svc: "clips", level: "warn", msg: "Instance clips-2 exited · restarted automatically · 2/2 running" },
  { t: "19:30:12", svc: "media", level: "info", msg: "GET /api/media/preview/m-2291 200 · 6s clip preview" },
  { t: "19:30:14", svc: "clips", level: "info", msg: "Task make_highlight[m-2291 44:10–44:40] received" },
  { t: "19:30:15", svc: "web", level: "info", msg: "GET /replays 200" },
];

export const VALUE_ROWS = [
  { k: "Platforms to run", before: "2 · Vercel + a container cluster", after: "1 · Vercel" },
  { k: "Deploy pipelines", before: "2 · sequenced by hand", after: "1 · git push" },
  { k: "Previews", before: "Storefront only", after: "Storefront + pricing API together" },
  { k: "On-call surfaces", before: "2 dashboards, 2 log tools", after: "1 project, logs by service" },
  { k: "Rolling back", before: "Two rollbacks, in the right order", after: "One rollback" },
  { k: "Friday promo (example)", before: "29 min of mismatched prices", after: "Banner and checkout ship together" },
];
