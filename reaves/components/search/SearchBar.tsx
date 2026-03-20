'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, BookOpen, FlaskConical, Globe, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SAMPLE_QUERIES = [
  'Impact of social media on teen mental health',
  'Climate change effects on biodiversity',
  'CRISPR gene editing in cancer treatment',
  'Remote work productivity post-pandemic',
  'AI bias in hiring algorithms',
];

const TOPIC_CHIPS = [
  { label: 'Health & Medicine', icon: FlaskConical },
  { label: 'Social Sciences', icon: Users },
  { label: 'Technology', icon: Sparkles },
  { label: 'Environment', icon: Globe },
  { label: 'Education', icon: BookOpen },
];

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({ onSearch, isLoading = false, placeholder }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            'relative rounded-2xl border transition-all duration-300',
            'bg-white/5 backdrop-blur-sm',
            isFocused
              ? 'border-violet-500/60 shadow-[0_0_0_3px_rgba(139,92,246,0.15)] shadow-violet-500/20'
              : 'border-white/10 hover:border-white/20'
          )}
        >
          <div className="flex items-start gap-3 p-4">
            <Search className="mt-1 h-5 w-5 text-violet-400 flex-shrink-0" />
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || 'Ask any research question...'}
              rows={1}
              className={cn(
                'flex-1 bg-transparent resize-none outline-none',
                'text-white placeholder-white/30 text-base leading-relaxed',
                'min-h-[28px] max-h-[200px]'
              )}
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className={cn(
                'flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200',
                query.trim() && !isLoading
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Topic chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {TOPIC_CHIPS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => setQuery(label === query ? '' : label)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
              'border transition-all duration-200',
              query === label
                ? 'bg-violet-600/30 border-violet-500/50 text-violet-300'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 hover:border-white/20'
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Sample queries */}
      {!query && (
        <div className="space-y-1">
          <p className="text-center text-xs text-white/30">Try asking:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {SAMPLE_QUERIES.slice(0, 3).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuery(q)}
                className="text-xs text-violet-400/70 hover:text-violet-300 transition-colors underline-offset-2 hover:underline"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
