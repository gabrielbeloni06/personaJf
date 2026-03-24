'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setMessage(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        setMessage('Erro ao obter o perfil do utilizador.');
        setLoading(false);
        return;
      }

      if (profileData.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/central');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-neutral-900 p-8 rounded-xl shadow-lg border border-orange-500 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">Iniciar Sessão</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300">Palavra-passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              required
            />
          </div>
          {message && <p className="text-sm text-center text-red-500">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'A processar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}