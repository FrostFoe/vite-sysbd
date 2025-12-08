import { logger } from "./logging";

/**
 * Performance Monitoring Utilities
 * Track execution time, memory usage, and performance metrics
 */

export interface PerformanceMetrics {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  tags?: Record<string, string | number>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private marks: Map<string, number> = new Map();
  private enabled = true;

  /**
   * Start measuring a named operation
   */
  mark(name: string): void {
    if (!this.enabled) return;
    this.marks.set(name, performance.now());
  }

  /**
   * End measurement and log metrics
   */
  measure(
    name: string,
    tags?: Record<string, string | number>,
  ): PerformanceMetrics | null {
    if (!this.enabled) return null;

    const startTime = this.marks.get(name);
    if (!startTime) {
      logger.warn("Performance measurement started without mark", { name });
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    const metric: PerformanceMetrics = {
      name,
      duration,
      startTime,
      endTime,
      tags,
    };

    this.metrics.push(metric);
    this.marks.delete(name);

    // Log slow operations (> 100ms)
    if (duration > 100) {
      logger.warn("Slow Operation Detected", {
        name,
        duration: `${duration.toFixed(2)}ms`,
        ...tags,
      });
    }

    return metric;
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string | number>,
  ): Promise<T> {
    this.mark(name);
    try {
      const result = await fn();
      this.measure(name, tags);
      return result;
    } catch (error) {
      this.measure(name, { ...tags, error: "true" });
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string | number>,
  ): T {
    this.mark(name);
    try {
      const result = fn();
      this.measure(name, tags);
      return result;
    } catch (error) {
      this.measure(name, { ...tags, error: "true" });
      throw error;
    }
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage(): Partial<PerformanceMemory> | null {
    if (!(performance as any).memory) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
    };
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific operation
   */
  getMetricsByName(name: string): PerformanceMetrics[] {
    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const grouped = this.metrics.reduce(
      (acc, metric) => {
        if (!acc[metric.name]) {
          acc[metric.name] = [];
        }
        acc[metric.name].push(metric);
        return acc;
      },
      {} as Record<string, PerformanceMetrics[]>,
    );

    let report = "=== Performance Report ===\n";

    Object.entries(grouped).forEach(([name, metrics]) => {
      const avg = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
      const max = Math.max(...metrics.map((m) => m.duration));
      const min = Math.min(...metrics.map((m) => m.duration));

      report += `\n${name}:\n`;
      report += `  Calls: ${metrics.length}\n`;
      report += `  Average: ${avg.toFixed(2)}ms\n`;
      report += `  Min: ${min.toFixed(2)}ms\n`;
      report += `  Max: ${max.toFixed(2)}ms\n`;
    });

    return report;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Log metrics
   */
  logMetrics(): void {
    logger.info("Performance Metrics", {
      report: this.generateReport(),
      memoryUsage: this.getMemoryUsage(),
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * React Hook for performance monitoring
 */
import { useEffect } from "react";

export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const renderStart = performance.now();

    return () => {
      const renderEnd = performance.now();
      performanceMonitor.measure(`${componentName}-render`, {
        duration: renderEnd - renderStart,
      });
    };
  }, [componentName]);
}

/**
 * Web Vitals monitoring
 */
export function monitorWebVitals(): void {
  if ("web-vital" in window === false) {
    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "largest-contentful-paint") {
          logger.info("Web Vital: LCP", {
            duration: (entry as any).renderTime || (entry as any).loadTime,
          });
        }
      });
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });

    // First Input Delay
    document.addEventListener("pointerdown", () => {
      const fid = performance.now();
      logger.info("Web Vital: FID", { fid });
    });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if ((entry as any).hadRecentInput) return;
        clsValue += (entry as any).value;
        logger.info("Web Vital: CLS", { cls: clsValue });
      });
    }).observe({ entryTypes: ["layout-shift"] });
  }
}

interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}
