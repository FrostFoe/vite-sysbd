import { useCallback, useEffect, useState } from "react";
import { useToast } from "../components/common/Toast";
import { useLayout } from "../context/LayoutContext";
import { t } from "./translations";

interface UseDataFetchOptions {
  onSuccess?: (data: ApiResponse) => void;
  onError?: (error: string) => void;
  autoFetch?: boolean;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface UseDataFetchReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface ApiResponse {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

export const useDataFetch = <T>(
  fetchFn: () => Promise<ApiResponse>,
  options: UseDataFetchOptions = {},
): UseDataFetchReturn<T> => {
  const {
    onSuccess,
    onError,
    autoFetch = true,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
  } = options;

  const { language } = useLayout();
  const { success: showSuccessMsg, error: showErrorMsg } = useToast();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchFn();

      if (response.success) {
        setData(response as T);
        onSuccess?.(response);

        if (showSuccessToast && successMessage) {
          showSuccessMsg(successMessage);
        }
      } else {
        const errorMsg = response.error || t("something_went_wrong", language);
        setError(errorMsg);
        onError?.(errorMsg);

        if (showErrorToast) {
          showErrorMsg(errorMsg);
        }
      }
    } catch (_err) {
      const errorMsg = t("server_error", language);
      setError(errorMsg);
      onError?.(errorMsg);

      if (showErrorToast) {
        showErrorMsg(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchFn,
    language,
    onSuccess,
    onError,
    showErrorToast,
    showSuccessToast,
    successMessage,
    showSuccessMsg,
    showErrorMsg,
  ]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
