import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, GitCompareArrows, Radio } from 'lucide-react';
import styles from './BottomNav.module.css';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { path: '/', label: 'Ana Sayfa', icon: <Home size={20} /> },
    { path: '/products', label: 'Ürünler', icon: <Package size={20} /> },
    { path: '/compare', label: 'Karşılaştır', icon: <GitCompareArrows size={20} /> },
    { path: '/scrapers', label: 'Kaynaklar', icon: <Radio size={20} /> },
];

export const BottomNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleNav = (path: string) => {
        navigate(path);
    };

    return (
        <nav className={styles.bottomNav} aria-label="Ana navigasyon">
            <div className={styles.pill}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            onClick={() => handleNav(item.path)}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <span className={styles.iconWrap}>
                                {item.icon}
                                {isActive && <span className={styles.glowDot} />}
                            </span>
                            <span className={styles.label}>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
