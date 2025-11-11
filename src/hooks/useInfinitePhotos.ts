import { useState, useEffect, useCallback, useRef } from "react";
import { useGallery } from "@/contexts/GalleryContext";
import type { Photo } from "@/types/photo";
import { API_ENDPOINTS, API_CONFIG, RETRY_CONFIG } from "@/config/api";

const PHOTOS_PER_PAGE = 20;

export const useInfinitePhotos = () => {
  const {
    photos,
    setPhotos: setGalleryPhotos,
    page,
    setPage: setGalleryPage,
    hasMore,
    setHasMore: setGalleryHasMore,
    isBack,
    setIsBack: setGalleryIsBack,
  } = useGallery();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const observerTarget = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const [retryCount, setRetryCount] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
      retryCountRef.current = 0;
      setRetryCount(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setError(
        "No internet connection. Please check your network and try again."
      );
      setLoading(false);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const fetchPhotos = useCallback(
    async (pageNum: number) => {
      // Don't fetch if offline
      if (!isOnline) {
        setError(
          "No internet connection. Please check your network and try again."
        );
        setLoading(false);
        return;
      }

      // Don't fetch if already loading or if we've exceeded retry attempts
      if (loading) return;

      setLoading(true);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          API_CONFIG.TIMEOUT
        );

        const response = await fetch(
          `${API_ENDPOINTS.PHOTOS_LIST}?page=${pageNum}&limit=${PHOTOS_PER_PAGE}`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch photos: ${response.status} ${response.statusText}`
          );
        }

        const data: Photo[] = await response.json();

        if (data.length === 0) {
          setGalleryHasMore(false);
        } else {
          const newPhotos = pageNum === 1 ? data : [...photos, ...data];
          setGalleryPhotos(newPhotos);
        }

        setGalleryPage(pageNum);
        setGalleryHasMore(data.length !== 0);

        // Clear error and retry count on success
        setError(null);
        retryCountRef.current = 0;
        setRetryCount(0);
      } catch (err) {
        console.error("Fetch error:", err);

        if (err instanceof Error) {
          if (err.name === "AbortError") {
            setError(
              "Request timed out. Please check your internet connection."
            );
          } else if (!isOnline) {
            setError(
              "No internet connection. Please check your network and try again."
            );
          } else {
            setError(`Failed to load photos: ${err.message}`);
          }
        } else {
          setError("An unexpected error occurred. Please try again.");
        }

        // Auto retry logic - only if online and under max attempts
        if (
          navigator.onLine &&
          retryCountRef.current < RETRY_CONFIG.MAX_ATTEMPTS
        ) {
          retryCountRef.current += 1;
          setRetryCount(retryCountRef.current);

          const delay =
            RETRY_CONFIG.INITIAL_DELAY *
            Math.pow(
              RETRY_CONFIG.BACKOFF_MULTIPLIER,
              retryCountRef.current - 1
            );

          console.log(
            `Auto retry attempt ${retryCountRef.current}/${RETRY_CONFIG.MAX_ATTEMPTS} in ${delay}ms`
          );

          // Clear any existing timeout
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }

          retryTimeoutRef.current = setTimeout(() => {
            console.log(`Executing retry attempt ${retryCountRef.current}`);
            fetchPhotos(pageNum);
          }, delay);
        } else {
          console.log(
            "Max retry attempts reached or offline, stopping auto retries"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  useEffect(() => {
    if (isBack) {
      setGalleryIsBack(false);
      return;
    }
    if (isOnline) {
      fetchPhotos(page);
    }
  }, [page, isOnline]);

  useEffect(() => {
    // Only setup observer if we're online, don't have errors, and haven't exceeded retry limit
    if (
      !isOnline ||
      error ||
      retryCountRef.current >= RETRY_CONFIG.MAX_ATTEMPTS
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loading &&
          !error &&
          isOnline &&
          retryCountRef.current < RETRY_CONFIG.MAX_ATTEMPTS
        ) {
          setGalleryPage(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, error, isOnline]);

  const retry = useCallback(() => {
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Reset all retry-related state
    retryCountRef.current = 0;
    setRetryCount(0);
    setError(null);
    setLoading(false);

    // Retry fetching from page 1 if no photos, or continue from current page
    if (photos.length === 0) {
      fetchPhotos(1);
    } else {
      fetchPhotos(page);
    }
  }, [photos.length, page, fetchPhotos]);

  return {
    photos,
    loading,
    error,
    hasMore,
    observerTarget,
    isOnline,
    retry,
    retryCount,
  };
};
