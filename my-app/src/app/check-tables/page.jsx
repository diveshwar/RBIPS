"use client";
import { useState, useEffect } from 'react';
import { checkTables } from '@/lib/checkTables';

export default function CheckTables() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function check() {
      try {
        const tablesResult = await checkTables();
        setResult(tablesResult);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error checking tables: {error}
      </div>
    );
  }

  if (!result) {
    return <div className="p-4">No results available</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Database Tables Check</h1>
      
      {!result.success && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {result.error}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Found Tables:</h2>
        {result.existingTables.length > 0 ? (
          <ul className="list-disc pl-5">
            {result.existingTables.map(table => (
              <li key={table} className="text-green-600">{table}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No expected tables found</p>
        )}
      </div>

      {result.missingTables.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Missing Tables:</h2>
          <ul className="list-disc pl-5">
            {result.missingTables.map(table => (
              <li key={table} className="text-red-600">{table}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">All Tables in Database:</h2>
        {result.allTables.length > 0 ? (
          <ul className="list-disc pl-5">
            {result.allTables.map(table => (
              <li key={table}>{table}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No tables found in database</p>
        )}
      </div>
    </div>
  );
} 