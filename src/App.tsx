import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { Home } from './pages/Home/Home';
import { Products } from './pages/Products/Products';
import { Scrapers } from './pages/Scrapers/Scrapers';
import { Compare } from './pages/Compare/Compare';
import { ScraperTestPanel } from './components/features/ScraperTestPanel';
import { ToastContainer } from './components/ui/Toast';
import './styles/globals.css';
import './styles/animations.css';
import styles from './App.module.css';

function App() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const openFilters = useCallback(() => {
    setFiltersOpen(true);
  }, []);

  const closeFilters = useCallback(() => {
    setFiltersOpen(false);
  }, []);

  return (
    <Router>
      <div className={styles.app}>
        <Header />

        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products onOpenFilters={openFilters} />} />
            <Route path="/scrapers" element={<Scrapers />} />
            <Route path="/test" element={<ScraperTestPanel />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="*" element={
              <div className={styles.notFound}>
                <div className={styles.notFoundIcon}>🔍</div>
                <h2>Sayfa Bulunamadı</h2>
                <p>Aradığınız sayfa mevcut değil.</p>
              </div>
            } />
          </Routes>
        </main>

        {/* Floating Filter Panel */}
        <Sidebar isOpen={filtersOpen} onClose={closeFilters} />

        {/* Floating Bottom Navigation */}
        <BottomNav />

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
