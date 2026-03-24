'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function RelatorioAluno() {
  const pathname = usePathname();
  const id = pathname.split('/')[4];

  const [peso, setPeso] = useState<number | string>(0);
  const [imc, setImc] = useState<number | string>(0);
  const [percGordura, setPercGordura] = useState<number | string>(0);
  const [percMassa, setPercMassa] = useState<number | string>(0);
  const [pgc, setPgc] = useState<number | string>(0);
  const [rcq, setRcq] = useState<number | string>(0);
  const [dataAvaliacao, setDataAvaliacao] = useState(new Date().toISOString().split('T')[0]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [ordem, setOrdem] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRelatorio();
    }
  }, [id]);

  const fetchRelatorio = async () => {
    const { data, error } = await supabase
      .from('relatorios')
      .select('*')
      .eq('aluno_id', id)
      .order('data_registro', { ascending: false });

    if (data && data.length > 0) {
      setHistorico(data);
      if (!editandoId) {
        setPeso(data[0].peso || 0);
        setImc(data[0].imc || 0);
        setPercGordura(data[0].percentual_gordura || 0);
        setPercMassa(data[0].percentual_massa || 0);
        setPgc(data[0].pgc || 0);
        setRcq(data[0].rcq || 0);
      }
    } else {
      setHistorico([]);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

    const dataComHora = new Date(dataAvaliacao + 'T12:00:00Z').toISOString();

    if (editandoId) {
      const { error } = await supabase
        .from('relatorios')
        .update({
          peso: Number(peso),
          imc: Number(imc),
          percentual_gordura: Number(percGordura),
          percentual_massa: Number(percMassa),
          pgc: Number(pgc),
          rcq: Number(rcq),
          data_registro: dataComHora
        })
        .eq('id', editandoId);

      if (error) {
        setMensagem('Erro ao atualizar os dados.');
      } else {
        setMensagem('Avaliação atualizada com sucesso!');
        limparFormulario();
        fetchRelatorio();
      }
    } else {
      const { error } = await supabase
        .from('relatorios')
        .insert([{
          aluno_id: id,
          peso: Number(peso),
          imc: Number(imc),
          percentual_gordura: Number(percGordura),
          percentual_massa: Number(percMassa),
          pgc: Number(pgc),
          rcq: Number(rcq),
          data_registro: dataComHora
        }]);

      if (error) {
        setMensagem('Erro ao salvar os dados.');
      } else {
        setMensagem('Avaliação física salva com sucesso!');
        limparFormulario();
        fetchRelatorio();
      }
    }
    setLoading(false);
  };

  const limparFormulario = () => {
    setPeso(0);
    setImc(0);
    setPercGordura(0);
    setPercMassa(0);
    setPgc(0);
    setRcq(0);
    setDataAvaliacao(new Date().toISOString().split('T')[0]);
    setEditandoId(null);
  };

  const handleEditar = (aval: any) => {
    setPeso(aval.peso);
    setImc(aval.imc);
    setPercGordura(aval.percentual_gordura);
    setPercMassa(aval.percentual_massa);
    setPgc(aval.pgc);
    setRcq(aval.rcq);
    setDataAvaliacao(aval.data_registro.split('T')[0]);
    setEditandoId(aval.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExcluir = async (avalId: string) => {
    if (window.confirm('Excluir esta avaliação física?')) {
      const { error } = await supabase.from('relatorios').delete().eq('id', avalId);
      if (!error) {
        fetchRelatorio();
        if (editandoId === avalId) {
          limparFormulario();
        }
      }
    }
  };

  const dataGrafico = [
    { name: 'Gordura', value: Number(percGordura) },
    { name: 'Massa Magra', value: Number(percMassa) }
  ];
  const COLORS = ['#ef4444', '#f97316'];

  const historicoOrdenado = [...historico].sort((a, b) => {
    const dateA = new Date(a.data_registro).getTime();
    const dateB = new Date(b.data_registro).getTime();
    return ordem === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/admin/alunos/${id}`} className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded transition-colors border border-neutral-700">
            ← Voltar
          </Link>
          <h2 className="text-3xl font-bold text-neutral-100">Relatório do Aluno</h2>
        </div>
        <Link href={`/dashboard/admin/alunos/${id}/ficha`} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors font-semibold">
          Ir para Ficha Técnica →
        </Link>
      </div>

      {mensagem && <p className="text-orange-500 font-semibold">{mensagem}</p>}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 h-fit">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">
            {editandoId ? 'Editar Avaliação' : 'Nova Avaliação'}
          </h3>
          <form onSubmit={handleSalvar} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-neutral-300">Data da Avaliação</label>
              <input type="date" value={dataAvaliacao} onChange={(e) => setDataAvaliacao(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white mt-1 outline-none focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm text-neutral-300">Peso (kg)</label>
              <input type="number" step="0.01" value={peso} onChange={(e) => setPeso(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white mt-1 outline-none focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm text-neutral-300">IMC</label>
              <input type="number" step="0.01" value={imc} onChange={(e) => setImc(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white mt-1 outline-none focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm text-neutral-300">% Gordura</label>
              <input type="number" step="0.01" value={percGordura} onChange={(e) => setPercGordura(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white mt-1 outline-none focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm text-neutral-300">% Massa</label>
              <input type="number" step="0.01" value={percMassa} onChange={(e) => setPercMassa(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white mt-1 outline-none focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm text-neutral-300">PGC</label>
              <input type="number" step="0.01" value={pgc} onChange={(e) => setPgc(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white mt-1 outline-none focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm text-neutral-300">RCQ</label>
              <input type="number" step="0.01" value={rcq} onChange={(e) => setRcq(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white mt-1 outline-none focus:border-orange-500" required />
            </div>
            <div className="col-span-2 mt-4 flex gap-4">
              <button type="submit" disabled={loading} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded transition-colors disabled:opacity-50">
                {loading ? 'Processando...' : (editandoId ? 'Atualizar Avaliação' : 'Salvar Avaliação')}
              </button>
              {editandoId && (
                <button type="button" onClick={limparFormulario} className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 px-6 rounded transition-colors">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 flex flex-col items-center h-fit">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Composição Corporal Atual</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataGrafico} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {dataGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: 'none', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4">
            <span className="flex items-center text-sm text-neutral-300"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>Gordura</span>
            <span className="flex items-center text-sm text-neutral-300"><div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>Massa Magra</span>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold text-orange-500">Histórico de Avaliações</h3>
          <button
            onClick={() => setOrdem(ordem === 'desc' ? 'asc' : 'desc')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded text-sm transition-colors border border-neutral-700"
          >
            Ordem: {ordem === 'desc' ? 'Mais recente primeiro ↓' : 'Mais antigo primeiro ↑'}
          </button>
        </div>

        {historicoOrdenado.length === 0 ? (
          <p className="text-neutral-500 text-center py-8 border-2 border-dashed border-neutral-700 rounded-lg">Nenhuma avaliação encontrada.</p>
        ) : (
          <div className="space-y-4">
            {historicoOrdenado.map((aval) => (
              <div key={aval.id} className="bg-neutral-800 p-4 rounded-lg border-l-4 border-orange-500 flex flex-wrap gap-x-8 gap-y-4 justify-between items-center">
                <div className="flex-1">
                  <p className="text-white font-bold mb-2">{new Date(aval.data_registro).toLocaleDateString('pt-BR')}</p>
                  <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-neutral-300">
                    <p><span className="text-orange-500 font-semibold">Peso:</span> {aval.peso}kg</p>
                    <p><span className="text-orange-500 font-semibold">IMC:</span> {aval.imc}</p>
                    <p><span className="text-orange-500 font-semibold">Gordura:</span> {aval.percentual_gordura}%</p>
                    <p><span className="text-orange-500 font-semibold">Massa:</span> {aval.percentual_massa}%</p>
                    <p><span className="text-orange-500 font-semibold">PGC:</span> {aval.pgc}</p>
                    <p><span className="text-orange-500 font-semibold">RCQ:</span> {aval.rcq}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEditar(aval)} className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">
                    Editar
                  </button>
                  <button onClick={() => handleExcluir(aval.id)} className="text-red-500 hover:text-red-400 text-sm font-semibold transition-colors">
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