import type { ChangeEvent, FormEvent, ReactNode } from 'react';

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  filters?: ReactNode;
  actions?: ReactNode;
}

const SearchBar = ({ value, placeholder, onChange, onSubmit, filters, actions }: SearchBarProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <input
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? '검색어를 입력하세요'}
        className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />
      {filters}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
        >
          검색
        </button>
        {actions}
      </div>
    </form>
  );
};

export default SearchBar;
