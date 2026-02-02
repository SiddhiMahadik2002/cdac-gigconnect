import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext.jsx';
import { createRequirement } from '../api/requirement.api.js';
import { USER_ROLES } from '../utils/constants.js';
import Input from '../components/common/Input.jsx';
import TextArea from '../components/common/TextArea.jsx';
import Button from '../components/common/Button.jsx';
import { NoteIcon, MoneyIcon, InfoIcon } from '../components/icons/Icons.jsx';
import styles from './CreateRequirementPage.module.css';

// Validation schema
const requirementSchema = z.object({
    title: z.string()
        .min(10, 'Title must be at least 10 characters')
        .max(100, 'Title cannot exceed 100 characters'),
    description: z.string()
        .min(50, 'Description must be at least 50 characters')
        .max(2000, 'Description cannot exceed 2000 characters'),
    skills: z.string()
        .min(1, 'Please specify required skills')
        .transform(str => str.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0))
        .refine(skills => skills.length > 0, 'At least one skill is required')
        .refine(skills => skills.length <= 10, 'Maximum 10 skills allowed'),
    minPrice: z.number()
        .min(5, 'Minimum price must be at least Rs 5')
        .max(10000, 'Minimum price cannot exceed Rs 10,000'),
    maxPrice: z.number()
        .min(5, 'Maximum price must be at least Rs 5')
        .max(10000, 'Maximum price cannot exceed Rs 10,000'),
    yoeRequired: z.number()
        .min(0, 'Years of experience cannot be negative')
        .max(30, 'Years of experience cannot exceed 30'),
}).refine(data => data.maxPrice >= data.minPrice, {
    message: 'Maximum price must be greater than or equal to minimum price',
    path: ['maxPrice'],
});

const CreateRequirementPage = () => {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm({
        resolver: zodResolver(requirementSchema),
        defaultValues: {
            title: '',
            description: '',
            skills: '',
            minPrice: 50,
            maxPrice: 500,
            yoeRequired: 1,
        },
    });

    // Redirect if not client
    if (role !== USER_ROLES.CLIENT) {
        return (
            <div className={styles.errorContainer}>
                <h2>Access Denied</h2>
                <p>Only clients can post requirements.</p>
                <Button variant="primary" onClick={() => navigate('/gigs')}>
                    Browse Gigs Instead
                </Button>
            </div>
        );
    }

    const onSubmit = async (data) => {
        setServerError('');

        try {
            const requirementData = {
                title: data.title.trim(),
                description: data.description.trim(),
                skills: data.skills, // Already transformed by zod
                minPrice: data.minPrice,
                maxPrice: data.maxPrice,
                yoeRequired: data.yoeRequired,
            };

            const response = await createRequirement(requirementData);
            navigate(`/requirements/${response.id}`);
        } catch (error) {
            console.error('Error creating requirement:', error);
            setServerError(
                error.response?.data?.message ||
                'Failed to create requirement. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const watchedMinPrice = watch('minPrice');

    return (
        <div className={styles.createRequirement}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Post a New Requirement</h1>
                    <p className={styles.subtitle}>
                        Describe your project and connect with talented freelancers
                    </p>
                </div>

                <div className={styles.content}>
                    <div className={styles.formSection}>
                        {serverError && (
                            <div className={styles.errorAlert}>
                                <span className={styles.errorIcon}><InfoIcon /></span>
                                <span>{serverError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.sectionLabel}>
                                    <NoteIcon /> Project Details
                                </label>

                                <Input
                                    label="Project Title"
                                    placeholder="e.g., Build a responsive e-commerce website"
                                    required
                                    {...register('title')}
                                    error={errors.title?.message}
                                />

                                <TextArea
                                    label="Project Description"
                                    placeholder="Describe your project requirements, technologies needed, timeline, and any specific details..."
                                    rows={6}
                                    required
                                    {...register('description')}
                                    error={errors.description?.message}
                                />

                                <Input
                                    label="Required Skills"
                                    placeholder="e.g., React, Node.js, MongoDB, UI/UX Design"
                                    helperText="Enter skills separated by commas (max 10 skills)"
                                    required
                                    {...register('skills')}
                                    error={errors.skills?.message}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.sectionLabel}>
                                    <MoneyIcon /> Budget & Experience
                                </label>

                                <div className={styles.priceRange}>
                                    <Input
                                        label="Minimum Budget (Rs)"
                                        type="number"
                                        min="5"
                                        max="10000"
                                        step="5"
                                        required
                                        {...register('minPrice', { valueAsNumber: true })}
                                        error={errors.minPrice?.message}
                                    />

                                    <Input
                                        label="Maximum Budget (Rs)"
                                        type="number"
                                        min={watchedMinPrice || 5}
                                        max="10000"
                                        step="5"
                                        required
                                        {...register('maxPrice', { valueAsNumber: true })}
                                        error={errors.maxPrice?.message}
                                    />
                                </div>

                                <Input
                                    label="Years of Experience Required"
                                    type="number"
                                    min="0"
                                    max="30"
                                    step="1"
                                    required
                                    {...register('yoeRequired', { valueAsNumber: true })}
                                    error={errors.yoeRequired?.message}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/client/requirements')}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={isLoading}
                                    disabled={isLoading}
                                    size="large"
                                >
                                    Post Requirement
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className={styles.sidebar}>
                        <div className={styles.tipsCard}>
                            <h3><InfoIcon /> Tips for Better Results</h3>
                            <ul className={styles.tipsList}>
                                <li>
                                    <strong>Be specific:</strong> Clear requirements attract quality proposals
                                </li>
                                <li>
                                    <strong>Set realistic budget:</strong> Research market rates for your project
                                </li>
                                <li>
                                    <strong>Mention timeline:</strong> Include deadlines in your description
                                </li>
                                <li>
                                    <strong>Required skills:</strong> List specific technologies needed
                                </li>
                                <li>
                                    <strong>Experience level:</strong> Match complexity with required experience
                                </li>
                            </ul>
                        </div>

                        <div className={styles.processCard}>
                            <h3><NoteIcon /> What Happens Next?</h3>
                            <div className={styles.processSteps}>
                                <div className={styles.step}>
                                    <span className={styles.stepNumber}>1</span>
                                    <span>Your requirement is posted</span>
                                </div>
                                <div className={styles.step}>
                                    <span className={styles.stepNumber}>2</span>
                                    <span>Freelancers submit proposals</span>
                                </div>
                                <div className={styles.step}>
                                    <span className={styles.stepNumber}>3</span>
                                    <span>Review and select the best fit</span>
                                </div>
                                <div className={styles.step}>
                                    <span className={styles.stepNumber}>4</span>
                                    <span>Start working with your freelancer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRequirementPage;