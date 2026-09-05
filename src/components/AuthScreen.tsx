import { FormEvent, useState } from 'react';
import { LoaderCircle, Music } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) {
      setMessage('We could not complete that request. Check your details and try again.');
      return;
    }
    if (mode === 'sign-up') setMessage('Account created. You can start building your repertoire.');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment-100 px-4 py-10 dark:bg-wood-950">
      <div className="w-full max-w-md rounded-2xl border border-wood-200 bg-parchment-50 p-7 shadow-sheet dark:border-wood-700 dark:bg-wood-900">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-700 text-parchment-50"><Music className="h-6 w-6" /></div>
          <h1 className="font-display text-3xl font-semibold text-wood-800 dark:text-parchment-100">Welcome to Ethnotes</h1>
          <p className="mt-2 text-sm text-wood-500 dark:text-parchment-200/70">Keep your tunes close. Find your musical neighbours.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium text-wood-700 dark:text-parchment-100">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-lg border border-wood-200 bg-white px-3 py-2.5 outline-none focus:border-amber-500 dark:border-wood-700 dark:bg-wood-950" /></label>
          <label className="block text-sm font-medium text-wood-700 dark:text-parchment-100">Password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-lg border border-wood-200 bg-white px-3 py-2.5 outline-none focus:border-amber-500 dark:border-wood-700 dark:bg-wood-950" /></label>
          {message && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{message}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-700 px-4 py-2.5 font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{mode === 'sign-in' ? 'Sign in' : 'Create account'}</button>
        </form>
        <button onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(''); }} className="mt-5 w-full text-center text-sm text-amber-800 hover:underline dark:text-amber-300">{mode === 'sign-in' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>
      </div>
    </main>
  );
}
