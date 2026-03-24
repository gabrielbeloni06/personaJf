import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <img src="/icon.png" alt="Logo da Plataforma" className="w-32 h-32 object-contain" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Plataforma Personal Trainer
      </h1>
      <Link
        href="/login"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors w-full max-w-xs text-center"
      >
        Acessar Login
      </Link>
    </div>
  );
}