import React, { useMemo } from 'react';
import styles from './CacheStatus.module.css';

export interface CacheStatusProps {
  lastUpdateTime: Date | null;
  isStale?: boolean;
  isLoading?: boolean;
  onRefresh: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const CacheStatus: React.FC<CacheStatusProps> = ({
  lastUpdateTime,
  isStale = false,
  isLoading = false,
  onRefresh,
  onDismiss,
  className = '',
}) => {
  const timeAgo = useMemo(() => {
    if (!lastUpdateTime) return 'Henüz güncellenmedi';

    const now = new Date();
    const diffMs = now.getTime() - new Date(lastUpdateTime).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Az önce';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} dakika önce`;
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else if (diffDays === 1) {
      return 'Dün';
    } else {
      return `${diffDays} gün önce`;
    }
  }, [lastUpdateTime]);

  const statusText = isStale
    ? 'Veriler güncel değil'
    : 'Veriler güncel';

  const bannerClasses = [
    styles.banner,
    isStale ? styles.stale : styles.fresh,
    isLoading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDismiss?.();
    }
  };

  const handleRefreshKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isLoading) {
        onRefresh();
      }
    }
  };

  return (
    <div
      className={bannerClasses}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <div className={styles.content}>
        <div className={styles.iconWrapper} aria-hidden="true">
          {isLoading ? (
            <svg
              className={styles.spinner}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className={styles.spinnerTrack}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                className={styles.spinnerIndicator}
                d="M12 2C6.477 2 2 6.477 2 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : isStale ? (
            <svg
              className={styles.statusIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 9V13L15 15M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              className={styles.statusIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M9 12L11 14L15 10M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <div className={styles.textContent}>
          <span className={styles.statusLabel}>
            {isLoading ? 'Güncelleniyor...' : statusText}
          </span>
          <span className={styles.updateTime}>
            Son güncelleme: {timeAgo}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={onRefresh}
          disabled={isLoading}
          aria-label={isLoading ? 'Güncelleniyor' : 'Verileri yenile'}
          onKeyDown={handleRefreshKeyDown}
        >
          {isLoading ? (
            <>
              <span className={styles.srOnly}>Güncelleniyor</span>
              <svg
                className={styles.buttonSpinner}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.3"
                />
                <path
                  d="M8 2C4.686 2 2 4.686 2 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </>
          ) : (
            <>
              <svg
                className={styles.refreshIcon}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M13.5 8C13.5 11.0376 11.0376 13.5 8 13.5C4.96243 13.5 2.5 11.0376 2.5 8C2.5 4.96243 4.96243 2.5 8 2.5C9.76667 2.5 11.35 3.27667 12.4667 4.53333M12.4667 4.53333V2M12.4667 4.53333H10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Yenile</span>
            </>
          )}
        </button>

        {onDismiss && (
          <button
            type="button"
            className={styles.dismissButton}
            onClick={onDismiss}
            aria-label="Bildirimi kapat"
            onKeyDown={handleKeyDown}
          >
            <svg
              className={styles.dismissIcon}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default CacheStatus;
