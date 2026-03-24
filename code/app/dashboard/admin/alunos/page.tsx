'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function GestaoAlunos() {
  const [nome, setNome] = useState('');
  const [academiaNome, setAcademiaNome] = useState('');
  const [turno, setTurno] = useState('manha');
  const [alunos, setAlunos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    const { data, error } = await supabase
      .from('alunos')
      .select(`
        id,
        nome,
        turno,
        academias (nome)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAlunos(data);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let academiaId = null;
    
    const { data: existingAcademia } = await supabase
      .from('academias')
      .select('id')
      .ilike('nome', academiaNome)
      .single();

    if (existingAcademia) {
      academiaId = existingAcademia.id;
    } else {
      const { data: newAcademia, error: acadError } = await supabase
        .from('academias')
        .insert([{ nome: academiaNome }])
        .select('id')
        .single();

      if (!acadError && newAcademia) {
        academiaId = newAcademia.id;
      }
    }

    if (academiaId) {
      const { error } = await supabase
        .from('alunos')
        .insert([{ nome, academia_id: academiaId, turno }]);

      if (!error) {
        setNome('');
        setAcademiaNome('');
        setTurno('manha');
        fetchAlunos();
      }
    }
    setLoading(false);
  };

  const alunosFiltrados = alunos.filter(aluno => {
    const termo = busca.toLowerCase();
    const nomeMatch = aluno.nome.toLowerCase().includes(termo);
    const academiaMatch = aluno.academias?.nome?.toLowerCase().includes(termo);
    return nomeMatch || academiaMatch;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-100">Alunos</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 h-fit">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Cadastrar Novo Aluno</h3>
          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-1">Nome do Aluno</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:border-orange-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-neutral-300 mb-1">Nome da Academia</label>
              <input type="text" value={academiaNome} onChange={(e) => setAcademiaNome(e.target.value)} placeholder="Ex: Smart Fit" className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:border-orange-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-neutral-300 mb-1">Turno</label>
              <select value={turno} onChange={(e) => setTurno(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:border-orange-500 outline-none">
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition-colors disabled:opacity-50">
              {loading ? 'A processar...' : 'Cadastrar Aluno'}
            </button>
          </form>
        </div>
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Lista de Alunos</h3>
          
          <div className="mb-4">
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou academia..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:border-orange-500 outline-none"
            />
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {alunosFiltrados.length === 0 ? (
              <p className="text-neutral-500 text-center py-4">Nenhum aluno encontrado.</p>
            ) : (
              alunosFiltrados.map((aluno) => (
                <Link key={aluno.id} href={`/dashboard/admin/alunos/${aluno.id}`} className="block bg-neutral-800 p-4 rounded hover:bg-neutral-700 transition-colors border-l-4 border-orange-500">
                  <p className="font-semibold text-white">{aluno.nome}</p>
                  <p className="text-sm text-neutral-400">
                    Turno: <span className="capitalize">{aluno.turno}</span> | Academia: {aluno.academias?.nome || 'Não informada'}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}