import React, { useState } from 'react';
import PayNowButton from '../payment/PayNowButton';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/nameMapper';
import styles from './PaymentTest.module.css';

/**
 * Test component for Razorpay payment integration
 * This component is for development/testing purposes only
 */
const PaymentTest = () => {
    const [testResults, setTestResults] = useState([]);
    const [isTestMode, setIsTestMode] = useState(true);

    const addTestResult = (result) => {
        setTestResults(prev => [
            ...prev,
            {
                ...result,
                timestamp: new Date().toLocaleTimeString()
            }
        ]);
    };

    const clearResults = () => {
        setTestResults([]);
    };

    const testGigPayment = {
        referenceType: 'GIG',
        referenceId: 'test-gig-123',
        amount: 2500,
        title: 'Test Gig Payment - ₹2,500'
    };

    const testProposalPayment = {
        referenceType: 'PROPOSAL',
        referenceId: 'test-proposal-456',
        amount: 5000,
        title: 'Test Proposal Payment - ₹5,000'
    };

    const handleSuccess = (paymentData) => {
        addTestResult({
            type: 'success',
            message: `Payment successful for ${paymentData.referenceType} (${paymentData.referenceId})`,
            data: paymentData
        });
    };

    const handleFailure = (error) => {
        addTestResult({
            type: 'error',
            message: `Payment failed: ${error.message}`,
            error: error
        });
    };

    if (!isTestMode) {
        return (
            <div className={styles.container}>
                <div className={styles.warning}>
                    <h3>⚠️ Payment Testing Disabled</h3>
                    <p>Payment testing is disabled in production mode.</p>
                    <Button onClick={() => setIsTestMode(true)}>
                        Enable Test Mode
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>🧪 Razorpay Payment Test Center</h2>
                <p>Test the payment integration with different scenarios</p>
                <Button
                    variant="outline"
                    size="small"
                    onClick={() => setIsTestMode(false)}
                >
                    Disable Test Mode
                </Button>
            </div>

            <div className={styles.testSection}>
                <h3>Test Payments</h3>
                <div className={styles.paymentTests}>

                    {/* Gig Payment Test */}
                    <div className={styles.testCard}>
                        <div className={styles.testInfo}>
                            <h4>💼 Gig Purchase</h4>
                            <p>Type: {testGigPayment.referenceType}</p>
                            <p>ID: {testGigPayment.referenceId}</p>
                            <p>Amount: {formatCurrency(testGigPayment.amount)}</p>
                        </div>
                        <PayNowButton
                            referenceType={testGigPayment.referenceType}
                            referenceId={testGigPayment.referenceId}
                            amount={testGigPayment.amount}
                            onSuccess={handleSuccess}
                            onFailure={handleFailure}
                            variant="primary"
                        >
                            Test Gig Payment
                        </PayNowButton>
                    </div>

                    {/* Proposal Payment Test */}
                    <div className={styles.testCard}>
                        <div className={styles.testInfo}>
                            <h4>📄 Proposal Payment</h4>
                            <p>Type: {testProposalPayment.referenceType}</p>
                            <p>ID: {testProposalPayment.referenceId}</p>
                            <p>Amount: {formatCurrency(testProposalPayment.amount)}</p>
                        </div>
                        <PayNowButton
                            referenceType={testProposalPayment.referenceType}
                            referenceId={testProposalPayment.referenceId}
                            amount={testProposalPayment.amount}
                            onSuccess={handleSuccess}
                            onFailure={handleFailure}
                            variant="primary"
                        >
                            Test Proposal Payment
                        </PayNowButton>
                    </div>

                    {/* Small Amount Test */}
                    <div className={styles.testCard}>
                        <div className={styles.testInfo}>
                            <h4>💰 Small Amount</h4>
                            <p>Type: GIG</p>
                            <p>ID: test-small-amount</p>
                            <p>Amount: {formatCurrency(100)}</p>
                        </div>
                        <PayNowButton
                            referenceType="GIG"
                            referenceId="test-small-amount"
                            amount={100}
                            onSuccess={handleSuccess}
                            onFailure={handleFailure}
                            variant="outline"
                        >
                            Test ₹100 Payment
                        </PayNowButton>
                    </div>

                </div>
            </div>

            {/* Test Instructions */}
            <div className={styles.instructions}>
                <h3>📋 Test Instructions</h3>
                <div className={styles.instructionGrid}>
                    <div className={styles.instructionCard}>
                        <h4>✅ Successful Payment</h4>
                        <p>Use Razorpay test card:</p>
                        <code>4111 1111 1111 1111</code>
                        <p>CVV: Any 3 digits | Expiry: Any future date</p>
                    </div>
                    <div className={styles.instructionCard}>
                        <h4>❌ Failed Payment</h4>
                        <p>Use UPI ID:</p>
                        <code>failure@razorpay</code>
                        <p>Or click "Cancel" in Razorpay popup</p>
                    </div>
                    <div className={styles.instructionCard}>
                        <h4>🔄 Network Error</h4>
                        <p>Disconnect internet during payment</p>
                        <p>Or use invalid card: 4000000000000002</p>
                    </div>
                </div>
            </div>

            {/* Test Results */}
            <div className={styles.results}>
                <div className={styles.resultsHeader}>
                    <h3>📊 Test Results</h3>
                    <Button variant="outline" size="small" onClick={clearResults}>
                        Clear Results
                    </Button>
                </div>

                {testResults.length === 0 ? (
                    <div className={styles.noResults}>
                        <p>No test results yet. Try making a payment above.</p>
                    </div>
                ) : (
                    <div className={styles.resultsList}>
                        {testResults.map((result, index) => (
                            <div
                                key={index}
                                className={`${styles.resultItem} ${styles[result.type]}`}
                            >
                                <div className={styles.resultHeader}>
                                    <span className={styles.resultType}>
                                        {result.type === 'success' ? '✅' : '❌'}
                                        {result.type === 'success' ? 'Success' : 'Error'}
                                    </span>
                                    <span className={styles.resultTime}>{result.timestamp}</span>
                                </div>
                                <p className={styles.resultMessage}>{result.message}</p>
                                {result.data && (
                                    <details className={styles.resultDetails}>
                                        <summary>View Details</summary>
                                        <pre>{JSON.stringify(result.data, null, 2)}</pre>
                                    </details>
                                )}
                                {result.error && (
                                    <details className={styles.resultDetails}>
                                        <summary>View Error</summary>
                                        <pre>{JSON.stringify(result.error, null, 2)}</pre>
                                    </details>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentTest;