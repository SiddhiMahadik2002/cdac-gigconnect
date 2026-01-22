import React, { forwardRef } from 'react';
import styles from './TextArea.module.css';

const TextArea = forwardRef(({
    label,
    required = false,
    error,
    helperText,
    maxLength,
    showCharCount = false,
    size = 'medium',
    className = '',
    value = '',
    ...props
}, ref) => {
    const textareaClass = [
        styles.textarea,
        styles[size],
        error && styles.error,
        className
    ].filter(Boolean).join(' ');

    const isOverLimit = maxLength && value.length > maxLength;
    const charCountClass = [
        styles.characterCount,
        isOverLimit && styles.overLimit
    ].filter(Boolean).join(' ');

    return (
        <div className={styles.textareaGroup}>
            {label && (
                <label
                    className={`${styles.label} ${required ? styles.required : ''}`}
                    htmlFor={props.id}
                >
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                className={textareaClass}
                value={value}
                maxLength={maxLength}
                {...props}
            />
            {showCharCount && maxLength && (
                <div className={charCountClass}>
                    {value.length}/{maxLength}
                </div>
            )}
            {error && (
                <span className={styles.errorMessage}>{error}</span>
            )}
            {helperText && !error && (
                <span className={styles.helperText}>{helperText}</span>
            )}
        </div>
    );
});

TextArea.displayName = 'TextArea';

export default TextArea;