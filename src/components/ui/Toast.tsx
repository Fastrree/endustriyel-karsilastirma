import React, { useEffect, useState, useCallback } from 'react';
import styles from './Toast.module.css';
import { useNotificationStore } from '../../store';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface ToastItem {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    leaving?: boolean;
}

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

export const ToastContainer: React.FC = () => {
    const { notifications, markAsRead } = useNotificationStore();
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    // Watch for new unread notifications
    useEffect(() => {
        const unread = notifications.filter(n => !n.isRead);
        if (unread.length === 0) return;

        const newToasts: ToastItem[] = unread
            .filter(n => !toasts.find(t => t.id === n.id))
            .map(n => ({
                id: n.id,
                type: n.type as ToastItem['type'],
                title: n.title,
                message: n.message,
            }));

        if (newToasts.length > 0) {
            setToasts(prev => [...newToasts, ...prev].slice(0, 5));
            // Mark as read immediately (they've been shown as toast)
            newToasts.forEach(t => markAsRead(t.id));
        }
    }, [notifications, markAsRead]); // eslint-disable-line react-hooks/exhaustive-deps

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 250);
    }, []);

    // Auto-dismiss after 4 seconds
    useEffect(() => {
        if (toasts.length === 0) return;
        const latest = toasts.find(t => !t.leaving);
        if (!latest) return;

        const timer = setTimeout(() => dismissToast(latest.id), 4000);
        return () => clearTimeout(timer);
    }, [toasts, dismissToast]);

    if (toasts.length === 0) return null;

    return (
        <div className={styles.container}>
            {toasts.map(toast => {
                const Icon = iconMap[toast.type];
                return (
                    <div
                        key={toast.id}
                        className={`${styles.toast} ${styles[toast.type]} ${toast.leaving ? styles.leaving : ''}`}
                        onClick={() => dismissToast(toast.id)}
                    >
                        <div className={styles.icon}>
                            <Icon size={18} />
                        </div>
                        <div className={styles.content}>
                            <div className={styles.title}>{toast.title}</div>
                            {toast.message && <div className={styles.message}>{toast.message}</div>}
                        </div>
                        <button className={styles.close} onClick={(e) => { e.stopPropagation(); dismissToast(toast.id); }}>
                            <X size={14} />
                        </button>
                        <div className={styles.progress} />
                    </div>
                );
            })}
        </div>
    );
};

export default ToastContainer;
