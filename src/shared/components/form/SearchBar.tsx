import { type ChangeEvent, type FormEvent, type ReactNode, useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

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
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-border bg-card p-4">
      <div className="grid gap-2 lg:grid-cols-[96px_1fr_auto] lg:items-center">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {searchTitle}
        </div>
        <Input
          value={value}
          onChange={handleChange}
          placeholder={placeholder ?? '검색어를 입력하세요'}
          icon={<Search size={14} aria-hidden="true" />}
        />
        <Button type="submit" size="md">
          검색
        </Button>
      </div>

      {(filters || actions) && (
        <>
          {/* Mobile filter toggle */}
          {filters && (
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
            >
              {filtersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {filterTitle} {filtersExpanded ? '접기' : '펼치기'}
            </button>
          )}

          <div className={cn(
            'grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start',
            !filtersExpanded && 'hidden lg:grid'
          )}>
            {filters && (
              <div className="grid gap-2 lg:grid-cols-[96px_1fr] lg:items-center">
                <div className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground lg:block">
                  {filterTitle}
                </div>
                <div className="flex flex-wrap items-center gap-2">{filters}</div>
              </div>
            )}
            {actions && (
              <div className="grid gap-2 lg:grid-cols-[64px_1fr] lg:items-center lg:justify-self-end">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {actionTitle}
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div>
              </div>
            )}
          </div>
        </>
      )}
    </form>
  );
};

export default SearchBar;
