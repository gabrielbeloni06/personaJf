'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PerfilAluno() {
  const pathname = usePathname();
  const router = useRouter();
  const id = pathname.split('/')[4];

  const [nome, setNome] = useState('');
  const [academiaNome, setAcademiaNome] = useState('');
  const [turno, setTurno] = useState('manha');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (id) {
      fetchAluno();
    }
  }, [id]);

  const fetchAluno = async () => {
    const { data, error } = await supabase
      .from('alunos')
      .select(`nome, turno, academias (nome)`)
      .eq('id', id)
      .single();

    if (data) {
      setNome(data.nome || '');
      setTurno(data.turno || 'manha');
      setAcademiaNome(data.academias?.nome || '');
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

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
        .update({ nome, academia_id: academiaId, turno })
        .eq('id', id);

      if (!error) {
        setMensagem('Dados atualizados com sucesso!');
      } else {
        setMensagem('Erro ao atualizar os dados.');
      }
    }
    setLoading(false);
  };

  const handleExcluir = async () => {
    if (window.confirm('Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.')) {
      const { error } = await supabase.from('alunos').delete().eq('id', id);
      if (!error) {
        router.push('/dashboard/admin/alunos');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin/alunos" className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded transition-colors border border-neutral-700">
          ← Voltar
        </Link>
        <h2 className="text-3xl font-bold text-neutral-100">Perfil do Aluno</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href={`/dashboard/admin/alunos/${id}/relatorio`} className="flex flex-col items-center justify-center p-8 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-orange-500 transition-all group">
          <h3 className="text-2xl font-bold text-orange-500 mb-2 group-hover:scale-105 transition-transform">Relatório de Diagnóstico</h3>
          <p className="text-neutral-400 text-center">Peso, gordura, IMC, gráficos de composição corporal e métricas.</p>
        </Link>
        <Link href={`/dashboard/admin/alunos/${id}/ficha`} className="flex flex-col items-center justify-center p-8 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-orange-500 transition-all group">
          <h3 className="text-2xl font-bold text-orange-500 mb-2 group-hover:scale-105 transition-transform">Ficha Técnica</h3>
          <p className="text-neutral-400 text-center">Montagem de treinos, exercícios, séries e repetições.</p>
        </Link>
      </div>

      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 mb-8">
        <h3 className="text-xl font-semibold text-orange-500 mb-4">Dados Cadastrais</h3>
        {mensagem && <p className="text-green-500 mb-4">{mensagem}</p>}
        <form onSubmit={handleSalvar} className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Nome do Aluno</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:border-orange-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Nome da Academia</label>
            <input type="text" value={academiaNome} onChange={(e) => setAcademiaNome(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:border-orange-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Turno</label>
            <select value={turno} onChange={(e) => setTurno(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:border-orange-500 outline-none">
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
            </select>
          </div>
          <div className="flex justify-between items-center pt-4">
            <button type="button" onClick={handleExcluir} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
              Excluir Aluno
            </button>
            <button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}