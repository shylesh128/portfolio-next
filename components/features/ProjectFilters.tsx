import React from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useDebounce } from '@/hooks/useDebounce';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { FaSearch, FaTimes } from 'react-icons/fa';

/**
 * Project Filters Component
 * Search and filter projects by tech stack
 * Integrates with Zustand store
 */

interface ProjectFiltersProps {
  availableTechStack: string[];
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ availableTechStack }) => {
  const { filters, setSearchQuery, toggleTechStack, clearFilters } = usePortfolioStore();
  const [localSearch, setLocalSearch] = React.useState(filters?.searchQuery || '');
  const debouncedSearch = useDebounce(localSearch, 300);

  // Update store when debounced search changes
  React.useEffect(() => {
    if (setSearchQuery) {
      setSearchQuery(debouncedSearch);
    }
  }, [debouncedSearch, setSearchQuery]);

  const hasActiveFilters = 
    (filters?.searchQuery && filters.searchQuery.length > 0) || 
    (filters?.selectedTechStack && filters.selectedTechStack.length > 0);

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <FaSearch
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--sub-text-color)',
          }}
        />
        <input
          type="text"
          placeholder="Search projects..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.5rem',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            backgroundColor: 'var(--background-color)',
            color: 'var(--text-color)',
            fontSize: '1rem',
          }}
          aria-label="Search projects"
        />
      </div>

      {/* Tech Stack Filters */}
      {availableTechStack.length > 0 && (
        <div>
          <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--sub-text-color)' }}>
            Filter by technology:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {availableTechStack.map((tech) => {
              const isSelected = filters?.selectedTechStack?.includes(tech) || false;
              return (
                <Badge
                  key={tech}
                  variant={isSelected ? 'primary' : 'default'}
                  size="md"
                  onClick={() => toggleTechStack(tech)}
                  style={{ 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleTechStack(tech);
                    }
                  }}
                  aria-pressed={isSelected}
                >
                  {tech}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div style={{ marginTop: '1rem' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            leftIcon={<FaTimes />}
            aria-label="Clear all filters"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;
