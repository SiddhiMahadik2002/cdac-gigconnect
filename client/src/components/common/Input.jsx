import React, { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({
    label,
    required = false,
    error,
    helperText,
    icon,
    size = 'medium',
    className = '',
    ...props
}, ref) => {
    const inputClass = [
        styles.input,
        styles[size],
        error && styles.error,
        className
    ].filter(Boolean).join(' ');

    const wrapperClass = [
        styles.inputWrapper,
        icon && styles.hasIcon
    ].filter(Boolean).join(' ');

    return (
        <div className={styles.inputGroup}>
            {label && (
                <label
                    className={`${styles.label} ${required ? styles.required : ''}`}
                    htmlFor={props.id}
                >
                    {label}
                </label>
            )}
            <div className={wrapperClass}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <input
                    ref={ref}
                    className={inputClass}
                    {...props}
                />
            </div>
            {error && (
                <span className={styles.errorMessage}>{error}</span>
            )}
            {helperText && !error && (
                <span className={styles.helperText}>{helperText}</span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;