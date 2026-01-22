import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { loginUser } from '../api/auth.api.js';
import { USER_ROLES } from '../utils/constants.js';
import styles from './LoginPage.module.css';

// Validation schema
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Get the intended destination or default redirect path
    const from = location.state?.from?.pathname || null;

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to={from || "/"} replace />;
    }

    const onSubmit = async (data) => {
        setIsLoading(true);
        setServerError('');

        try {
            const response = await loginUser(data);

            // Login the user with the returned data (backend already set HTTP-only cookie)
            await login(response.user);

            // Redirect to home on successful login
            navigate(from || '/');
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Login failed. Please check your credentials.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to your account to continue"
            footerText="Don't have an account?"
            footerLinkText="Sign Up"
            footerLinkTo="/register"
            visualTitle="Welcome Back!"
            visualSubtitle="Sign in to access your freelance dashboard, manage projects, and connect with clients worldwide."
            features={[
                { icon: '🚀', text: 'Access your project dashboard' },
                { icon: '💼', text: 'Manage your freelance portfolio' },
                { icon: '💬', text: 'Connect with global clients' },
                { icon: '💰', text: 'Track earnings and payments' }
            ]}
        >
            {serverError && (
                <div className={styles.errorMessage}>
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <Input
                    label="Email"
                    type="email"
                    required
                    {...register('email')}
                    error={errors.email?.message}
                    disabled={isLoading}
                    autoFocus
                />

                <Input
                    label="Password"
                    type="password"
                    required
                    {...register('password')}
                    error={errors.password?.message}
                    disabled={isLoading}
                />

                <div className={styles.forgotPassword}>
                    <a href="#" className={styles.forgotPasswordLink}>
                        Forgot Password?
                    </a>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading}
                >
                    Sign In
                </Button>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;