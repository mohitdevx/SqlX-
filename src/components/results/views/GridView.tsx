import { DataGrid } from '@/components/grid/DataGrid';
import type { QueryResult } from '@/types/database';
import type React from 'react';

export interface GridViewProps {
  data: QueryResult | null;
}

export const GridView: React.FC<GridViewProps> = ({ data }) => {
  return <DataGrid data={data} />;
};
