import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { USER_ROLES } from '../utils/constants.js';
import Button from '../components/common/Button.jsx';
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
    const { isAuthenticated, user, role, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setDropdownOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getUserInitials = () => {
        if (!user?.fullName) return 'U';
        const names = user.fullName.split(' ');
        return names.length > 1
            ? `${names[0][0]}${names[names.length - 1][0]}`
            : names[0][0];
    };

    const isActiveLink = (path) => {
        return location.pathname === path;
    };

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <Link to="/" className={styles.logo}>
                        FreelanceHub
                    </Link>

                    <nav className={styles.nav}>
                        {isAuthenticated ? (
                            <>
                                <ul className={styles.navLinks}>
                                    <li>
                                        <Link
                                            to="/gigs"
                                            className={`${styles.navLink} ${isActiveLink('/gigs') ? styles.active : ''}`}
                                        >
                                            Browse Gigs
                                        </Link>
                                    </li>
                                    {role === USER_ROLES.FREELANCER && (
                                        <>
                                            <li>
                                                <Link
                                                    to="/dashboard"
                                                    className={`${styles.navLink} ${isActiveLink('/dashboard') ? styles.active : ''}`}
                                                >
                                                    Dashboard
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    to="/freelancer/gigs"
                                                    className={`${styles.navLink} ${isActiveLink('/freelancer/gigs') ? styles.active : ''}`}
                                                >
                                                    My Gigs
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </ul>

                                <div className={styles.userMenu} ref={dropdownRef}>
                                    <button
                                        className={styles.userButton}
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                    >
                                        <div className={styles.userAvatar}>
                                            {getUserInitials()}
                                        </div>
                                        <span>▼</span>
                                    </button>

                                    <div className={`${styles.dropdown} ${dropdownOpen ? styles.open : ''}`}>
                                        <div className={styles.dropdownItem}>
                                            <strong>{user?.fullName || 'User'}</strong>
                                        </div>
                                        <div className={styles.dropdownDivider} />

                                        {role === USER_ROLES.FREELANCER && (
                                            <>
                                                <Link to="/freelancer/profile" className={styles.dropdownItem}>
                                                    👤 Profile
                                                </Link>
                                                <Link to="/freelancer/gigs/new" className={styles.dropdownItem}>
                                                    ➕ Create Gig
                                                </Link>
                                                <div className={styles.dropdownDivider} />
                                            </>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className={styles.dropdownItem}
                                            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/login')}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/register')}
                                >
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;