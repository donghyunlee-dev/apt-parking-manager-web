import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '@/shared/components/table/DataTable';

type Row = { id: string; name: string };

it('renders rows and handles row click', async () => {
  const onRowClick = vi.fn();
  const data: Row[] = [
    { id: '1', name: 'A' },
    { id: '2', name: 'B' },
  ];

  render(
    <DataTable
      columns={[{ id: 'name', header: '이름', accessor: (row: Row) => row.name }]}
      data={data}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
    />,
  );

  await userEvent.click(screen.getByText('A'));
  expect(onRowClick).toHaveBeenCalledWith(data[0]);
});
