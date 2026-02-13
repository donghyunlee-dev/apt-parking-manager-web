import { fireEvent, render, screen } from '@testing-library/react';
import SearchBar from '@/shared/components/form/SearchBar';

it('submits search value', () => {
  const onSubmit = vi.fn();
  render(
    <SearchBar
      value=""
      onChange={() => {}}
      onSubmit={onSubmit}
      placeholder="검색"
    />,
  );

  fireEvent.submit(screen.getByRole('button', { name: '검색' }).closest('form')!);
  expect(onSubmit).toHaveBeenCalled();
});
