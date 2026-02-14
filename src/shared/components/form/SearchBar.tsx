import type { ChangeEvent, FormEvent, ReactNode } from 'react';

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  filters?: ReactNode;
  actions?: ReactNode;
  searchTitle?: string;
  filterTitle?: string;
  actionTitle?: string;
}

const SearchBar = ({
  value,
  placeholder,
  onChange,
  onSubmit,
  filters,
  actions,
  searchTitle = '검색어',
  filterTitle = '검색 조건',
  actionTitle = '작업',
}: SearchBarProps) => {
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
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-[#24314a] dark:bg-[#0b162c]"
    >
      <div className="grid gap-2 lg:grid-cols-[96px_1fr_auto] lg:items-center">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {searchTitle}
        </div>
        <input
          value={value}
          onChange={handleChange}
          placeholder={placeholder ?? '검색어를 입력하세요'}
          className="h-10 rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 dark:border-[#2a3a5b] dark:bg-[#081226] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#7a83ff]"
        />
        <button
          type="submit"
          className="h-10 rounded-md bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400 dark:bg-[#7f86f8] dark:text-[#11162c] dark:hover:bg-[#979dff]"
        >
          검색
        </button>
      </div>

      {(filters || actions) && (
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
          {filters && (
            <div className="grid gap-2 lg:grid-cols-[96px_1fr] lg:items-center">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {filterTitle}
              </div>
              <div className="flex flex-wrap items-center gap-2">{filters}</div>
            </div>
          )}
          {actions && (
            <div className="grid gap-2 lg:grid-cols-[64px_1fr] lg:items-center lg:justify-self-end">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {actionTitle}
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div>
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
