export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  total: number;
}

export interface Query {
  id: string;
  name: string;
  query: string;
  results: QueryResult;
}

// Generate 500 rows of sample data for each query
const generateLargeDataset = (count: number, template: Record<string, any>[]): Record<string, any>[] => {
  const result = [];
  for (let i = 0; i < count; i++) {
    const baseRow = template[i % template.length];
    result.push({
      ...baseRow,
      id: i + 1, // Add unique identifier
    });
  }
  return result;
};

const productData = generateLargeDataset(500, [
  { product_name: 'iPhone 13', category: 'Electronics', units_sold: 1500, revenue: 1500000 },
  { product_name: 'MacBook Pro', category: 'Electronics', units_sold: 800, revenue: 1200000 },
  { product_name: 'Nike Air Max', category: 'Footwear', units_sold: 2000, revenue: 200000 },
  { product_name: 'Samsung TV', category: 'Electronics', units_sold: 500, revenue: 150000 },
  { product_name: "Levi's Jeans", category: 'Apparel', units_sold: 3000, revenue: 120000 },
]);

const demographicsData = generateLargeDataset(500, [
  { age_group: '35-44', gender: 'Female', customer_count: 15000, avg_lifetime_value: 2500 },
  { age_group: '25-34', gender: 'Male', customer_count: 12000, avg_lifetime_value: 2200 },
  { age_group: '45-54', gender: 'Female', customer_count: 9000, avg_lifetime_value: 2100 },
  { age_group: '18-24', gender: 'Male', customer_count: 8000, avg_lifetime_value: 1800 },
  { age_group: '55+', gender: 'Female', customer_count: 6000, avg_lifetime_value: 1500 },
]);

const regionalData = generateLargeDataset(500, [
  { region: 'North America', store_count: 250, total_revenue: 5000000, avg_satisfaction: 4.5 },
  { region: 'Europe', store_count: 180, total_revenue: 3500000, avg_satisfaction: 4.3 },
  { region: 'Asia Pacific', store_count: 150, total_revenue: 2800000, avg_satisfaction: 4.4 },
  { region: 'Latin America', store_count: 90, total_revenue: 1500000, avg_satisfaction: 4.2 },
  { region: 'Middle East', store_count: 45, total_revenue: 900000, avg_satisfaction: 4.1 },
]);

export const sampleQueries: Query[] = [
  {
    id: 'query1',
    name: 'Top Selling Products',
    query: `SELECT 
  product_name,
  category,
  units_sold,
  revenue
FROM sales
WHERE revenue > 1000
ORDER BY revenue DESC
LIMIT 10;`,
    results: {
      columns: ['id', 'product_name', 'category', 'units_sold', 'revenue'],
      rows: productData,
      total: productData.length
    }
  },
  {
    id: 'query2',
    name: 'Customer Demographics',
    query: `SELECT 
  age_group,
  gender,
  COUNT(*) as customer_count,
  AVG(lifetime_value) as avg_lifetime_value
FROM customers
GROUP BY age_group, gender
ORDER BY avg_lifetime_value DESC;`,
    results: {
      columns: ['id', 'age_group', 'gender', 'customer_count', 'avg_lifetime_value'],
      rows: demographicsData,
      total: demographicsData.length
    }
  },
  {
    id: 'query3',
    name: 'Regional Sales Analysis',
    query: `SELECT 
  region,
  COUNT(DISTINCT store_id) as store_count,
  SUM(revenue) as total_revenue,
  AVG(satisfaction_score) as avg_satisfaction
FROM store_performance
GROUP BY region
ORDER BY total_revenue DESC;`,
    results: {
      columns: ['id', 'region', 'store_count', 'total_revenue', 'avg_satisfaction'],
      rows: regionalData,
      total: regionalData.length
    }
  }
];