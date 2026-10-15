"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BEFORE_TIMELINE,
  BUILD_UNITS,
  COMPANY,
  DOMAIN,
  LOGS,
  REPO_FILES,
  VALUE_ROWS,
  type LogLine,
  type RepoFile,
} from "./data";
import { Panel, VercelMark } from "./ui";

type Step = "issue" | "repo" | "push" | "preview" | "operate" | "value";

const STEPS: { id: Step; label: string }[] = [
  { id: "issue", label: "The issue" },
  { id: "repo", label: "One repo" },
  { id: "push", label: "One git push" },
  { id: "preview", label: "Preview the change" },
  { id: "operate", label: "One dashboard" },
  { id: "value", label: "Before / after" },
];

const KIND_LABEL: Record<RepoFile["kind"], { label: string; cls: string }> = {
  config: { label: "Config", cls: "text-foreground border-white/20" },
  frontend: { label: "Next.js", cls: "text-blue border-blue/30" },
  python: { label: "Python", cls: "text-warn border-warn/30" },
  container: { label: "Container", cls: "text-purple border-purple/30" },
  daemon: { label: "Daemon", cls: "text-success border-success/30" },
};

const SVC_CLS: Record<LogLine["svc"], string> = {
  web: "text-blue",
  pricing: "text-warn",
  media: "text-purple",
  clips: "text-success",
};

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
    >
      {children}
    </button>
  );
}

function GhostButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function StageHeader({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{eyebrow}</div>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}

function Box({
  title,
  sub,
  tone = "neutral",
  children,
}: {
  title: string;
  sub?: string;
  tone?: "neutral" | "bad" | "good";
  children?: React.ReactNode;
}) {
  const border =
    tone === "bad" ? "border-danger/40" : tone === "good" ? "border-success/40" : "border-border";
  return (
    <div className={`rounded-lg border ${border} bg-card-2 px-3 py-2.5`}>
      <div className="text-sm font-medium">{title}</div>
      {sub ? <div className="mt-0.5 font-mono text-[11px] text-subtle">{sub}</div> : null}
      {children}
    </div>
  );
}

/* ---------------- Stage 1: The issue ---------------- */

function IssueStage({ go }: { go: (s: Step) => void }) {
  const [shown, setShown] = useState(0);
  const playing = shown > 0 && shown < BEFORE_TIMELINE.length;

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setShown((n) => n + 1), 650);
    return () => clearTimeout(id);
  }, [shown, playing]);

  return (
    <div className="fade-in space-y-6">
      <StageHeader
        eyebrow={`${COMPANY} · today`}
        title="The website is on Vercel. The backend is somewhere else."
        body={`${COMPANY} is a (fictional) ANZ streaming and news company. Their Next.js storefront runs on Vercel. Their Python pricing API, their ffmpeg media service and the queue worker that cuts highlight clips run on a separate container cluster. Two platforms. Two deploy pipelines. Two places to look when it breaks.`}
        action={<PrimaryButton onClick={() => go("repo")}>Put it in one repo</PrimaryButton>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <Panel title={<span className="flex items-center gap-2"><VercelMark className="h-3.5 w-3.5" /> Vercel</span>} badge="Pipeline A">
          <div className="space-y-2">
            <Box title="Storefront" sub="Next.js · git push → live" tone="good" />
            <div className="pt-2 text-[12px] text-muted">Previews per pull request · deploys in minutes</div>
          </div>
        </Panel>
        <div className="hidden items-center justify-center lg:flex">
          <div className="flex flex-col items-center gap-1 text-subtle">
            <span className="font-mono text-[10px] uppercase tracking-wide">calls</span>
            <span className="text-xl">⇄</span>
          </div>
        </div>
        <Panel title="Container cluster" badge="Pipeline B">
          <div className="space-y-2">
            <Box title="Pricing API" sub="Python · FastAPI" />
            <Box title="Media service" sub="ffmpeg · system libraries" />
            <Box title="Queue worker" sub="Celery · runs all day" />
            <div className="pt-2 text-[12px] text-muted">
              Own CI · image registry · infra code · separate dashboards · separate on-call
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { k: "Platforms", v: "2" },
          { k: "Deploy pipelines", v: "2" },
          { k: "On-call surfaces", v: "2" },
          { k: "Previews of the backend", v: "0" },
        ].map((c) => (
          <div key={c.k} className="rounded-xl border border-border bg-card px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-subtle">{c.k}</div>
            <div className="mt-1 text-2xl font-semibold">{c.v}</div>
          </div>
        ))}
      </div>

      <Panel
        title="Last Friday: launching the Finals Pass"
        badge="Example"
        right={
          shown === 0 ? (
            <button
              type="button"
              onClick={() => setShown(1)}
              className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-black hover:bg-white/90"
            >
              Replay the release
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShown(0)}
              className="rounded-full border border-border px-3 py-1 text-[12px] text-muted hover:text-foreground"
            >
              Reset
            </button>
          )
        }
      >
        {shown === 0 ? (
          <p className="text-sm text-muted">
            One promo. A new price on the storefront, new logic in the pricing API, new jobs on the worker.
            Click <span className="text-foreground">Replay the release</span> to see how it shipped across two platforms.
          </p>
        ) : (
          <ol className="space-y-2">
            {BEFORE_TIMELINE.slice(0, shown).map((r) => (
              <li key={r.t + r.who} className="row-in flex gap-3 rounded-lg border border-border bg-card-2 px-3 py-2">
                <span className="w-12 shrink-0 font-mono text-[12px] text-subtle">{r.t}</span>
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    r.tone === "ok" ? "bg-success" : r.tone === "warn" ? "bg-warn" : "bg-danger"
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-[12px] text-subtle">{r.who}</div>
                  <div className="text-sm">{r.text}</div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}

/* ---------------- Stage 2: One repo ---------------- */

function RepoStage({ go }: { go: (s: Step) => void }) {
  const [sel, setSel] = useState(REPO_FILES[0].path);
  const [mode, setMode] = useState<"plain" | "code">("plain");
  const file = REPO_FILES.find((f) => f.path === sel) ?? REPO_FILES[0];

  const tree = [
    { dir: "web/", files: ["web/app/page.tsx"] },
    { dir: "api/", files: ["api/main.py"] },
    { dir: "media/", files: ["media/Dockerfile.vercel"] },
    { dir: "worker/", files: ["worker/Dockerfile", "worker/tasks.py"] },
  ];

  return (
    <div className="fade-in space-y-6">
      <StageHeader
        eyebrow="What we solve"
        title="Frontend, Python API, ffmpeg and the worker. One repo, one project."
        body="Nothing gets rewritten. The pricing API stays Python. The media service keeps ffmpeg. The worker keeps pulling jobs. They simply move next to the storefront and ship with it on Vercel."
        action={<PrimaryButton onClick={() => go("push")}>Ship it with one push</PrimaryButton>}
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Panel title="southerly-media" badge="Repo" bodyClassName="p-2">
          <div className="space-y-0.5 font-mono text-[13px]">
            <button
              type="button"
              onClick={() => setSel("vercel.json")}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left ${
                sel === "vercel.json" ? "bg-white/[0.08] text-foreground" : "text-muted hover:bg-white/[0.04]"
              }`}
            >
              <span>vercel.json</span>
              <span className="text-[10px] text-subtle">ties it together</span>
            </button>
            {tree.map((d) => (
              <div key={d.dir} className="pt-1">
                <div className="px-2 py-1 text-subtle">{d.dir}</div>
                {d.files.map((f) => {
                  const rf = REPO_FILES.find((x) => x.path === f)!;
                  const k = KIND_LABEL[rf.kind];
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSel(f)}
                      className={`flex w-full items-center justify-between rounded-md py-1.5 pl-5 pr-2 text-left ${
                        sel === f ? "bg-white/[0.08] text-foreground" : "text-muted hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="truncate">{f.slice(d.dir.length)}</span>
                      <span className={`rounded-full border px-1.5 text-[9.5px] uppercase ${k.cls}`}>{k.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title={<span className="font-mono">{file.path}</span>}
          right={
            <div className="inline-flex rounded-lg border border-border bg-black p-0.5 text-[11px]">
              {(["plain", "code"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-md px-2.5 py-1 transition ${
                    mode === m ? "bg-white text-black" : "text-muted hover:text-foreground"
                  }`}
                >
                  {m === "plain" ? "Plain English" : "Code"}
                </button>
              ))}
            </div>
          }
        >
          <div key={file.path + mode} className="fade-in">
            {mode === "plain" ? (
              <div className="space-y-4">
                <p className="text-[17px] leading-relaxed">{file.plain}</p>
                <div className="flex flex-wrap gap-2">
                  {REPO_FILES.filter((f) => f.kind !== "config").map((f) => (
                    <span
                      key={f.path}
                      className={`rounded-full border px-2.5 py-1 text-[12px] ${KIND_LABEL[f.kind].cls} ${
                        f.path === file.path ? "bg-white/[0.06]" : "opacity-60"
                      }`}
                    >
                      {f.path}
                    </span>
                  ))}
                </div>
                <p className="text-[13px] text-muted">Switch to Code to show the engineers in the room.</p>
              </div>
            ) : (
              <pre className="overflow-x-auto rounded-lg border border-border bg-black p-4 font-mono text-[12.5px] leading-[1.6] text-muted">
                {file.code}
              </pre>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- Stage 3: One git push ---------------- */

function PushStage({ go }: { go: (s: Step) => void }) {
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const total = Math.max(...BUILD_UNITS.map((u) => u.ms));
  const elapsed = start === null ? 0 : now - start;
  const done = start !== null && elapsed >= total + 300;

  useEffect(() => {
    if (start === null || done) return;
    const id = setInterval(() => setNow(Date.now()), 80);
    return () => clearInterval(id);
  }, [start, done]);

  const push = () => {
    const t = Date.now();
    setStart(t);
    setNow(t);
  };

  return (
    <div className="fade-in space-y-6">
      <StageHeader
        eyebrow="One release"
        title="One git push ships all four, together."
        body="The storefront, the Python API, the ffmpeg container and the worker build in the same deployment and go live as one unit. No second pipeline. No release order to get right."
        action={done ? <PrimaryButton onClick={() => go("preview")}>Preview the next change</PrimaryButton> : undefined}
      />

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Terminal" badge="Simulated">
          <div className="space-y-2 font-mono text-[13px]">
            <div className="text-muted">
              <span className="text-subtle">~/southerly-media</span> <span className="text-success">main</span>
            </div>
            <div>
              <span className="text-subtle">$</span> git commit -m &quot;Finals Pass: $14.99 bundle&quot;
            </div>
            <div className="flex items-center gap-2">
              <span className="text-subtle">$</span>
              {start === null ? (
                <button
                  type="button"
                  onClick={push}
                  className="rounded-md bg-white px-2.5 py-1 text-[13px] font-medium text-black hover:bg-white/90"
                >
                  git push
                </button>
              ) : (
                <span>git push</span>
              )}
              {start === null ? <span className="pulse-dot text-muted">▍</span> : null}
            </div>
            {start !== null ? (
              <div className="fade-in pt-2 text-muted">
                → Vercel: building 4 parts of {COMPANY} in one deployment…
                {done ? <div className="mt-1 text-success">✓ Ready · {DOMAIN}</div> : null}
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel
          title={<span className="flex items-center gap-2"><VercelMark className="h-3.5 w-3.5" /> Deployment · Production</span>}
          right={
            done ? (
              <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">Ready</span>
            ) : start !== null ? (
              <span className="rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-[11px] font-medium text-warn">Building</span>
            ) : (
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">Waiting for push</span>
            )
          }
        >
          <div className="space-y-2.5">
            {BUILD_UNITS.map((u) => {
              const pct = start === null ? 0 : Math.min(100, (elapsed / u.ms) * 100);
              const ready = pct >= 100;
              return (
                <div key={u.id} className="rounded-lg border border-border bg-card-2 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-success" : start ? "bg-warn pulse-dot" : "bg-subtle"}`} />
                        <span className="text-sm font-medium">{u.what}</span>
                        <span className="font-mono text-[11px] text-subtle">{u.name}</span>
                      </div>
                      <div className="mt-0.5 pl-3.5 font-mono text-[11px] text-muted">{u.type}</div>
                    </div>
                    <span className={`font-mono text-[11px] ${ready ? "text-success" : "text-muted"}`}>
                      {start === null ? "—" : ready ? "Ready" : "Building"}
                    </span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full ${ready ? "bg-success" : "bg-white/60"}`}
                      style={{ width: `${pct}%`, transition: "width 80ms linear" }}
                    />
                  </div>
                </div>
              );
            })}
            {done ? (
              <div className="fade-in rounded-lg border border-success/30 bg-success/[0.06] px-3 py-2.5 text-sm">
                One deployment. Storefront, pricing API and media service answer on{" "}
                <span className="font-mono">{DOMAIN}</span>; the worker is running 2 instances in Sydney. Roll back once and
                everything goes back together.
              </div>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- Stage 4: Preview ---------------- */

function PreviewStage({ go }: { go: (s: Step) => void }) {
  const [view, setView] = useState<"before" | "after">("after");

  return (
    <div className="fade-in space-y-6">
      <StageHeader
        eyebrow="Before anyone merges"
        title="Marketing checks the real price, not a mock-up."
        body="Every pull request gets a preview of the storefront and the Python pricing API together. The banner and the checkout run the same branch, so the price people see is the price people pay, before it ever reaches production."
        action={<PrimaryButton onClick={() => go("operate")}>Run it on a busy night</PrimaryButton>}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border bg-black p-0.5 text-[12px]">
          {(
            [
              ["before", "Last Friday (two platforms)"],
              ["after", "Preview on Vercel"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setView(k)}
              className={`rounded-md px-3 py-1.5 transition ${
                view === k ? "bg-white text-black" : "text-muted hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title={
            <span className="font-mono text-[12px] text-muted">
              {view === "after" ? "finals-pass-git-pr-482.southerly-media.example" : DOMAIN}
            </span>
          }
          badge={view === "after" ? "Preview" : "Production"}
          bodyClassName="p-0"
        >
          <div key={view} className="fade-in grid-bg p-6">
            <div className="rounded-xl border border-border bg-black/80 p-6">
              <div className="font-mono text-[11px] uppercase tracking-wide text-subtle">{COMPANY}</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight">Finals Pass</div>
              <div className="mt-1 text-sm text-muted">Every final. Every replay. Every highlight.</div>
              <div className="mt-5 flex items-end gap-3">
                <div className="text-4xl font-semibold">$14.99</div>
                <div className="pb-1 text-sm text-muted">banner price</div>
              </div>
            </div>
            <div
              className={`mt-4 flex items-center justify-between rounded-xl border px-5 py-4 ${
                view === "after" ? "border-success/40 bg-success/[0.06]" : "border-danger/40 bg-danger/[0.07]"
              }`}
            >
              <div>
                <div className="text-sm font-medium">Checkout</div>
                <div className="font-mono text-[11px] text-muted">GET /api/price/finals-pass → pricing</div>
              </div>
              <div className={`text-2xl font-semibold ${view === "after" ? "text-success" : "text-danger"}`}>
                {view === "after" ? "$14.99" : "$19.99"}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Pull request #482 · Finals Pass bundle" badge="Example">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-border bg-card-2 px-3 py-2">
              <span>Storefront</span>
              <span className="font-mono text-[11px] text-success">Preview ready</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card-2 px-3 py-2">
              <span>Pricing API (Python)</span>
              <span className={`font-mono text-[11px] ${view === "after" ? "text-success" : "text-subtle"}`}>
                {view === "after" ? "Preview ready" : "Not in preview"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card-2 px-3 py-2">
              <span>Media service (ffmpeg)</span>
              <span className={`font-mono text-[11px] ${view === "after" ? "text-success" : "text-subtle"}`}>
                {view === "after" ? "Preview ready" : "Not in preview"}
              </span>
            </div>
            {view === "after" ? (
              <div className="fade-in space-y-2 pt-1">
                <div className="rounded-lg border border-border px-3 py-2">
                  <div className="text-[12px] text-subtle">Priya · Marketing</div>
                  <div>Banner and checkout both say $14.99. NZ shows $16.49. Approved 👍</div>
                </div>
                <div className="rounded-lg border border-border px-3 py-2">
                  <div className="text-[12px] text-subtle">Tom · Pricing (Python)</div>
                  <div>Same branch as the storefront. Merging.</div>
                </div>
              </div>
            ) : (
              <div className="fade-in rounded-lg border border-danger/30 bg-danger/[0.06] px-3 py-2 text-[13px]">
                The price change lived on the other platform, so nobody could see banner and checkout together until
                customers did.
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- Stage 5: One dashboard ---------------- */

function OperateStage({ go }: { go: (s: Step) => void }) {
  const [filter, setFilter] = useState<"all" | LogLine["svc"]>("all");
  const [count, setCount] = useState(5);
  const live = count < LOGS.length;
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live) return;
    const id = setTimeout(() => setCount((c) => c + 1), 900);
    return () => clearTimeout(id);
  }, [count, live]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [count, filter]);

  const rows = useMemo(
    () => LOGS.slice(0, count).filter((l) => filter === "all" || l.svc === filter),
    [count, filter],
  );

  const services = [
    { id: "web", name: "Storefront", sub: "Next.js", status: "Ready" },
    { id: "pricing", name: "Pricing API", sub: "Python · FastAPI", status: "Ready" },
    { id: "media", name: "Media service", sub: "Container · ffmpeg", status: "Ready" },
    { id: "clips", name: "Highlight & pass worker", sub: "Daemon · syd1", status: "2/2 running" },
  ] as const;

  return (
    <div className="fade-in space-y-6">
      <StageHeader
        eyebrow="Saturday night, finals"
        title="One project to watch. One place to look."
        body="When traffic spikes, on-call opens one project: every part of the stack, its status and its logs, filtered by service. If a worker instance falls over, Vercel restarts it and the queue keeps moving."
        action={<PrimaryButton onClick={() => go("value")}>Before / after</PrimaryButton>}
      />

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Panel title={<span className="flex items-center gap-2"><VercelMark className="h-3.5 w-3.5" /> southerly-media</span>} badge="Project">
          <div className="space-y-2">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFilter(filter === s.id ? "all" : s.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition ${
                  filter === s.id ? "border-white/40 bg-white/[0.06]" : "border-border bg-card-2 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    {s.name}
                  </div>
                  <div className={`mt-0.5 pl-3.5 font-mono text-[11px] ${SVC_CLS[s.id]}`}>
                    {s.id} · <span className="text-subtle">{s.sub}</span>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-success">{s.status}</span>
              </button>
            ))}
            <p className="pt-1 text-[12px] text-muted">Click a service to filter its logs.</p>
          </div>
        </Panel>

        <Panel
          title="Logs"
          badge="Simulated"
          right={
            <div className="flex items-center gap-2">
              {live ? (
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-success">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-success" /> Live
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setCount(3)}
                  className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted hover:text-foreground"
                >
                  Replay
                </button>
              )}
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
                {filter === "all" ? "all services" : filter}
              </span>
            </div>
          }
          bodyClassName="p-0"
        >
          <div ref={boxRef} className="h-[340px] overflow-y-auto p-3 font-mono text-[12px] leading-[1.7]">
            {rows.map((l, i) => (
              <div
                key={l.t + l.msg + i}
                className={`row-in flex gap-3 rounded px-2 ${l.level === "warn" ? "bg-warn/[0.08]" : ""}`}
              >
                <span className="shrink-0 text-subtle">{l.t}</span>
                <span className={`w-14 shrink-0 ${SVC_CLS[l.svc]}`}>{l.svc}</span>
                <span className={l.level === "warn" ? "text-warn" : "text-muted"}>{l.msg}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- Stage 6: Before / after ---------------- */

function ValueStage({ go }: { go: (s: Step) => void }) {
  return (
    <div className="fade-in space-y-6">
      <StageHeader
        eyebrow="The value"
        title="Fewer things to run. Releases that land together."
        body={`${COMPANY} didn't rewrite a line of their backend. They stopped running a second platform for it.`}
      />

      <Panel title="Before / after" badge="Example" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-[11px] uppercase tracking-wide text-subtle">
              <tr>
                <th className="px-4 py-2.5 font-medium"></th>
                <th className="px-4 py-2.5 font-medium">Before · two platforms</th>
                <th className="px-4 py-2.5 font-medium">After · all on Vercel</th>
              </tr>
            </thead>
            <tbody>
              {VALUE_ROWS.map((r) => (
                <tr key={r.k} className="border-b border-border/70">
                  <td className="px-4 py-3 text-muted">{r.k}</td>
                  <td className="px-4 py-3 text-danger">{r.before}</td>
                  <td className="px-4 py-3 font-medium text-success">{r.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="rounded-xl border border-border bg-card px-5 py-5">
        <p className="text-[17px] leading-relaxed">
          The backend no longer needs its own platform. Python APIs, containers that bring their own system libraries,
          and workers that run all day now deploy from the same repo as the frontend, with one push, one preview and one
          place to look. Small teams get their evenings back. Big teams stop coordinating releases across platforms.
        </p>
        <p className="mt-3 text-sm text-muted">
          Learn more:{" "}
          <a className="text-blue hover:underline" href="https://vercel.com/docs/services" target="_blank" rel="noreferrer">
            vercel.com/docs/services
          </a>{" "}
          ·{" "}
          <a className="text-blue hover:underline" href="https://vercel.com/docs/daemons" target="_blank" rel="noreferrer">
            vercel.com/docs/daemons
          </a>
        </p>
      </div>

      <GhostButton onClick={() => go("issue")}>Restart walkthrough</GhostButton>
    </div>
  );
}

/* ---------------- Shell ---------------- */

export function Walkthrough() {
  const [step, setStep] = useState<Step>("issue");
  const idx = STEPS.findIndex((s) => s.id === step);
  const go = (s: Step) => {
    setStep(s);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] grid-bg [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <header className="relative z-10 border-b border-border bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <VercelMark className="h-4 w-4" />
            <span className="text-subtle">/</span>
            <span className="text-sm font-medium">Run your backend on Vercel</span>
            <span className="hidden rounded-full border border-border px-2 py-0.5 text-[11px] text-muted sm:inline">
              {COMPANY}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={idx === 0}
              onClick={() => go(STEPS[Math.max(0, idx - 1)].id)}
              className="rounded-full border border-border px-3 py-1 text-[12px] text-muted hover:text-foreground disabled:opacity-30"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={idx === STEPS.length - 1}
              onClick={() => go(STEPS[Math.min(STEPS.length - 1, idx + 1)].id)}
              className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-black hover:bg-white/90 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(s.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] transition ${
                s.id === step ? "bg-white/[0.1] text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border font-mono text-[9.5px] ${
                  i < idx
                    ? "border-success/50 text-success"
                    : s.id === step
                      ? "border-white text-foreground"
                      : "border-border text-subtle"
                }`}
              >
                {i < idx ? "✓" : i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        {step === "issue" && <IssueStage go={go} />}
        {step === "repo" && <RepoStage go={go} />}
        {step === "push" && <PushStage go={go} />}
        {step === "preview" && <PreviewStage go={go} />}
        {step === "operate" && <OperateStage go={go} />}
        {step === "value" && <ValueStage go={go} />}
      </div>

      <footer className="relative z-10 border-t border-border py-4 text-center text-[11px] text-subtle">
        Simulated walkthrough · example data · {COMPANY} is a fictional company · built for a Vercel demo
      </footer>
    </div>
  );
}
