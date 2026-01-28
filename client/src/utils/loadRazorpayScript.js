/**
 * Utility function to dynamically load Razorpay checkout script
 * Prevents duplicate loading and provides promise-based interface
 */

let isRazorpayLoaded = false;
let loadingPromise = null;

export const loadRazorpayScript = () => {
    // Return existing promise if already loading
    if (loadingPromise) {
        return loadingPromise;
    }

    // Return resolved promise if already loaded
    if (isRazorpayLoaded && window.Razorpay) {
        return Promise.resolve(true);
    }

    // Create new loading promise
    loadingPromise = new Promise((resolve, reject) => {
        try {
            // Check if Razorpay is already loaded
            if (window.Razorpay) {
                isRazorpayLoaded = true;
                resolve(true);
                return;
            }

            // Check if script is already in DOM
            const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (existingScript) {
                // Wait for existing script to load
                existingScript.addEventListener('load', () => {
                    isRazorpayLoaded = true;
                    resolve(true);
                });
                existingScript.addEventListener('error', () => {
                    reject(new Error('Failed to load Razorpay script'));
                });
                return;
            }

            // Create and inject new script element
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.crossOrigin = 'anonymous';

            script.onload = () => {
                if (window.Razorpay) {
                    isRazorpayLoaded = true;
                    resolve(true);
                } else {
                    reject(new Error('Razorpay object not found after script load'));
                }
            };

            script.onerror = () => {
                reject(new Error('Failed to load Razorpay script'));
            };

            // Inject script into document head
            document.head.appendChild(script);

        } catch (error) {
            reject(error);
        }
    });

    return loadingPromise;
};

/**
 * Check if Razorpay is already loaded
 */
export const isRazorpayAvailable = () => {
    return isRazorpayLoaded && window.Razorpay;
};

/**
 * Reset the loading state (useful for testing)
 */
export const resetRazorpayLoader = () => {
    isRazorpayLoaded = false;
    loadingPromise = null;
};