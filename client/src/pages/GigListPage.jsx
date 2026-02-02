import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import GigCard from '../components/gig/GigCard.jsx';
import { getGigs } from '../api/gig.api.js';
import { debounce } from '../utils/nameMapper.js';
import { PAGINATION } from '../utils/constants.js';
import styles from './GigListPage.module.css';

const GigListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  // Debounced price values to avoid fetching on every keystroke
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(minPrice);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(maxPrice);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMinPrice(minPrice), 500);
    return () => clearTimeout(t);
  }, [minPrice]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMaxPrice(maxPrice), 500);
    return () => clearTimeout(t);
  }, [maxPrice]);

  // Debounced query state: update this after a short delay to avoid updating the URL on every keystroke
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Sync debounced query to URL search params (single place where we call setSearchParams)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (debouncedQuery) {
      params.set('search', debouncedQuery);
    } else {
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
  }, [debouncedQuery, setSearchParams]);

  // Fetch gigs effect (use debouncedQuery to avoid fetching on every keystroke)
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        setError('');

        const params = {
          page: currentPage, // Our API handler will convert to 0-based
          size: PAGINATION.DEFAULT_PAGE_SIZE,
          ...(debouncedQuery && { search: debouncedQuery }),
          ...(debouncedMinPrice && { minPrice: parseFloat(debouncedMinPrice) }),
          ...(debouncedMaxPrice && { maxPrice: parseFloat(debouncedMaxPrice) }),
          ...(skill && { skill }),
          ...(category && { category }),
        };

        const response = await getGigs(params);
        setGigs(response.content || []);
        setTotalCount(response.totalElements || 0);
      } catch (err) {
        setError('Failed to load gigs. Please try again.');
        console.error('Error fetching gigs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [debouncedQuery, debouncedMinPrice, debouncedMaxPrice, skill, currentPage, category]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // Handle filter application
  const handleApplyFilters = () => {
    const params = new URLSearchParams(window.location.search);
    if (searchQuery) params.set('search', searchQuery);
    else params.delete('search');
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    if (skill) params.set('skill', skill);
    else params.delete('skill');

    setSearchParams(params);
    setCurrentPage(1);
  };

  // Handle filter clear
  const handleClearFilters = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSkill('');
    // Preserve category when clearing filters so category-based views continue to work
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    setSearchParams(params);
    setCurrentPage(1);
  };

  // Keep local `category` state in sync when URL search params change
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
  }, [searchParams]);

  if (loading) {
    return (
      <div className={styles.gigListPage}>
        <Loader centered fullHeight text="Loading gigs..." />
      </div>
    );
  }

  return (
    <div className={styles.gigListPage}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Find the Perfect Gig</h1>
        <p className={styles.subtitle}>
          Discover amazing services from talented freelancers around the world.
          From web development to graphic design, find exactly what you need.
        </p>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <h2 className={styles.filtersTitle}>Search & Filters</h2>
        <div className={styles.filterGrid}>
          <Input
            placeholder="Search gigs..."
            value={searchQuery}
            onChange={handleSearchChange}
            icon="🔍"
          />
          <Input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
          />
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Button
              variant="primary"
              onClick={handleApplyFilters}
            >
              Apply
            </Button>
            <Button
              variant="secondary"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {error ? (
          <div className={styles.error}>
            {error}
          </div>
        ) : (
          <>
            <div className={styles.contentHeader}>
              <div className={styles.resultsCount}>
                {totalCount} gig{totalCount !== 1 ? 's' : ''} found
              </div>
            </div>

            {gigs.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3 className={styles.emptyTitle}>No gigs found</h3>
                <p className={styles.emptyDescription}>
                  Try adjusting your search criteria or browse all available gigs.
                </p>
              </div>
            ) : (
              <div className={styles.gigsGrid}>
                {gigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GigListPage;