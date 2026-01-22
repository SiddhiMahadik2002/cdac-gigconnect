import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';

const AuthLayout = ({
    children,
    title,
    subtitle,
    footerText,
    footerLinkText,
    footerLinkTo,
    visualTitle,
    visualSubtitle,
    features = []
}) => {
    const defaultFeatures = [
        { icon: '✓', text: 'Connect with top-rated freelancers worldwide' },
        { icon: '✓', text: 'Secure payments and project management' },
        { icon: '✓', text: 'Professional tools and collaboration' },
        { icon: '✓', text: '24/7 customer support' }
    ];

    const displayFeatures = features.length > 0 ? features : defaultFeatures;

    return (
        <div className={styles.authLayout}>
            {/* Left Side - Visual Content */}
            <div className={styles.authVisual}>
                <div className={styles.visualContent}>
                    <h2 className={styles.visualTitle}>
                        {visualTitle || 'Welcome to FreelanceHub'}
                    </h2>
                    <p className={styles.visualSubtitle}>
                        {visualSubtitle || 'Your gateway to unlimited freelance opportunities. Connect, collaborate, and create amazing projects together.'}
                    </p>
                    <div className={styles.visualFeatures}>
                        {displayFeatures.map((feature, index) => (
                            <div key={index} className={styles.feature}>
                                <div className={styles.featureIcon}>
                                    {feature.icon}
                                </div>
                                <span>{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form Content */}
            <div className={styles.authFormSide}>
                <div className={styles.authCard}>
                    <div className={styles.authHeader}>
                        <Link to="/" className={styles.logo}>
                            FreelanceHub
                        </Link>
                        <h1 className={styles.title}>{title}</h1>
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    </div>

                    <div className={styles.authContent}>
                        {children}
                    </div>

                    {footerText && (
                        <div className={styles.authFooter}>
                            <p className={styles.footerText}>
                                {footerText}{' '}
                                {footerLinkText && footerLinkTo && (
                                    <Link to={footerLinkTo} className={styles.footerLink}>
                                        {footerLinkText}
                                    </Link>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;