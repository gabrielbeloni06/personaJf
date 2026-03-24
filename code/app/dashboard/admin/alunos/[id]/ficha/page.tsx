'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function FichaTecnica() {
  const pathname = usePathname();
  const id = pathname.split('/')[4];
  
  const [exercicio, setExercicio] = useState('');
  const [series, setSeries] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [listaExercicios, setListaExercicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchExercicios();
    }
  }, [id]);

  const fetchExercicios = async () => {
    const { data, error } = await supabase
      .from('fichas_tecnicas')
      .select('*')
      .eq('aluno_id', id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setListaExercicios(data);
    }
  };

  const handleSalvarExercicio = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editandoId) {
      const { error } = await supabase
        .from('fichas_tecnicas')
        .update({
          nome_exercicio: exercicio,
          series: parseInt(series),
          repeticoes: parseInt(repeticoes)
        })
        .eq('id', editandoId);

      if (!error) {
        setEditandoId(null);
        limparFormulario();
        fetchExercicios();
      }
    } else {
      const { error } = await supabase
        .from('fichas_tecnicas')
        .insert([{
          aluno_id: id,
          nome_exercicio: exercicio,
          series: parseInt(series),
          repeticoes: parseInt(repeticoes)
        }]);

      if (!error) {
        limparFormulario();
        fetchExercicios();
      }
    }
    setLoading(false);
  };

  const limparFormulario = () => {
    setExercicio('');
    setSeries('');
    setRepeticoes('');
    setEditandoId(null);
  };

  const handleEditar = (ex: any) => {
    setExercicio(ex.nome_exercicio);
    setSeries(ex.series.toString());
    setRepeticoes(ex.repeticoes.toString());
    setEditandoId(ex.id);
  };

  const handleExcluir = async (exId: string) => {
    if (window.confirm('Excluir este exercício da ficha?')) {
      const { error } = await supabase.from('fichas_tecnicas').delete().eq('id', exId);
      if (!error) {
        fetchExercicios();
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/admin/alunos/${id}`} className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded transition-colors border border-neutral-700">
            ← Voltar
          </Link>
          <h2 className="text-3xl font-bold text-neutral-100">Ficha Técnica</h2>
        </div>
        <Link href={`/dashboard/admin/alunos/${id}/relatorio`} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors font-semibold">
          Ir para Relatório →
        </Link>
      </div>

      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 mb-8">
        <h3 className="text-xl font-semibold text-orange-500 mb-4">
          {editandoId ? 'Editar Exercício' : 'Adicionar Exercício'}
        </h3>
        <form onSubmit={handleSalvarExercicio} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm text-neutral-300 mb-1">Nome do Exercício</label>
            <input type="text" value={exercicio} onChange={(e) => setExercicio(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:border-orange-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Séries</label>
            <input type="number" value={series} onChange={(e) => setSeries(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:border-orange-500 outline-none" required min="1" />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Repetições</label>
            <input type="number" value={repeticoes} onChange={(e) => setRepeticoes(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:border-orange-500 outline-none" required min="1" />
          </div>
          <div className="md:col-span-4 mt-2 flex gap-4">
            <button type="submit" disabled={loading} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded transition-colors disabled:opacity-50">
              {loading ? 'A processar...' : (editandoId ? 'Salvar Alteração' : 'Adicionar à Ficha')}
            </button>
            {editandoId && (
              <button type="button" onClick={limparFormulario} className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 px-6 rounded transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <h3 className="text-xl font-semibold text-orange-500 mb-4">Exercícios Cadastrados</h3>
        
        {listaExercicios.length === 0 ? (
          <div className="text-center p-8 text-neutral-500 border-2 border-dashed border-neutral-700 rounded-lg">
            Nenhum exercício cadastrado ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {listaExercicios.map((ex) => (
              <div key={ex.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-neutral-800 p-4 rounded border-l-4 border-orange-500 gap-4">
                <div>
                  <span className="font-semibold text-white block">{ex.nome_exercicio}</span>
                  <span className="text-neutral-400 text-sm">{ex.series} séries de {ex.repeticoes} reps</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEditar(ex)} className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">
                    Editar
                  </button>
                  <button onClick={() => handleExcluir(ex.id)} className="text-red-500 hover:text-red-400 text-sm font-semibold transition-colors">
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}