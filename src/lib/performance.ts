import { useEffect } from 'react';

// Hook to prefetch resources when browser is idle
export const useIdleCallback = (callback: () => void, deps: any[] = []) => {
  useEffect(() => {
    const handle = requestIdleCallback(() => {
      callback();
    });

    return () => cancelIdleCallback(handle);
  }, deps);
};

// Prefetch a resource when idle
export const usePrefetchResource = (resource: string) => {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [resource]);
};

// Component to prefetch resources
export const ResourcePrefetcher = ({ resources }: { resources: string[] }) => {
  useEffect(() => {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup would require tracking the specific links
    };
  }, [resources]);

  return null;
};