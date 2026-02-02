import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getGigs } from '../api/gig.api.js';
import GigCard from '../components/gig/GigCard.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import styles from './HomePage.module.css';
import { CodeIcon, BrushIcon, NoteIcon, ChartIcon, MovieIcon, MobileIcon } from '../components/icons/Icons.jsx';
import { getMeta } from '../api/meta.api.js';

const HomePage = () => {
    const navigate = useNavigate();
    const [featuredGigs, setFeaturedGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [meta, setMeta] = useState(null);
    const [metaLoading, setMetaLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedGigs = async () => {
            try {
                setLoading(true);
                const response = await getGigs({ page: 1, size: 6 });
                setFeaturedGigs(response.data || []);
            } catch (error) {
                console.error('Error fetching featured gigs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedGigs();
    }, []);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                setMetaLoading(true);
                const res = await getMeta();
                setMeta(res.data || null);
            } catch (err) {
                console.error('Error fetching meta:', err);
                setMeta(null);
            } finally {
                setMetaLoading(false);
            }
        };

        fetchMeta();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/gigs?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const categories = [
        { name: 'Web Development', icon: <CodeIcon />, description: 'Full-stack development, APIs, and more' },
        { name: 'Graphic Design', icon: <BrushIcon />, description: 'Logos, branding, and creative designs' },
        { name: 'Content Writing', icon: <NoteIcon />, description: 'Articles, blogs, and copywriting' },
        { name: 'Digital Marketing', icon: <ChartIcon />, description: 'SEO, social media, and advertising' },
        { name: 'Video Editing', icon: <MovieIcon />, description: 'Professional video production' },
        { name: 'Mobile Apps', icon: <MobileIcon />, description: 'iOS and Android development' }
    ];

    const formatCount = (n) => {
        if (n == null) return '-';
        if (n >= 1000000) return `${Math.round(n / 1000000)}M+`;
        if (n >= 1000) return `${Math.round(n / 1000)}K+`;
        return `${n}`;
    };

    const stats = [
        { value: metaLoading ? '…' : formatCount(meta?.activeFreelancers), label: 'Active Freelancers' },
        { value: metaLoading ? '…' : formatCount(meta?.projectsCompleted), label: 'Projects Completed' },
        { value: '100%', label: 'Secure Payments' },
        { value: '24/7', label: 'Support Available' }
    ];

    return (
        <div className={styles.homePage}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroBackground}>
                    <div className={styles.heroGradient}></div>
                    <div className={styles.heroPattern}></div>
                </div>

                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <h1 className={styles.heroTitle}>
                            Find the Perfect
                            <span className={styles.heroHighlight}> Freelancer </span>
                            for Your Project
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Connect with world-class talent. Get any project done right with
                            our marketplace of skilled freelancers ready to bring your vision to life.
                        </p>

                        <form onSubmit={handleSearch} className={styles.searchContainer}>
                            <div className={styles.searchWrapper}>
                                <Input
                                    type="text"
                                    placeholder="What service are you looking for today?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={styles.heroSearch}
                                />
                                <Button type="submit" className={styles.searchButton}>
                                    Search
                                </Button>
                            </div>
                        </form>

                        <div className={styles.heroTags}>
                            <span className={styles.tagLabel}>Popular:</span>
                            {['Web Development', 'Logo Design', 'Content Writing', 'SEO'].map((tag, index) => (
                                <Link key={index} to={`/gigs?search=${tag}`} className={styles.heroTag}>
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className={styles.heroVisual}>
                        <div className={styles.heroImage}>
                            <img
                                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500&h=400&fit=crop"
                                alt="Freelancer working"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className={styles.statsSection}>
                <div className={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statCard}>
                            <div className={styles.statValue}>{stat.value}</div>
                            <div className={styles.statLabel}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories Section */}
            <section className={styles.categoriesSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Explore Categories</h2>
                    <p className={styles.sectionSubtitle}>
                        Discover services in every category you can imagine
                    </p>
                </div>

                <div className={styles.categoriesGrid}>
                    {categories.map((category, index) => (
                        <Link
                            key={index}
                            to={`/gigs?category=${encodeURIComponent(category.name)}`}
                            className={styles.categoryCard}
                        >
                            <div className={styles.categoryIcon}>{category.icon}</div>
                            <h3 className={styles.categoryName}>{category.name}</h3>
                            <p className={styles.categoryDescription}>{category.description}</p>
                            <div className={styles.categoryArrow}>→</div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Gigs Section */}
            <section className={styles.featuredSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Featured Services</h2>
                    <p className={styles.sectionSubtitle}>
                        Hand-picked services from our top-rated freelancers
                    </p>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Loader centered text="Loading featured services..." />
                    </div>
                ) : (
                    <>
                        <div className={styles.featuredGrid}>
                            {featuredGigs.slice(0, 6).map((gig) => (
                                <GigCard key={gig.id} gig={gig} />
                            ))}
                        </div>

                        <div className={styles.viewAllContainer}>
                            <Link to="/gigs">
                                <Button variant="primary" size="large" className={styles.viewAllButton}>
                                    View All Services
                                    <span className={styles.buttonArrow}>→</span>
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </section>

            {/* CTA Section */}
            <section className={styles.ctaSection}>
                <div className={styles.ctaContent}>
                    <h2 className={styles.ctaTitle}>Ready to Start Your Project?</h2>
                    <p className={styles.ctaSubtitle}>
                        Join thousands of satisfied clients who found the perfect freelancer for their needs
                    </p>
                    <div className={styles.ctaButtons}>
                        <Link to="/gigs">
                            <Button variant="primary" size="large">
                                Find Freelancers
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="outline" size="large">
                                Start Selling
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className={styles.ctaBackground}>
                    <div className={styles.ctaGradient}></div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;