import { sampleQueries } from '../../data/queries';

interface QuerySelectorProps {
  selectedQuery: string;
  onChange: (queryId: string) => void;
}

export function QuerySelector({ selectedQuery, onChange }: QuerySelectorProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <select 
      className="query-selector"
      value={selectedQuery}
      onChange={handleChange}
    >
      {sampleQueries.map(query => (
        <option key={query.id} value={query.id}>
          {query.name}
        </option>
      ))}
    </select>
  );
}