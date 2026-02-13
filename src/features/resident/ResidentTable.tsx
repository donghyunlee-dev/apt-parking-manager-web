import { TableVirtuoso } from 'react-virtuoso';
import type { ResidentVehicle } from './types';
import { formatUnit } from './utils';

interface ResidentTableProps {
  data: ResidentVehicle[];
  onRowClick: (row: ResidentVehicle) => void;
}

const ResidentTable = ({ data, onRowClick }: ResidentTableProps) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <TableVirtuoso
      data={data}
      fixedHeaderContent={() => (
        <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <th className="px-4 py-3 text-left">동/호수</th>
          <th className="px-4 py-3 text-left">차량번호</th>
          <th className="px-4 py-3 text-left">연락처</th>
          <th className="px-4 py-3 text-left">등록일</th>
        </tr>
      )}
      itemContent={(_, row) => (
        <>
          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
            {formatUnit(row.building, row.unit)}
          </td>
          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{row.vehicle_number}</td>
          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{row.phone_number ?? '-'}</td>
          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{row.created_at}</td>
        </>
      )}
      components={{
        Table: ({ style, ...props }) => (
          <table
            {...props}
            style={{ ...style, width: '100%', borderCollapse: 'collapse' }}
            className="text-sm"
          />
        ),
        TableRow: (props) => (
          <tr
            {...props}
            className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => onRowClick(data[props['data-index'] as number])}
          />
        ),
        TableBody: (props) => (
          <tbody {...props} className="divide-y divide-slate-100 dark:divide-slate-800" />
        ),
        TableHead: (props) => <thead {...props} />,
      }}
    />
  </div>
);

export default ResidentTable;
