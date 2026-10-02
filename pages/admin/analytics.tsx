import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import {
  analyticsDashboardIsConfigured,
  isAnalyticsDashboardAuthorized,
} from "@/lib/analytics-auth";
import { getAnalyticsSnapshot, type AnalyticsSnapshot } from "@/lib/analytics-dashboard";

type DashboardProps = {
  snapshot: AnalyticsSnapshot | null;
  authorized: boolean;
};

export const getServerSideProps: GetServerSideProps<DashboardProps> = async ({
  req,
  res,
  query,
}) => {
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
    return {
      props: { snapshot: await getAnalyticsSnapshot(days), authorized: true },
    };
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
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function shortDate(value: string): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

/** Formats "City, Region, Country" into hierarchical "Country → Region → City" */
function formatHierarchyLocation(raw: string): string {
  if (!raw || raw === "Unknown" || raw === "unknown") return "Unknown location";
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 1) return parts[0];
  return parts.reverse().join(" → ");
}

function Breakdown({ title, rows }: { title: string; rows: AnalyticsSnapshot["sources"] }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {rows.length ? (
        <ol className="breakdown">
          {rows.map((row) => (
            <li key={row.label}>
              <span title={row.label}>{formatHierarchyLocation(displayLabel(row.label))}</span>
              <strong>{count(row.value)}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty">No data yet.</p>
      )}
    </section>
  );
}

function VisitorTypeBadge({ type }: { type: string }) {
  switch (type) {
    case "returning":
      return <span className="badge badge-returning">Returning</span>;
    case "known_bot":
      return <span className="badge badge-bot">Bot</span>;
    case "suspicious":
      return <span className="badge badge-suspicious">Suspicious</span>;
    default:
      return <span className="badge badge-human">Human</span>;
  }
}

function BotCategoryBadge({ category }: { category: string }) {
  const labels: Record<string, string> = {
    search_crawler: "Search",
    social_preview: "Social",
    ai_crawler: "AI",
    monitoring: "Monitor",
    feed_reader: "Feed",
    seo_tool: "SEO",
    security_scanner: "Security",
    unknown_bot: "Script",
  };
  return <span className="badge badge-category">{labels[category] || category}</span>;
}

export default function AnalyticsDashboard({
  snapshot,
  authorized,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!authorized) return <p>Authentication required.</p>;
  if (!snapshot)
    return (
      <main className="dashboard">
        <h1>Analytics is temporarily unavailable</h1>
        <p>Check MongoDB and the analytics environment variables, then refresh.</p>
      </main>
    );

  const cards = [
    { label: "Unique visitors", value: snapshot.overview.visitors, note: "Human traffic" },
    { label: "Returning visitors", value: snapshot.overview.returningVisitors, note: "Anonymous cookie" },
    { label: "Sessions", value: snapshot.overview.sessions, note: "Total human sessions" },
    { label: "Page views", value: snapshot.overview.pageViews, note: "Total pages viewed" },
    { label: "Avg. session", value: `${snapshot.overview.averageSessionMinutes} min`, note: "Human duration" },
    { label: "Bot / script hits", value: snapshot.overview.botSessions, note: "Filtered out of metrics" },
  ];

  return (
    <>
      <Head>
        <title>Private Portfolio Analytics</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className="dashboard">
        <header className="dashboardHeader">
          <div>
            <p className="eyebrow">Private dashboard</p>
            <h1>Portfolio Analytics</h1>
            <p className="muted">
              First-party, privacy-conscious visitor intelligence. Updated {date(snapshot.generatedAt)}.
            </p>
          </div>
          <nav aria-label="Date range">
            {[7, 30, 90].map((days) => (
              <a
                className={snapshot.days === days ? "active" : ""}
                href={`/admin/analytics?days=${days}`}
                key={days}
              >
                {days} days
              </a>
            ))}
          </nav>
        </header>

        {/* ── Top Overview Metrics ── */}
        <section className="metrics">
          {cards.map((card) => (
            <article className="metric" key={card.label}>
              <div className="metricHeader">
                <span>{card.label}</span>
                {card.note && <small className="metricNote">{card.note}</small>}
              </div>
              <strong>{typeof card.value === "number" ? count(card.value) : card.value}</strong>
            </article>
          ))}
        </section>

        {/* ── Returning Visitors Profile Cards ── */}
        <section className="panel sectionSpacing">
          <div className="panelHeader">
            <div>
              <h2>Recognized Returning Visitors & Devices</h2>
              <p className="muted subtext">
                Identified via anonymous 1-year first-party cookie. No personal identity or fingerprinting.
              </p>
            </div>
            <span className="countBadge">{snapshot.topVisitors.length} active</span>
          </div>

          {snapshot.topVisitors.length ? (
            <div className="visitorCardsGrid">
              {snapshot.topVisitors.map((visitor, idx) => (
                <article className="visitorCard" key={visitor.id || idx}>
                  <div className="visitorCardHeader">
                    <span className="visitorId">Visitor #{visitor.id}</span>
                    <span className="badge badge-returning">{visitor.totalSessions} visits</span>
                  </div>
                  <dl className="visitorDetails">
                    <div>
                      <dt>Device</dt>
                      <dd>{visitor.deviceModel && visitor.deviceModel !== "unknown" ? visitor.deviceModel : visitor.device}</dd>
                    </div>
                    <div>
                      <dt>OS & Browser</dt>
                      <dd>{visitor.os} · {visitor.browser}</dd>
                    </div>
                    <div>
                      <dt>Location</dt>
                      <dd className="locationText" title={visitor.location}>
                        {formatHierarchyLocation(visitor.location)}
                      </dd>
                    </div>
                    <div>
                      <dt>First seen</dt>
                      <dd>{shortDate(visitor.firstSeenAt)}</dd>
                    </div>
                    <div>
                      <dt>Last seen</dt>
                      <dd>{shortDate(visitor.lastSeenAt)}</dd>
                    </div>
                    <div>
                      <dt>Pages viewed</dt>
                      <dd><strong>{visitor.totalPageViews}</strong></dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty">
              No returning visitors yet in this timeframe. As visitors return with the anonymous cookie, their multi-session profile will appear here.
            </p>
          )}
        </section>

        {/* ── Main Breakdowns ── */}
        <section className="grid three">
          <Breakdown title="Traffic sources" rows={snapshot.sources} />
          <Breakdown title="Locations (Country → Region → City)" rows={snapshot.locations} />
          <Breakdown title="Devices & Form Factor" rows={snapshot.devices} />
        </section>

        <section className="grid three">
          <Breakdown title="Browsers & Versions" rows={snapshot.browsers} />
          <Breakdown title="Top pages viewed" rows={snapshot.pages} />
          <Breakdown title="Most-viewed sections" rows={snapshot.sections} />
        </section>

        {/* ── Meaningful Actions & Bot Traffic ── */}
        <section className="grid two">
          <Breakdown title="Meaningful Actions (Clicks & Downloads)" rows={snapshot.actions} />

          <section className="panel">
            <div className="panelHeader">
              <div>
                <h2>Bots & Crawlers Activity</h2>
                <p className="muted subtext">Automated traffic categorized by User-Agent signature</p>
              </div>
            </div>
            {snapshot.botTraffic.length ? (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Crawler / Bot</th>
                      <th>Category</th>
                      <th>Hits</th>
                      <th>Target Paths</th>
                      <th>Last seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.botTraffic.map((bot, i) => (
                      <tr key={`${bot.botName}-${i}`}>
                        <td><strong>{bot.botName}</strong></td>
                        <td><BotCategoryBadge category={bot.botCategory} /></td>
                        <td>{count(bot.count)}</td>
                        <td className="pathsCell">
                          {bot.topPaths.length > 0 ? (
                            bot.topPaths.map((p) => (
                              <code key={p} className="pathTag">{p}</code>
                            ))
                          ) : (
                            <span className="muted">/</span>
                          )}
                        </td>
                        <td>{shortDate(bot.lastSeenAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty">No bot or crawler activity detected in this period.</p>
            )}
          </section>
        </section>

        {/* ── Recent Sessions Table & Event Feed ── */}
        <section className="grid two">
          <section className="panel">
            <h2>Recent sessions</h2>
            {snapshot.recentSessions.length ? (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Session</th>
                      <th>Location</th>
                      <th>Device & Browser</th>
                      <th>Source</th>
                      <th>Events</th>
                      <th>Last active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.recentSessions.map((session) => (
                      <tr key={session.id}>
                        <td><VisitorTypeBadge type={session.visitorType} /></td>
                        <td><code>{session.id}</code></td>
                        <td className="locationCell" title={session.location}>
                          {formatHierarchyLocation(session.location)}
                        </td>
                        <td>
                          <span>
                            {session.deviceModel && session.deviceModel !== "unknown"
                              ? session.deviceModel
                              : session.device}
                          </span>
                          <span className="muted subspan">
                            {session.browser} · {session.os}
                          </span>
                        </td>
                        <td>{session.source}</td>
                        <td>{session.events}</td>
                        <td>{date(session.lastSeenAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty">No sessions yet.</p>
            )}
          </section>

          <section className="panel">
            <h2>Live Event Activity</h2>
            {snapshot.recentEvents.length ? (
              <ol className="activity">
                {snapshot.recentEvents.map((event, index) => (
                  <li key={`${event.occurredAt}-${index}`}>
                    <div>
                      <strong>{displayLabel(event.type)}</strong>
                      <span>{event.target || event.path}</span>
                    </div>
                    <time>{date(event.occurredAt)}</time>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="empty">No events yet.</p>
            )}
          </section>
        </section>

        {/* ── Accuracy & Privacy Disclosure Card ── */}
        <section className="panel accuracyBanner">
          <h3>Information Precision & Privacy Notice</h3>
          <div className="accuracyGrid">
            <div>
              <strong className="accuracyTitle green">Exact / Verified</strong>
              <p className="muted">
                Visited pages, section scrolls, button clicks, resume downloads, referrer domain, screen dimensions, client timezone, and returning visits (via anonymous UUID cookie).
              </p>
            </div>
            <div>
              <strong className="accuracyTitle yellow">Approximate / Inferred</strong>
              <p className="muted">
                Location derived from Vercel edge IP headers (accurate to country and city level, not street level). Device model inferred from standard browser User-Agent strings.
              </p>
            </div>
            <div>
              <strong className="accuracyTitle red">Protected / Impossible</strong>
              <p className="muted">
                No personal identity (names/emails), no canvas/audio fingerprinting, no street address, and no cross-site tracking. Fully compliant with privacy regulations.
              </p>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        * { box-sizing: border-box; }
        body { background: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; }
        .dashboard { max-width: 1320px; margin: 0 auto; padding: 40px 24px 72px; }
        .dashboardHeader { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 26px; }
        h1, h2, h3, p { margin-top: 0; }
        h1 { font-size: clamp(1.8rem, 4vw, 2.75rem); margin-bottom: 6px; letter-spacing: -0.02em; }
        h2 { font-size: 1.1rem; margin-bottom: 4px; font-weight: 600; }
        h3 { font-size: 0.95rem; margin-bottom: 12px; color: #e4e4e7; }
        .eyebrow { color: #a1a1aa; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px; }
        .muted, .empty { color: #a1a1aa; }
        .subtext { font-size: 0.8rem; margin-bottom: 0; }
        .subspan { display: block; font-size: 0.75rem; margin-top: 2px; }

        nav { display: flex; gap: 8px; flex-wrap: wrap; }
        nav a { border: 1px solid #3f3f46; border-radius: 999px; color: #d4d4d8; padding: 6px 14px; text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: all 0.15s; }
        nav a:hover { border-color: #71717a; color: #fff; }
        nav a.active { background: #f4f4f5; color: #09090b; border-color: #f4f4f5; }

        .metrics { display: grid; gap: 12px; grid-template-columns: repeat(6, minmax(0, 1fr)); margin-bottom: 16px; }
        .metric, .panel { background: #18181b; border: 1px solid #27272a; border-radius: 12px; }
        .metric { padding: 16px 18px; display: flex; flex-direction: column; justify-content: space-between; }
        .metricHeader { display: flex; flex-direction: column; margin-bottom: 8px; }
        .metric span { color: #a1a1aa; font-size: 0.78rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
        .metricNote { color: #71717a; font-size: 0.7rem; margin-top: 2px; }
        .metric strong { font-size: 1.6rem; font-weight: 700; }

        .sectionSpacing { margin-top: 14px; margin-bottom: 14px; }
        .panelHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .countBadge { background: #27272a; color: #e4e4e7; font-size: 0.75rem; padding: 3px 10px; border-radius: 999px; font-weight: 500; }

        /* Visitor Profile Cards */
        .visitorCardsGrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
        .visitorCard { background: #121215; border: 1px solid #27272a; border-radius: 10px; padding: 14px 16px; }
        .visitorCardHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #27272a; }
        .visitorId { font-family: monospace; font-size: 0.85rem; font-weight: 600; color: #60a5fa; }
        .visitorDetails { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; font-size: 0.8rem; margin: 0; }
        .visitorDetails dt { color: #71717a; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; }
        .visitorDetails dd { margin: 0; color: #e4e4e7; font-weight: 500; }
        .locationText { grid-column: span 2; word-break: break-word; color: #34d399 !important; }

        /* Badges */
        .badge { display: inline-block; font-size: 0.7rem; padding: 2px 7px; border-radius: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .badge-human { background: #14532d; color: #86efac; }
        .badge-returning { background: #1e3a8a; color: #93c5fd; }
        .badge-bot { background: #451a03; color: #fdba74; }
        .badge-suspicious { background: #7f1d1d; color: #fca5a5; }
        .badge-category { background: #27272a; color: #d4d4d8; font-size: 0.68rem; }

        .grid { display: grid; gap: 14px; margin-top: 14px; }
        .three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .two { grid-template-columns: 1.4fr 1fr; }
        .panel { padding: 20px; min-width: 0; }
        .breakdown, .activity { list-style: none; margin: 0; padding: 0; }
        .breakdown li { border-top: 1px solid #27272a; display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; font-size: 0.85rem; }
        .breakdown li:first-child { border-top: 0; padding-top: 0; }
        .breakdown li span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .tableWrap { overflow-x: auto; }
        table { border-collapse: collapse; font-size: 0.82rem; min-width: 600px; width: 100%; }
        th, td { border-top: 1px solid #27272a; padding: 9px 8px; text-align: left; }
        th { color: #a1a1aa; font-size: 0.7rem; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 600; }
        td code { font-family: monospace; color: #93c5fd; font-size: 0.8rem; }
        .locationCell { color: #e4e4e7; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pathsCell { display: flex; gap: 4px; flex-wrap: wrap; }
        .pathTag { background: #27272a; padding: 2px 5px; border-radius: 4px; font-size: 0.72rem; color: #d4d4d8; }

        .activity li { border-top: 1px solid #27272a; display: flex; gap: 12px; justify-content: space-between; padding: 10px 0; }
        .activity li:first-child { border-top: 0; padding-top: 0; }
        .activity strong { font-size: 0.82rem; }
        .activity span, .activity time { color: #a1a1aa; display: block; font-size: 0.78rem; margin-top: 2px; }
        .activity time { white-space: nowrap; font-size: 0.72rem; }

        /* Accuracy Banner */
        .accuracyBanner { margin-top: 16px; background: #121215; border-color: #27272a; }
        .accuracyGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 8px; }
        .accuracyTitle { display: block; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
        .accuracyTitle.green { color: #34d399; }
        .accuracyTitle.yellow { color: #fbbf24; }
        .accuracyTitle.red { color: #f87171; }
        .accuracyGrid p { font-size: 0.78rem; line-height: 1.45; margin: 0; }

        @media (max-width: 1024px) {
          .metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .three { grid-template-columns: 1fr; }
          .two { grid-template-columns: 1fr; }
          .accuracyGrid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .dashboard { padding: 20px 14px 48px; }
          .metrics { grid-template-columns: 1fr 1fr; }
          .dashboardHeader { flex-direction: column; }
        }
      `}</style>
    </>
  );
}
