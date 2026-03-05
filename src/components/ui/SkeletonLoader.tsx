import React from 'react';
import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'table';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={{
        width: width,
        height: height,
      }}
    />
  ));

  if (count === 1) {
    return skeletons[0];
  }

  return <div className={styles.container}>{skeletons}</div>;
};

// Specialized skeleton loaders
export const CardSkeleton: React.FC = () => (
  <div className={styles.cardSkeleton}>
    <div className={`${styles.skeleton} ${styles.cardImage}`} />
    <div className={styles.cardContent}>
      <div className={`${styles.skeleton} ${styles.cardTitle}`} />
      <div className={`${styles.skeleton} ${styles.cardText}`} />
      <div className={`${styles.skeleton} ${styles.cardTextShort}`} />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ columns: number }> = ({ columns }) => (
  <div className={styles.tableRow}>
    {Array.from({ length: columns }, (_, i) => (
      <div key={i} className={`${styles.skeleton} ${styles.tableCell}`} />
    ))}
  </div>
);

export const ProductCardSkeleton: React.FC = () => (
  <div className={styles.productCardSkeleton}>
    <div className={`${styles.skeleton} ${styles.productImage}`} />
    <div className={styles.productInfo}>
      <div className={`${styles.skeleton} ${styles.productName}`} />
      <div className={`${styles.skeleton} ${styles.productCategory}`} />
      <div className={styles.productFooter}>
        <div className={`${styles.skeleton} ${styles.productPrice}`} />
        <div className={`${styles.skeleton} ${styles.productSupplier}`} />
      </div>
    </div>
  </div>
);

export default SkeletonLoader;
