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
    value,
    ...props
}, ref) => {
    const textareaClass = [
        styles.textarea,
        styles[size],
        error && styles.error,
        className
    ].filter(Boolean).join(' ');

    const isOverLimit = maxLength && value && value.length > maxLength;
    const charCountClass = [
        styles.characterCount,
        isOverLimit && styles.overLimit
    ].filter(Boolean).join(' ');

    const textareaProps = {
        ...props
    };

    const registerRef = textareaProps.ref;
    delete textareaProps.ref;

    textareaProps.ref = registerRef || ref;
    textareaProps.className = textareaClass;
    textareaProps.maxLength = maxLength;

    // Only add value prop if it's provided (for controlled components)
    if (value !== undefined) {
        textareaProps.value = value;
    }

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
                {...textareaProps}
            />
            {showCharCount && maxLength && (
                <div className={charCountClass}>
                    {(value || '').length}/{maxLength}
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