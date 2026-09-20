import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { analyticsDashboardIsConfigured, isAnalyticsDashboardAuthorized } from "@/lib/analytics-auth";
import { getAnalyticsSnapshot, type AnalyticsSnapshot } from "@/lib/analytics-dashboard";

type DashboardProps = { snapshot: AnalyticsSnapshot | null; authorized: boolean };

export const getServerSideProps: GetServerSideProps<DashboardProps> = async ({ req, res, query }) => {
  if (!analyticsDashboardIsConfigured()) return { notFound: true };
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  if (!isAnalyticsDashboardAuthorized(req)) {
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="Portfolio analytics", charset="UTF-8"');
    return { props: { snapshot: null, authorized: false } };
  }

  const days = typeof query.days === "string" ? Number(query.days) : 30;
  try {
    return { props: { snapshot: await getAnalyticsSnapshot(days), authorized: true } };
  } catch (error) {
    console.error("Analytics dashboard error:", error);
    return { props: { snapshot: null, authorized: true } };
  }
};

function count(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}

function displayLabel(value: string): string {
  return value.replace(/_/g, " ");
}

function date(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function Breakdown({ title, rows }: { title: string; rows: AnalyticsSnapshot["sources"] }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {rows.length ? (
        <ol className="breakdown">
          {rows.map((row) => <li key={row.label}><span>{displayLabel(row.label)}</span><strong>{count(row.value)}</strong></li>)}
        </ol>
      ) : <p className="empty">No data yet.</p>}
    </section>
  );
}

export default function AnalyticsDashboard({ snapshot, authorized }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!authorized) return <p>Authentication required.</p>;
  if (!snapshot) return <main className="dashboard"><h1>Analytics is temporarily unavailable</h1><p>Check MongoDB and the analytics environment variables, then refresh.</p></main>;

  const cards = [
    ["Sessions", snapshot.overview.sessions],
    ["Unique visitors", snapshot.overview.visitors],
    ["Page views", snapshot.overview.pageViews],
    ["Tracked events", snapshot.overview.events],
    ["Avg. session", `${snapshot.overview.averageSessionMinutes} min`],
  ];

  return (
    <>
      <Head><title>Private Analytics</title><meta name="robots" content="noindex, nofollow" /></Head>
      <main className="dashboard">
        <header className="dashboardHeader">
          <div><p className="eyebrow">Private dashboard</p><h1>Portfolio analytics</h1><p className="muted">First-party, privacy-conscious activity. Updated {date(snapshot.generatedAt)}.</p></div>
          <nav aria-label="Date range">{[7, 30, 90].map((days) => <a className={snapshot.days === days ? "active" : ""} href={`/admin/analytics?days=${days}`} key={days}>{days} days</a>)}</nav>
        </header>

        <section className="metrics">{cards.map(([label, value]) => <article className="metric" key={String(label)}><span>{label}</span><strong>{typeof value === "number" ? count(value) : value}</strong></article>)}</section>

        <section className="grid three"><Breakdown title="Traffic sources" rows={snapshot.sources} /><Breakdown title="Devices" rows={snapshot.devices} /><Breakdown title="Countries" rows={snapshot.countries} /></section>
        <section className="grid three"><Breakdown title="Top pages" rows={snapshot.pages} /><Breakdown title="Most-viewed sections" rows={snapshot.sections} /><Breakdown title="Meaningful actions" rows={snapshot.actions} /></section>

        <section className="grid two">
          <section className="panel"><h2>Recent sessions</h2>{snapshot.recentSessions.length ? <div className="tableWrap"><table><thead><tr><th>Session</th><th>Country</th><th>Device</th><th>Source</th><th>Events</th><th>Last active</th></tr></thead><tbody>{snapshot.recentSessions.map((session) => <tr key={session.id}><td>{session.id}</td><td>{session.country}</td><td>{session.device}</td><td>{session.source}</td><td>{session.events}</td><td>{date(session.lastSeenAt)}</td></tr>)}</tbody></table></div> : <p className="empty">No sessions yet.</p>}</section>
          <section className="panel"><h2>Event activity</h2>{snapshot.recentEvents.length ? <ol className="activity">{snapshot.recentEvents.map((event, index) => <li key={`${event.occurredAt}-${index}`}><div><strong>{displayLabel(event.type)}</strong><span>{event.target || event.path}</span></div><time>{date(event.occurredAt)}</time></li>)}</ol> : <p className="empty">No events yet.</p>}</section>
        </section>
      </main>
      <style>{`
        * { box-sizing: border-box; } body { background: #09090b; color: #f4f4f5; font-family: Arial, sans-serif; margin: 0; } .dashboard { max-width: 1240px; margin: 0 auto; padding: 48px 24px 72px; } .dashboardHeader { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 30px; } h1,h2,p { margin-top: 0; } h1 { font-size: clamp(2rem, 5vw, 3.25rem); margin-bottom: 8px; } h2 { font-size: 1.05rem; margin-bottom: 18px; } .eyebrow { color: #a1a1aa; font-size: .75rem; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; } .muted,.empty { color: #a1a1aa; } nav { display: flex; gap: 8px; flex-wrap: wrap; } nav a { border: 1px solid #3f3f46; border-radius: 999px; color: #d4d4d8; padding: 8px 12px; text-decoration: none; } nav a.active { background: #f4f4f5; color: #09090b; } .metrics { display: grid; gap: 14px; grid-template-columns: repeat(5, minmax(0, 1fr)); margin-bottom: 14px; } .metric,.panel { background: #18181b; border: 1px solid #27272a; border-radius: 14px; } .metric { padding: 20px; } .metric span { color: #a1a1aa; display: block; font-size: .82rem; margin-bottom: 10px; } .metric strong { font-size: 1.65rem; } .grid { display: grid; gap: 14px; margin-top: 14px; } .three { grid-template-columns: repeat(3, minmax(0, 1fr)); } .two { grid-template-columns: 1.45fr 1fr; } .panel { padding: 20px; min-width: 0; } .breakdown,.activity { list-style: none; margin: 0; padding: 0; } .breakdown li { border-top: 1px solid #27272a; display: flex; justify-content: space-between; gap: 12px; padding: 11px 0; text-transform: capitalize; } .breakdown li:first-child { border-top: 0; padding-top: 0; } .tableWrap { overflow-x: auto; } table { border-collapse: collapse; font-size: .85rem; min-width: 600px; width: 100%; } th,td { border-top: 1px solid #27272a; padding: 10px 8px; text-align: left; white-space: nowrap; } th { color: #a1a1aa; font-size: .72rem; letter-spacing: .04em; text-transform: uppercase; } .activity li { border-top: 1px solid #27272a; display: flex; gap: 12px; justify-content: space-between; padding: 12px 0; } .activity li:first-child { border-top: 0; padding-top: 0; } .activity span,.activity time { color: #a1a1aa; display: block; font-size: .8rem; margin-top: 4px; } .activity time { white-space: nowrap; } @media (max-width: 900px) { .metrics,.three,.two { grid-template-columns: 1fr 1fr; } .two > :last-child { grid-column: span 2; } } @media (max-width: 600px) { .dashboard { padding: 28px 16px 48px; } .dashboardHeader,.metrics,.three,.two { grid-template-columns: 1fr; display: grid; } .two > :last-child { grid-column: auto; } }
      `}</style>
    </>
  );
}
