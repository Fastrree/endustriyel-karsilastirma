import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Zap, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { useNotificationStore } from '../../store';

interface HeaderProps {
  onSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchClick }) => {
  const navigate = useNavigate();
  const unreadNotifications = useNotificationStore((state) => state.getUnreadCount());
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setShowAvatar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      navigate('/products');
    }
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Az önce';
    if (mins < 60) return `${mins} dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} saat önce`;
    return `${Math.floor(hours / 24)} gün önce`;
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerGlow} />
      <div className={styles.container}>
        {/* Logo — navigates home */}
        <a href="/" className={styles.logo} onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <span className={styles.logoIconWrap}>
            <Zap size={18} className={styles.logoIcon} />
          </span>
          <span className={styles.logoText}>
            EK<span className={styles.logoDot}>.</span>
          </span>
        </a>

        {/* Search — navigates to products */}
        <button className={styles.searchTrigger} onClick={handleSearchClick}>
          <Search size={15} />
          <span className={styles.searchText}>Ürün, tedarikçi ara...</span>
          <kbd className={styles.searchKbd}>⌘K</kbd>
        </button>

        {/* Right Actions */}
        <div className={styles.right}>
          {/* Notification Bell */}
          <div className={styles.dropdownWrap} ref={notifRef}>
            <button
              className={`${styles.iconButton} ${showNotifications ? styles.iconActive : ''}`}
              aria-label="Bildirimler"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowAvatar(false);
              }}
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className={styles.notificationDot} />
              )}
            </button>

            {showNotifications && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <span className={styles.dropdownTitle}>Bildirimler</span>
                  {unreadNotifications > 0 && (
                    <button className={styles.dropdownAction} onClick={markAllAsRead}>
                      Tümünü oku
                    </button>
                  )}
                </div>
                <div className={styles.dropdownBody}>
                  {notifications.length === 0 ? (
                    <div className={styles.dropdownEmpty}>
                      <Bell size={20} />
                      <span>Bildirim yok</span>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        className={`${styles.notifItem} ${!notif.isRead ? styles.notifUnread : ''}`}
                        onClick={() => handleNotificationClick(notif.id)}
                      >
                        <div className={`${styles.notifDot} ${!notif.isRead ? styles.notifDotActive : ''}`} />
                        <div className={styles.notifContent}>
                          <span className={styles.notifMessage}>{notif.message}</span>
                          <span className={styles.notifTime}>{formatTime(notif.timestamp)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar Menu */}
          <div className={styles.dropdownWrap} ref={avatarRef}>
            <button
              className={`${styles.avatar} ${showAvatar ? styles.avatarActive : ''}`}
              onClick={() => {
                setShowAvatar(!showAvatar);
                setShowNotifications(false);
              }}
              aria-label="Profil menüsü"
            >
              <span>S</span>
            </button>

            {showAvatar && (
              <div className={`${styles.dropdown} ${styles.dropdownRight}`}>
                <div className={styles.avatarInfo}>
                  <div className={styles.avatarLarge}>S</div>
                  <div>
                    <div className={styles.avatarName}>Kullanıcı</div>
                    <div className={styles.avatarEmail}>admin@ek.app</div>
                  </div>
                </div>
                <div className={styles.dropdownDivider} />
                <button className={styles.menuItem} onClick={() => { navigate('/scrapers'); setShowAvatar(false); }}>
                  <Settings size={16} />
                  <span>Ayarlar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
