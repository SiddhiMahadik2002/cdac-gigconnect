import React from 'react';
import styles from './Loader.module.css';

const Loader = ({
    size = 'medium',
    text = '',
    centered = false,
    fullHeight = false,
    className = ''
}) => {
    const loaderClass = [
        styles.loader,
        centered && styles.centered,
        centered && fullHeight && styles.fullHeight,
        className
    ].filter(Boolean).join(' ');

    const spinnerClass = [
        styles.spinner,
        styles[size]
    ].filter(Boolean).join(' ');

    return (
        <div className={loaderClass}>
            <div className={spinnerClass} />
            {text && <span className={styles.text}>{text}</span>}
        </div>
    );
};

export default Loader;