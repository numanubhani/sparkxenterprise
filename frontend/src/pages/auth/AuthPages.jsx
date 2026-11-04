import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, MailCheck, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import { useDocumentTitle } from '../../lib/useDocumentTitle.js';

const input =
  'h-11 w-full rounded-[4px] border border-slate-300 bg-white px-3.5 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand focus:outline-none';

function Shell({ title, subtitle, children, footer }) {
  return (
    <section className="bg-[radial-gradient(ellipse_at_top_left,#0b2a78_0%,#00102a_50%,#03184a_100%)] py-14">
      <div className="container-site flex justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-xl bg-white p-7 text-navy-900 shadow-2xl sm:p-9">
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-5 text-center text-sm text-slate-300">{footer}</div>}
        </div>
      </div>
    </section>
  );
}

function Label({ children }) {
  return <span className="mb-1.5 block text-[13px] font-medium text-slate-700">{children}</span>;
}

function PasswordInput({ value, onChange, autoComplete = 'current-password', placeholder = '••••••••' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input required type={show ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} placeholder={placeholder} className={`${input} pr-11`} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-900">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

const ErrorBox = ({ msg }) => (msg ? <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</p> : null);
const nextPath = (params, user) => {
  const n = params.get('next');
  if (n && n.startsWith('/')) return n;
  return user?.role === 'admin' ? '/admin' : '/account';
};

export function Login() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [state, setState] = useState({ loading: false, error: '' });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '' });
    try {
      const user = await login(form.email, form.password);
      navigate(nextPath(params, user), { replace: true });
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };

  return (
    <Shell
      title="Log in to your account"
      subtitle="Track your requests, review quotes and manage your company profile."
      footer={
        <>
          New to SPARK X?{' '}
          <Link to={`/register${params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`} className="font-semibold text-brand-sky hover:text-white">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <Label>Business email</Label>
          <input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-slate-700">
            Password
            <Link to="/forgot-password" className="font-normal text-brand hover:underline">
              Forgot password?
            </Link>
          </span>
          <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <ErrorBox msg={state.error} />
        <button type="submit" disabled={state.loading} className="btn-blue h-12 w-full text-[15px] disabled:opacity-60">
          {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Log in <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-5 text-center text-xs text-slate-500">You don’t need an account to request a quote.</p>
    </Shell>
  );
}

export function Register() {
  useDocumentTitle('Create an account');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '', website: '' });
  const [state, setState] = useState({ loading: false, error: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '' });
    try {
      const user = await register(form);
      navigate(nextPath(params, user), { replace: true });
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };

  return (
    <Shell
      title="Create your account"
      subtitle="Save products, track quote requests and complete KYB once for future orders."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-sky hover:text-white">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <Label>Full name *</Label>
            <input required value={form.name} onChange={set('name')} autoComplete="name" placeholder="John Smith" className={input} />
          </label>
          <label className="block">
            <Label>Company</Label>
            <input value={form.company} onChange={set('company')} autoComplete="organization" placeholder="Your Company Inc." className={input} />
          </label>
        </div>
        <label className="block">
          <Label>Business email *</Label>
          <input required type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@company.com" className={input} />
        </label>
        <label className="block">
          <Label>Password *</Label>
          <PasswordInput value={form.password} onChange={set('password')} autoComplete="new-password" placeholder="At least 8 characters" />
          <span className="mt-1 block text-xs text-slate-500">At least 8 characters, including a letter and a number.</span>
        </label>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} className="hidden" aria-hidden="true" />
        <ErrorBox msg={state.error} />
        <button type="submit" disabled={state.loading} className="btn-blue h-12 w-full text-[15px] disabled:opacity-60">
          {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Create account <ArrowRight className="h-4 w-4" />
        </button>
        <p className="text-center text-xs text-slate-500">We’ll send you an email to verify your address.</p>
      </form>
    </Shell>
  );
}

