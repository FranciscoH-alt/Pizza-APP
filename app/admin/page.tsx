import { supabaseService } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ─── Types ────────────────────────────────────────────────────────────────────

type IpSession = { ip_address: string; session_id: string; created_at: string; updated_at: string };
type VoteRow   = { session_id: string; selected: 'a' | 'b'; battles: { title: string; option_a: string; option_b: string } | null };
type EventRow  = { session_id: string | null; event_name: string; metadata: Record<string, unknown> | null; created_at: string };

type SessionRow = {
  session_id: string;
  ip_address:    string;
  last_seen:     string;
  votes:         { option: string; side: 'a' | 'b' }[];
  played_again:  boolean;
  promo_copied:  boolean;
  promo_claimed: boolean;
  deal_used:     boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Badge({ active }: { active: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 9999,
      fontSize: '0.6875rem', fontWeight: 700,
      background: active ? '#DCFCE7' : '#F3F4F6',
      color:      active ? '#15803D' : '#9CA3AF',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#22C55E' : '#D1D5DB' }} />
      {active ? 'Yes' : 'No'}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
      <p style={{ margin: 0, fontSize: '0.625rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
      <p style={{ margin: '6px 0 0', fontSize: '2rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: '4px 0 0', fontSize: '0.6875rem', color: '#9CA3AF' }}>{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminPage() {

  // Fetch in parallel
  const [ipRes, votesRes, eventsRes] = await Promise.all([
    supabaseService
      .from('ip_sessions')
      .select('ip_address, session_id, created_at, updated_at')
      .order('updated_at', { ascending: false }),

    supabaseService
      .from('votes')
      .select('session_id, selected, battles(title, option_a, option_b)')
      .order('created_at', { ascending: false }),

    supabaseService
      .from('events')
      .select('session_id, event_name, metadata, created_at')
      .in('event_name', ['promo_code_copied', 'promo_code_claimed', 'deal_clicked'])
      .order('created_at', { ascending: false }),
  ]);

  const ipSessions: IpSession[] = (ipRes.data  as IpSession[])                  ?? [];
  const votes:      VoteRow[]   = (votesRes.data as unknown as VoteRow[])        ?? [];
  const events:     EventRow[]  = (eventsRes.data as unknown as EventRow[])      ?? [];

  // Build one row per IP session
  const rows: SessionRow[] = ipSessions.map((s) => {
    const sv = votes.filter((v) => v.session_id === s.session_id);
    const se = events.filter((e) => e.session_id === s.session_id);

    return {
      session_id:    s.session_id,
      ip_address:    s.ip_address,
      last_seen:     s.updated_at,
      votes: sv.map((v) => ({
        option: v.selected === 'a' ? (v.battles?.option_a ?? 'Option A') : (v.battles?.option_b ?? 'Option B'),
        side:   v.selected,
      })),
      played_again:  sv.length > 1,
      promo_copied:  se.some((e) => e.event_name === 'promo_code_copied'),
      promo_claimed: se.some((e) => e.event_name === 'promo_code_claimed'),
      deal_used:     se.some((e) =>
        e.event_name === 'deal_clicked' &&
        (e.metadata?.cta_type === 'order' || e.metadata?.cta_type === 'copy_code'),
      ),
    };
  });

  // Summary numbers
  const totalVotes      = votes.length;
  const playedAgain     = rows.filter((r) => r.played_again).length;
  const promoCopied     = rows.filter((r) => r.promo_copied).length;
  const promoClaimed    = rows.filter((r) => r.promo_claimed).length;
  const dealUsed        = rows.filter((r) => r.deal_used).length;
  const conversionRate  = rows.length ? Math.round((promoCopied / rows.length) * 100) : 0;

  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const COLS = ['IP Address', 'Last Active', 'Choice(s)', 'Battles', 'Played Again', 'Promo Copied', 'Promo Claimed', 'Deal Used'];

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827' }}>

      {/* ── Top bar ── */}
      <div style={{ background: '#111827', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.01em' }}>The Daily Slice</span>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Analytics</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{now}</span>
          <a href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#374151', color: '#F9FAFB', borderRadius: 8, padding: '7px 14px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
            ↺ Refresh
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── Stats row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
          <StatCard label="Total Sessions"   value={rows.length}    sub="unique IPs" />
          <StatCard label="Total Votes"      value={totalVotes}     sub="across all battles" />
          <StatCard label="Played Again"     value={playedAgain}    sub={`${rows.length ? Math.round((playedAgain / rows.length) * 100) : 0}% of sessions`} />
          <StatCard label="Promo Copied"     value={promoCopied}    sub={`${conversionRate}% conversion`} />
          <StatCard label="Promo Claimed"    value={promoClaimed}   sub="clicked claim link" />
          <StatCard label="Deal Used"        value={dealUsed}       sub="copied or ordered" />
        </div>

        {/* ── Session table ── */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Session Activity</h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>{rows.length} unique visitors</p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {COLS.map((h) => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontWeight: 600, fontSize: '0.625rem',
                      color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
                      whiteSpace: 'nowrap', borderBottom: '1px solid #F3F4F6',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={COLS.length} style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>
                      No sessions recorded yet.
                    </td>
                  </tr>
                )}

                {rows.map((row, i) => (
                  <tr key={row.session_id} style={{ borderTop: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>

                    {/* IP Address */}
                    <td style={{ padding: '12px 16px', fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>
                      {row.ip_address}
                    </td>

                    {/* Last Active */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.75rem', color: '#6B7280' }}>
                      {new Date(row.last_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' '}
                      <span style={{ color: '#D1D5DB' }}>
                        {new Date(row.last_seen).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Choices */}
                    <td style={{ padding: '12px 16px', maxWidth: 240 }}>
                      {row.votes.length === 0 ? (
                        <span style={{ color: '#D1D5DB' }}>—</span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {row.votes.map((v, vi) => (
                            <span key={vi} style={{
                              display: 'inline-block',
                              padding: '2px 8px', borderRadius: 6,
                              fontSize: '0.6875rem', fontWeight: 600, whiteSpace: 'nowrap',
                              background: v.side === 'a' ? '#EFF6FF' : '#FFF7ED',
                              color:      v.side === 'a' ? '#1D4ED8' : '#C2410C',
                            }}>
                              {v.option}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Battle count */}
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem', color: row.votes.length > 0 ? '#111827' : '#D1D5DB' }}>
                      {row.votes.length || '—'}
                    </td>

                    {/* Played Again */}
                    <td style={{ padding: '12px 16px' }}><Badge active={row.played_again} /></td>

                    {/* Promo Copied */}
                    <td style={{ padding: '12px 16px' }}><Badge active={row.promo_copied} /></td>

                    {/* Promo Claimed */}
                    <td style={{ padding: '12px 16px' }}><Badge active={row.promo_claimed} /></td>

                    {/* Deal Used */}
                    <td style={{ padding: '12px 16px' }}><Badge active={row.deal_used} /></td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p style={{ marginTop: 16, textAlign: 'center', fontSize: '0.6875rem', color: '#D1D5DB' }}>
          /admin · served fresh on every load · not linked from the main app
        </p>
      </div>
    </div>
  );
}
