import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  last_name: string;
  email: string;
  username: string;
}

interface Component {
  name: string;
  active: boolean;
  type?: string;
}

interface Weather {
  temperature?: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
}

interface ActivityHistoryItem {
  date: string;
  total_energy_produced: number;
  total_energy_consumed: number;
}

interface ActivityHistory {
  pastWeek?: ActivityHistoryItem[];
  pastMonth?: ActivityHistoryItem[];
}

interface System {
  id: string;
  name: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  battery_storage?: number;
  components?: Component[];
  weather?: Weather;
  activityHistory?: ActivityHistory;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  imageUrl?: string;
  category?: string;
  features?: string[];
  specifications?: Record<string, string | number>;
  quantity?: number;
}

interface MetricsSummary {
  daily?: {
    total_energy_produced: number;
    total_energy_consumed: number;
  };
  weekly?: {
    total_energy_produced: number;
    total_energy_consumed: number;
  };
  monthly?: {
    total_energy_produced: number;
    total_energy_consumed: number;
  };
}

interface Metrics {
  timestamp?: string;
  energy_produced?: number;
  energy_consumed?: number;
}

interface ForecastItem {
  date: string;
  irradiation: number;
}

interface AppState {
  authorization: string | null;
  user: User | null;
  systems: System[];
  system: System | null;
  metricsSummary: MetricsSummary | null;
  metrics: Metrics | null;
  products: Product[];
  product: Product | null;
  cart: Product[];
  forecast: ForecastItem[] | null;
}

interface AppActions {
  setAuthorization: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setSystems: (systems: System[]) => void;
  setSystem: (system: System | null) => void;
  setMetricsSummary: (summary: MetricsSummary | null) => void;
  setMetrics: (metrics: Metrics | null) => void;
  setProducts: (products: Product[]) => void;
  setProduct: (product: Product | null) => void;
  setForecast: (forecast: ForecastItem[] | null) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  logout: () => void;
}

export const useStore = create<AppState & AppActions>((set) => ({
  // State
  authorization: null,
  user: null,
  systems: [],
  system: null,
  metricsSummary: null,
  metrics: null,
  products: [],
  product: null,
  cart: [],
  forecast: null,

  // Actions
  setAuthorization: (token) => set({ authorization: token }),
  setUser: (user) => set({ user }),
  setSystems: (systems) => set({ systems }),
  setSystem: (system) => set({ system }),
  setMetricsSummary: (summary) => set({ metricsSummary: summary }),
  setMetrics: (metrics) => set({ metrics }),
  setProducts: (products) => set({ products }),
  setProduct: (product) => set({ product }),
  setForecast: (forecast) => set({ forecast }),

  addToCart: (product) =>
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          ),
        };
      }
      return { cart: [...state.cart, { ...product, quantity: 1 }] };
    }),

  removeFromCart: (productId) =>
    set((state) => {
      const item = state.cart.find((p) => p.id === productId);
      if (!item) return state;

      if ((item.quantity || 1) > 1) {
        return {
          cart: state.cart.map((p) =>
            p.id === productId ? { ...p, quantity: (p.quantity || 1) - 1 } : p
          ),
        };
      }
      return { cart: state.cart.filter((p) => p.id !== productId) };
    }),

  clearCart: () => set({ cart: [] }),

  logout: () =>
    set({
      authorization: null,
      user: null,
      systems: [],
      system: null,
      metricsSummary: null,
      metrics: null,
      forecast: null,
      cart: [],
    }),
}));