export function ForgotPassword() {
  useDocumentTitle('Reset your password');
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ loading: false, error: '', done: '' });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '', done: '' });
    try {
      const d = await api('/api/auth/forgot-password', { method: 'POST', body: { email } });
      setState({ loading: false, error: '', done: d.message });
    } catch (err) {
      setState({ loading: false, error: err.message, done: '' });
    }
  };

  return (
    <Shell title="Forgot your password?" subtitle="Enter your account email and we’ll send you a reset link." footer={<Link to="/login" className="font-semibold text-brand-sky hover:text-white">Back to log in</Link>}>
      {state.done ? (
        <div className="flex gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
          <MailCheck className="h-5 w-5 shrink-0" /> {state.done}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <Label>Business email</Label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} placeholder="you@company.com" />
          </label>
          <ErrorBox msg={state.error} />
          <button type="submit" disabled={state.loading} className="btn-blue h-12 w-full text-[15px] disabled:opacity-60">
            Send reset link
          </button>
        </form>
      )}
    </Shell>
  );
}

export function ResetPassword() {
  useDocumentTitle('Choose a new password');
  const [params] = useSearchParams();
  const token = params.get('token');
  const { startSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [state, setState] = useState({ loading: false, error: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setState({ loading: false, error: 'Passwords do not match.' });
    setState({ loading: true, error: '' });
    try {
      const d = await api('/api/auth/reset-password', { method: 'POST', body: { token, password: form.password } });
      const user = startSession(d);
      navigate(user.role === 'admin' ? '/admin' : '/account', { replace: true });
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };

  if (!token) {
    return (
      <Shell title="Invalid reset link" subtitle="This link is missing its token. Please request a new one.">
        <Link to="/forgot-password" className="btn-blue h-11 w-full text-sm">
          Request a new link
        </Link>
      </Shell>
    );
  }

  return (
    <Shell title="Choose a new password">
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <Label>New password</Label>
          <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" placeholder="At least 8 characters" />
        </label>
        <label className="block">
          <Label>Confirm password</Label>
          <PasswordInput value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" />
        </label>
        <ErrorBox msg={state.error} />
        <button type="submit" disabled={state.loading} className="btn-blue h-12 w-full text-[15px] disabled:opacity-60">
          <Lock className="h-4 w-4" /> Update password
        </button>
      </form>
    </Shell>
  );
}

export function VerifyEmail() {
  useDocumentTitle('Verify your email');
  const [params] = useSearchParams();
  const { user, setUser } = useAuth();
  const [state, setState] = useState({ status: 'loading', message: '', linked: 0 });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode runs effects twice in dev; the token is single-use
    ran.current = true;
    const token = params.get('token');
    if (!token) return setState({ status: 'error', message: 'This verification link is missing its token.' });
    api('/api/auth/verify-email', { method: 'POST', body: { token } })
      .then((d) => {
        setState({ status: 'ok', linked: d.linkedRequests });
        if (user && user.id === d.user.id) setUser(d.user);
      })
      .catch((err) => setState({ status: 'error', message: err.message }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Shell title="Email verification">
      {state.status === 'loading' && (
        <p className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" /> Verifying…
        </p>
      )}
      {state.status === 'ok' && (
        <div>
          <p className="flex items-center gap-3 font-semibold text-emerald-700">
            <CheckCircle2 className="h-6 w-6" /> Your email is verified.
          </p>
          {state.linked > 0 && <p className="mt-2 text-sm text-slate-600">{state.linked} earlier request(s) made with this email are now linked to your account.</p>}
          <Link to={user ? '/account' : '/login'} className="btn-blue mt-6 h-11 w-full text-sm">
            {user ? 'Go to my account' : 'Log in'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
      {state.status === 'error' && (
        <div>
          <p className="flex items-center gap-3 font-semibold text-red-700">
            <XCircle className="h-6 w-6" /> {state.message}
          </p>
          <p className="mt-2 text-sm text-slate-600">Log in and use “Resend verification email” in your account to get a new link.</p>
          <Link to="/account" className="btn-blue mt-6 h-11 w-full text-sm">
            Go to my account
          </Link>
        </div>
      )}
    </Shell>
  );
}
