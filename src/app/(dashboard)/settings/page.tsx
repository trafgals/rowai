'use client';

import { useSession } from '@clerk/nextjs';
import { useState } from 'react';

export default function SettingsPage() {
  const { session } = useSession();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const handleConnectConcept2 = async () => {
    if (!session?.user?.id) return;
    const res = await fetch(`/api/concept2/auth-url?state=${session.user.id}`);
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch('/api/concept2/import', { method: 'POST' });
      const data = await res.json();
      setImportResult(data.imported ? `Imported ${data.imported} workouts` : data.error);
    } catch {
      setImportResult('Import failed');
    }
    setImporting(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Connected Integrations</h2>
        <button
          onClick={handleConnectConcept2}
          className="bg-[#00D4AA] text-black font-semibold px-6 py-3 rounded-lg hover:bg-[#00b894] transition-colors"
        >
          Connect Concept Rower
        </button>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Import History</h2>
        <button
          onClick={handleImport}
          disabled={importing}
          className="bg-[#FF6B35] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#e85d04] transition-colors disabled:opacity-50"
        >
          {importing ? 'Importing...' : 'Import All Workouts'}
        </button>
        {importResult && (
          <p className="mt-4 text-[#A8A8B3]">{importResult}</p>
        )}
      </section>
    </div>
  );
}
