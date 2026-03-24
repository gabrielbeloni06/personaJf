import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-neutral-900 border-b border-orange-500 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-orange-500">Admin Dashboard</h1>
          <div className="space-x-4">
            <Link href="/dashboard/admin" className="hover:text-orange-400 transition-colors">Central</Link>
            <Link href="/dashboard/admin/alunos" className="hover:text-orange-400 transition-colors">Alunos</Link>
            <Link href="/" className="text-red-500 hover:text-red-400 transition-colors">Sair</Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}