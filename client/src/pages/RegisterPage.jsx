import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { registerUser } from '../api/auth.api.js';
import { toFullName } from '../utils/nameMapper.js';
import { USER_ROLES, VALIDATION } from '../utils/constants.js';
import styles from './RegisterPage.module.css';

// Validation schema
const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(VALIDATION.MIN_PASSWORD_LENGTH, `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string(),
    role: z.enum([USER_ROLES.CLIENT, USER_ROLES.FREELANCER], {
        required_error: 'Please select a role',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

const RegisterPage = () => {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: '',
        },
    });

    const selectedRole = watch('role');

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const onSubmit = async (data) => {
        setIsLoading(true);
        setServerError('');

        try {
            // Convert firstName + lastName to fullName for backend
            const requestData = {
                fullName: toFullName(data.firstName, data.lastName),
                email: data.email,
                password: data.password,
                role: data.role,
            };

            const response = await registerUser(requestData);

            // Login the user with the returned data (backend already set HTTP-only cookie)
            await login(response.user);

            // Redirect based on role
            const redirectPath = data.role === USER_ROLES.FREELANCER ? '/freelancer/profile' : '/gigs';
            navigate(redirectPath);
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Registration failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleSelect = (role) => {
        setValue('role', role);
    };

    return (
        <AuthLayout
            title="Create Your Account"
            subtitle="Join FreelanceHub and start your journey"
            footerText="Already have an account?"
            footerLinkText="Sign In"
            footerLinkTo="/login"
            visualTitle="Join FreelanceHub Today"
            visualSubtitle="Start your freelance journey or find the perfect talent for your next project. Join thousands of professionals already succeeding on our platform."
            features={[
                { icon: '🌍', text: 'Access global opportunities' },
                { icon: '💪', text: 'Build your professional portfolio' },
                { icon: '🔒', text: 'Secure and trusted platform' },
                { icon: '⚡', text: 'Quick project matching' }
            ]}
        >
            {serverError && (
                <div className={styles.errorMessage}>
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.formRow}>
                    <Input
                        label="First Name"
                        type="text"
                        required
                        {...register('firstName')}
                        error={errors.firstName?.message}
                        disabled={isLoading}
                    />
                    <Input
                        label="Last Name"
                        type="text"
                        required
                        {...register('lastName')}
                        error={errors.lastName?.message}
                        disabled={isLoading}
                    />
                </div>

                <Input
                    label="Email"
                    type="email"
                    required
                    {...register('email')}
                    error={errors.email?.message}
                    disabled={isLoading}
                />

                <Input
                    label="Password"
                    type="password"
                    required
                    {...register('password')}
                    error={errors.password?.message}
                    disabled={isLoading}
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    required
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                    disabled={isLoading}
                />

                <div className={styles.roleSelector}>
                    <span className={styles.roleLabel}>I want to:</span>
                    <div className={styles.roleOptions}>
                        <div
                            className={`${styles.roleOption} ${selectedRole === USER_ROLES.CLIENT ? styles.selected : ''}`}
                            onClick={() => handleRoleSelect(USER_ROLES.CLIENT)}
                        >
                            <div className={styles.roleIcon}>💼</div>
                            <div className={styles.roleTitle}>Hire Freelancers</div>
                            <div className={styles.roleDescription}>
                                Post projects and hire talented freelancers
                            </div>
                        </div>

                        <div
                            className={`${styles.roleOption} ${selectedRole === USER_ROLES.FREELANCER ? styles.selected : ''}`}
                            onClick={() => handleRoleSelect(USER_ROLES.FREELANCER)}
                        >
                            <div className={styles.roleIcon}>🎯</div>
                            <div className={styles.roleTitle}>Work as Freelancer</div>
                            <div className={styles.roleDescription}>
                                Offer services and work on exciting projects
                            </div>
                        </div>
                    </div>
                    {errors.role && (
                        <span className={styles.errorMessage}>
                            {errors.role.message}
                        </span>
                    )}
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading}
                >
                    Create Account
                </Button>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;