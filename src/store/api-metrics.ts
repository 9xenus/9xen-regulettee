
type Metric = {
  url: string;
  status: number;
  latency: number;
  timestamp: number;
};

class ApiMetricsStore {
  private metrics: Metric[] = [];
  private listeners: ((metrics: Metric[]) => void)[] = [];

  addMetric(metric: Metric) {
    this.metrics.push(metric);
    if (this.metrics.length > 50) this.metrics.shift(); // Keep last 50
    this.notify();
  }

  getMetrics() {
    return this.metrics;
  }

  subscribe(listener: (metrics: Metric[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.metrics));
  }
}

export const apiMetricsStore = new ApiMetricsStore();
