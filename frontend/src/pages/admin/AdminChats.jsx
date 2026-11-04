import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { api } from '../../lib/api.js';
import { fmtDate } from '../../lib/format.js';
import { ErrorNote, Loading, PageTitle, SuccessNote, lightInput } from '../account/ui.jsx';

// Re-fetches every `ms` without flashing a spinner
function usePoll(path, ms) {
  const [state, setState] = useState({ data: null, error: '' });
  const load = useCallback(async () => {
    try {
      setState({ data: await api(path), error: '' });
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    }
  }, [path]);
  useEffect(() => {
    setState({ data: null, error: '' });
    load();
    const t = setInterval(() => !document.hidden && load(), ms);
    return () => clearInterval(t);
  }, [load, ms]);
  return { ...state, reload: load };
}

const clock = (d) => new Date(d).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function Thread({ id }) {
  const { data: chat, error, reload } = usePoll(`/api/admin/chats/${id}`, 5000);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ error: '', ok: '' });
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [chat?.messages?.length]);

  if (!chat) return error ? <ErrorNote msg={error} /> : <Loading />;

  const reply = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setMsg({ error: '', ok: '' });
    try {
      const r = await api(`/api/admin/chats/${id}/reply`, { method: 'POST', body: { text } });
      setText('');
      setMsg({ error: '', ok: r.emailed ? `Visitor has left the site — your reply was also emailed to ${chat.email}.` : '' });
      reload();
    } catch (err) {
      setMsg({ error: err.message, ok: '' });
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (status) => {
    await api(`/api/admin/chats/${id}`, { method: 'PATCH', body: { status } }).catch((err) => setMsg({ error: err.message, ok: '' }));
    reload();
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] min-h-[420px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-4">
        <div>
          <p className="font-semibold">{chat.name}{chat.company ? ` · ${chat.company}` : ''}</p>
          <p className="text-sm text-slate-600">
            <a href={`mailto:${chat.email}`} className="text-brand hover:underline">{chat.email}</a>
            {chat.user && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">Account</span>}
          </p>
          {chat.page && <p className="mt-0.5 break-all text-xs text-slate-400">Started on {chat.page} · {fmtDate(chat.createdAt, true)}</p>}
        </div>
        <button type="button" onClick={() => setStatus(chat.status === 'open' ? 'closed' : 'open')} className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50">
          {chat.status === 'open' ? 'Close conversation' : 'Reopen'}
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
        {chat.messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.from === 'agent' ? 'bg-brand text-white' : 'border border-slate-200 bg-white'}`}>
              <p className="whitespace-pre-wrap break-words">{m.text}</p>
              <p className={`mt-1 text-[10px] ${m.from === 'agent' ? 'text-white/70' : 'text-slate-400'}`}>{m.from === 'agent' ? `${m.by || 'Staff'} · ` : ''}{clock(m.at)}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={reply} className="space-y-2 border-t border-slate-200 p-3">
        <ErrorNote msg={msg.error} />
        <SuccessNote msg={msg.ok} />
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) reply(e);
            }}
            placeholder="Write a reply… (Enter to send, Shift+Enter for a new line)"
            className={`${lightInput} h-auto py-2`}
          />
          <button type="submit" disabled={busy || !text.trim()} className="btn-blue h-auto shrink-0 px-5 text-sm disabled:opacity-50">
            <Send className="h-4 w-4" /> Send
          </button>
        </div>
        <p className="text-[11px] text-slate-500">Do not promise availability, pricing or delivery dates in chat — those are confirmed in a written quotation.</p>
      </form>
    </div>
  );
}

export default function AdminChats() {
  const { id } = useParams();
  const [status, setStatus] = useState('');
  const { data: list, error } = usePoll(`/api/admin/chats${status ? `?status=${status}` : ''}`, 8000);

  return (
    <>
      <PageTitle title="Live chat" subtitle="Conversations from the website chat widget. You are emailed automatically for every new message." />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className={id ? 'hidden lg:block' : ''}>
          <div className="mb-3 flex gap-2 text-sm">
            {[['', 'All'], ['open', 'Open'], ['closed', 'Closed']].map(([v, l]) => (
              <button key={l} type="button" onClick={() => setStatus(v)} className={`rounded-full px-3 py-1 ${status === v ? 'bg-navy-900 text-white' : 'bg-white ring-1 ring-slate-200 hover:bg-slate-50'}`}>
                {l}
              </button>
            ))}
          </div>
          {!list ? (
            error ? <ErrorNote msg={error} /> : <Loading />
          ) : list.length ? (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {list.map((c) => {
                const last = c.messages?.[c.messages.length - 1];
                return (
                  <li key={c._id}>
                    <Link to={`/admin/chats/${c._id}`} className={`block px-4 py-3 hover:bg-slate-50 ${c._id === id ? 'bg-brand/5' : ''}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">{c.name}</span>
                        {c.unreadForAdmin > 0 && <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">{c.unreadForAdmin}</span>}
                      </div>
                      <p className="truncate text-xs text-slate-500">{c.company || c.email}</p>
                      {last && <p className="mt-1 truncate text-sm text-slate-600">{last.from === 'agent' ? 'You: ' : ''}{last.text}</p>}
                      <p className="mt-1 text-[11px] text-slate-400">{clock(c.lastMessageAt)}{c.status === 'closed' ? ' · closed' : ''}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-slate-400" /> No conversations yet.
            </div>
          )}
        </div>

        <div className={id ? '' : 'hidden lg:block'}>
          {id ? (
            <>
              <Link to="/admin/chats" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand lg:hidden">
                <ArrowLeft className="h-4 w-4" /> All conversations
              </Link>
              <Thread key={id} id={id} />
            </>
          ) : (
            <div className="grid h-64 place-items-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">Select a conversation</div>
          )}
        </div>
      </div>
    </>
  );
}
