import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Built-in live chat: fixed bottom-right on every public page (mobile included).
// Visitors start a chat with name + email + message; the owner is emailed automatically and replies from /admin/chats.
// If the visitor has left the site, the owner's reply is also emailed to them.
const STORE = 'sparkx-chat';
const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE) || 'null');
  } catch {
    return null;
  }
};
const writeStore = (v) => {
  try {
    if (v) localStorage.setItem(STORE, JSON.stringify(v));
    else localStorage.removeItem(STORE);
  } catch {
    /* storage unavailable */
  }
};

const time = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const input =
  'h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand focus:outline-none';

export default function LiveChat() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const hidden = pathname.startsWith('/admin');

  const [open, setOpen] = useState(false);
  const [conv, setConv] = useState(readStore); // { id, token }
  const [messages, setMessages] = useState([]);
  const [seen, setSeen] = useState(0); // messages the visitor has already looked at
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '', website: '' });
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const countRef = useRef(0);
  countRef.current = messages.length;

  const headers = useCallback(() => ({ 'X-Chat-Token': conv?.token }), [conv]);

  // Prefill from the logged-in account
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, name: f.name || user.name || '', email: f.email || user.email || '', company: f.company || user.company?.name || '' }));
  }, [user]);

  // Poll for new messages: quickly while the window is open, slowly (for the unread dot) while closed
  useEffect(() => {
    if (!conv || hidden) return undefined;
    let stop = false;
    const poll = async () => {
      try {
        const d = await api(`/api/chat/${conv.id}/messages?since=${countRef.current}`, { headers: headers() });
        if (stop) return;
        if (d.messages.length) setMessages((m) => [...m, ...d.messages]);
      } catch (err) {
        if (err.status === 404) {
          writeStore(null);
          setConv(null);
          setMessages([]);
          setSeen(0);
        }
      }
    };
    poll();
    const t = setInterval(() => {
      if (!document.hidden) poll();
    }, open ? 4000 : 20000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [conv, open, hidden, headers]);

  useEffect(() => {
    if (open) setSeen(messages.length);
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [open, messages.length]);

  if (hidden) return null;
  const unread = open ? 0 : messages.slice(seen).filter((m) => m.from === 'agent').length;

  const start = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const d = await api('/api/chat/start', { method: 'POST', body: { ...form, page: window.location.href } });
      const next = { id: d.id, token: d.token };
      writeStore(next);
      setConv(next);
      setMessages(d.messages);
      setSeen(d.messages.length);
      setForm((f) => ({ ...f, message: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    setError('');
    try {
      const d = await api(`/api/chat/${conv.id}/messages`, { method: 'POST', body: { text: t, since: messages.length }, headers: headers() });
      setMessages((m) => [...m, ...d.messages]);
      setText('');
    } catch (err) {
      if (err.status === 404) {
        writeStore(null);
        setConv(null);
        setMessages([]);
      }
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const newChat = () => {
    writeStore(null);
    setConv(null);
    setMessages([]);
    setSeen(0);
    setError('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 print:hidden">
      {open && (
        <div className="flex h-[min(520px,calc(100vh-6.5rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-navy-900 shadow-2xl sm:w-[360px]">
          <div className="flex items-center justify-between bg-navy-900 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">SPARK X Technology</p>
              <p className="text-xs text-slate-300">Chat with our team</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          {!conv ? (
            <form onSubmit={start} className="flex-1 space-y-3 overflow-y-auto p-4">
              <p className="text-sm text-slate-600">Leave your details and a message. We reply here, and by email if you leave the site.</p>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name *" className={input} autoComplete="name" />
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Business email *" className={input} autoComplete="email" />
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company (optional)" className={input} autoComplete="organization" />
              <textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help? *" className={`${input} h-auto py-2`} />
              <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" aria-hidden="true" />
              {error && <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
              <button type="submit" disabled={busy} className="btn-blue h-10 w-full text-sm disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start chat'}
              </button>
              <p className="text-[11px] leading-snug text-slate-500">Availability, pricing and delivery dates are only confirmed in a written quotation.</p>
            </form>
          ) : (
            <>
              <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.from === 'visitor' ? 'bg-brand text-white' : 'border border-slate-200 bg-white'}`}>
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      <p className={`mt-1 text-[10px] ${m.from === 'visitor' ? 'text-white/70' : 'text-slate-400'}`}>{m.from === 'agent' ? 'SPARK X · ' : ''}{time(m.at)}</p>
                    </div>
                  </div>
                ))}
                {messages.length > 0 && messages[messages.length - 1].from === 'visitor' && (
                  <p className="text-center text-xs text-slate-500">Thanks — our team will reply here. If you leave, we’ll email you.</p>
                )}
                <div ref={endRef} />
              </div>
              {error && <p className="bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>}
              <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-200 p-3">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" maxLength={2000} className={input} />
                <button type="submit" disabled={busy || !text.trim()} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded bg-brand text-white disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <button type="button" onClick={newChat} className="border-t border-slate-100 py-1.5 text-center text-[11px] text-slate-500 hover:text-brand">
                Start a new conversation
              </button>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open live chat'}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold">{unread}</span>}
      </button>
    </div>
  );
}
