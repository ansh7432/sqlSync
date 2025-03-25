import { Database } from 'lucide-react';

export function Header() {
  return (
    <header className="header">
      <h1>
        <Database className="icon" /> SQL Query Editor
      </h1>
      <p>Run SQL queries and view results instantly</p>
    </header>
  );
}