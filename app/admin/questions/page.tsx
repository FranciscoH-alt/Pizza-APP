'use client';

import { useEffect, useRef, useState } from 'react';
import type { AdminBattleListItem } from '@/types';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function ImagePicker({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>
        {label} photo
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          height: 140,
          borderRadius: 10,
          border: '2px dashed #E5E7EB',
          background: previewUrl ? '#111827' : '#F9FAFB',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={`${label} preview`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '0.8125rem', color: '#9CA3AF', fontWeight: 600 }}>Tap to choose a photo</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export default function ManageQuestionsPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [battles, setBattles] = useState<AdminBattleListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [imageA, setImageA] = useState<File | null>(null);
  const [imageB, setImageB] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [correctOption, setCorrectOption] = useState<'a' | 'b' | null>(null);
  const [funFact, setFunFact] = useState('');
  const [liveDate, setLiveDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadBattles() {
    setListLoading(true);
    try {
      const res = await fetch('/api/admin/battles');
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setBattles(data.battles ?? []);
        setAuthed(true);
      }
    } finally {
      setListLoading(false);
      setCheckingAuth(false);
    }
  }

  useEffect(() => {
    loadBattles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error ?? 'Incorrect password');
        return;
      }
      setPassword('');
      await loadBattles();
    } catch {
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setAuthSubmitting(false);
    }
  }

  const canSubmit =
    optionA.trim() && optionB.trim() && imageA && imageB && question.trim() && correctOption && !submitting;

  function resetForm() {
    setOptionA('');
    setOptionB('');
    setImageA(null);
    setImageB(null);
    setQuestion('');
    setCorrectOption(null);
    setFunFact('');
    setLiveDate(todayISO());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const form = new FormData();
      form.set('option_a', optionA.trim());
      form.set('option_b', optionB.trim());
      form.set('question', question.trim());
      form.set('correct_option', correctOption!);
      form.set('fun_fact', funFact.trim());
      form.set('live_date', liveDate);
      form.set('image_a', imageA!);
      form.set('image_b', imageB!);

      const res = await fetch('/api/admin/battles', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) {
        setFormError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setFormSuccess("Question added! It's now live and in the rotation.");
      resetForm();
      await loadBattles();
    } catch {
      setFormError('Could not reach the server. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(battle: AdminBattleListItem) {
    const confirmed = window.confirm(`Delete "${battle.option_a} vs ${battle.option_b}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(battle.id);
    try {
      const res = await fetch(`/api/admin/battles/${battle.id}`, { method: 'DELETE' });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (res.ok) {
        setBattles((prev) => prev.filter((b) => b.id !== battle.id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? 'Could not delete. Please try again.');
      }
    } finally {
      setDeletingId(null);
    }
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#F5F5F5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#111827',
  };

  const topBar = (
    <div style={{ background: '#111827', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.01em' }}>The Daily Slice</span>
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Manage Questions</span>
      </div>
      <a href="/admin" style={{ fontSize: '0.75rem', color: '#9CA3AF', textDecoration: 'none', fontWeight: 600 }}>
        ← Analytics
      </a>
    </div>
  );

  if (checkingAuth) {
    return (
      <div style={pageStyle}>
        {topBar}
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: '#9CA3AF' }}>Loading…</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={pageStyle}>
        {topBar}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
          <form
            onSubmit={handleLogin}
            style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 360, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Enter password</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.9375rem', marginBottom: 12, boxSizing: 'border-box' }}
            />
            {authError && (
              <p style={{ margin: '0 0 12px', color: '#DC2626', fontSize: '0.8125rem' }}>{authError}</p>
            )}
            <button
              type="submit"
              disabled={authSubmitting || !password}
              style={{ width: '100%', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: '0.875rem', cursor: authSubmitting ? 'default' : 'pointer', opacity: authSubmitting || !password ? 0.6 : 1 }}
            >
              {authSubmitting ? 'Checking…' : 'Unlock'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {topBar}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
        {/* ── Add form ── */}
        <form
          onSubmit={handleSubmit}
          style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}
        >
          <h2 style={{ margin: '0 0 18px', fontSize: '0.9375rem', fontWeight: 700 }}>Add a question</h2>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>Option A name</label>
              <input
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                placeholder="e.g. Deep Dish"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.875rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>Option B name</label>
              <input
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                placeholder="e.g. Thin Crust"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.875rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <ImagePicker label={optionA.trim() || 'Option A'} file={imageA} onChange={setImageA} />
            <ImagePicker label={optionB.trim() || 'Option B'} file={imageB} onChange={setImageB} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which pizza style has the crispiest crust?"
              rows={2}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.875rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>Correct answer</label>
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="radio" name="correct" checked={correctOption === 'a'} onChange={() => setCorrectOption('a')} />
                {optionA.trim() || 'Option A'}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="radio" name="correct" checked={correctOption === 'b'} onChange={() => setCorrectOption('b')} />
                {optionB.trim() || 'Option B'}
              </label>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>Fun fact (optional)</label>
            <textarea
              value={funFact}
              onChange={(e) => setFunFact(e.target.value)}
              placeholder="A short fact shown after voting"
              rows={2}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.875rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>Go live on</label>
            <input
              type="date"
              value={liveDate}
              onChange={(e) => setLiveDate(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.875rem' }}
            />
          </div>

          {formError && (
            <p style={{ margin: '0 0 12px', color: '#DC2626', fontSize: '0.8125rem', fontWeight: 600 }}>{formError}</p>
          )}
          {formSuccess && (
            <p style={{ margin: '0 0 12px', color: '#15803D', fontSize: '0.8125rem', fontWeight: 600 }}>{formSuccess}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              background: '#D93025',
              color: '#fff',
              border: 'none',
              borderRadius: 9999,
              padding: '12px 28px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: canSubmit ? 'pointer' : 'default',
              opacity: canSubmit ? 1 : 0.5,
            }}
          >
            {submitting ? 'Publishing…' : 'Add question'}
          </button>
        </form>

        {/* ── List ── */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6' }}>
            <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Existing questions</h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>{battles.length} total</p>
          </div>

          {listLoading && battles.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading…</div>
          ) : battles.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No questions yet.</div>
          ) : (
            <div>
              {battles.map((b, i) => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 24px',
                    borderTop: i === 0 ? undefined : '1px solid #F3F4F6',
                    background: i % 2 === 0 ? '#fff' : '#FAFAFA',
                  }}
                >
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {[b.image_a, b.image_b].map((src, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={idx}
                        src={src ?? undefined}
                        alt=""
                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, background: '#F3F4F6' }}
                      />
                    ))}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.option_a} vs {b.option_b}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
                      Live {b.start_date} · {b.votes_a + b.votes_b} votes
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(b)}
                    disabled={deletingId === b.id}
                    style={{
                      flexShrink: 0,
                      background: 'none',
                      border: '1.5px solid #FCA5A5',
                      color: '#DC2626',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: deletingId === b.id ? 'default' : 'pointer',
                      opacity: deletingId === b.id ? 0.5 : 1,
                    }}
                  >
                    {deletingId === b.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
