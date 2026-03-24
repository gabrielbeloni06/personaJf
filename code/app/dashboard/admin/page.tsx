import Link from 'next/link';

export default function AdminCentral() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-neutral-100">Visão Geral</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/admin/alunos" className="block p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-orange-500 transition-all cursor-pointer group">
          <h3 className="text-xl font-semibold text-orange-500 mb-2 group-hover:text-orange-400">Gestão de Alunos</h3>
          <p className="text-neutral-400">Cadastre novos alunos, gerencie academias e acesse os perfis individuais.</p>
        </Link>
        <div className="block p-6 bg-neutral-900 border border-neutral-800 rounded-xl opacity-50">
          <h3 className="text-xl font-semibold text-orange-500 mb-2">Academias (Em breve)</h3>
          <p className="text-neutral-400">Módulo de cadastro e gestão de academias parceiras.</p>
        </div>
      </div>
    </div>
  );
}