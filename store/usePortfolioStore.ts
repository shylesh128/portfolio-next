import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

/**
 * Portfolio Store
 * Global state management with Zustand
 * Uses Immer for immutable updates and persist for localStorage
 */

interface FilterState {
  searchQuery: string;
  selectedTechStack: string[];
  selectedCategory: string | null;
  sortBy: 'latest' | 'featured' | 'impact';
}

interface UIState {
  isLightboxOpen: boolean;
  lightboxIndex: number;
  isMobileMenuOpen: boolean;
  activeSection: string;
}

interface ThemeState {
  isDarkMode: boolean;
  accentColor: string;
}

interface PortfolioStore {
  // Filter State
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  toggleTechStack: (tech: string) => void;
  setCategory: (category: string | null) => void;
  setSortBy: (sort: FilterState['sortBy']) => void;
  clearFilters: () => void;

  // UI State
  ui: UIState;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  toggleMobileMenu: () => void;
  setActiveSection: (section: string) => void;

  // Theme State
  theme: ThemeState;
  toggleTheme: () => void;
  setAccentColor: (color: string) => void;
}

const initialFilterState: FilterState = {
  searchQuery: '',
  selectedTechStack: [],
  selectedCategory: null,
  sortBy: 'latest',
};

const initialUIState: UIState = {
  isLightboxOpen: false,
  lightboxIndex: 0,
  isMobileMenuOpen: false,
  activeSection: 'Header',
};

const initialThemeState: ThemeState = {
  isDarkMode: true,
  accentColor: '#87ceeb',
};

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    immer((set) => ({
      // Initial State
      filters: initialFilterState,
      ui: initialUIState,
      theme: initialThemeState,

      // Filter Actions
      setSearchQuery: (query) =>
        set((state) => {
          state.filters.searchQuery = query;
        }),

      toggleTechStack: (tech) =>
        set((state) => {
          const index = state.filters.selectedTechStack.indexOf(tech);
          if (index > -1) {
            state.filters.selectedTechStack.splice(index, 1);
          } else {
            state.filters.selectedTechStack.push(tech);
          }
        }),

      setCategory: (category) =>
        set((state) => {
          state.filters.selectedCategory = category;
        }),

      setSortBy: (sort) =>
        set((state) => {
          state.filters.sortBy = sort;
        }),

      clearFilters: () =>
        set((state) => {
          state.filters = initialFilterState;
        }),

      // UI Actions
      openLightbox: (index) =>
        set((state) => {
          state.ui.isLightboxOpen = true;
          state.ui.lightboxIndex = index;
        }),

      closeLightbox: () =>
        set((state) => {
          state.ui.isLightboxOpen = false;
        }),

      toggleMobileMenu: () =>
        set((state) => {
          state.ui.isMobileMenuOpen = !state.ui.isMobileMenuOpen;
        }),

      setActiveSection: (section) =>
        set((state) => {
          state.ui.activeSection = section;
        }),

      // Theme Actions
      toggleTheme: () =>
        set((state) => {
          state.theme.isDarkMode = !state.theme.isDarkMode;
        }),

      setAccentColor: (color) =>
        set((state) => {
          state.theme.accentColor = color;
        }),
    })),
    {
      name: 'portfolio-storage',
      partialize: (state) => ({
        theme: state.theme,
        filters: {
          sortBy: state.filters.sortBy,
        },
      }),
    }
  )
);

// Selectors for optimized re-renders
export const useFilters = () => usePortfolioStore((state) => state.filters);
export const useUI = () => usePortfolioStore((state) => state.ui);
export const useTheme = () => usePortfolioStore((state) => state.theme);
