// Church Payment Integration with Stripe
// This file handles all payment-related functionality

class ChurchPaymentSystem {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.paymentElement = null;
        this.apiBaseUrl = 'http://localhost:3000/api'; // Update for production
        this.isInitialized = false;
        
        this.init();
    }

    // Initialize Stripe
    async init() {
        try {
            // Load Stripe.js
            if (!window.Stripe) {
                await this.loadStripeJS();
            }

            // Initialize Stripe with publishable key
            const publishableKey = 'pk_test_your_stripe_publishable_key_here'; // Replace with your key
            this.stripe = Stripe(publishableKey);

            this.isInitialized = true;
            console.log('✅ Church Payment System initialized');
        } catch (error) {
            console.error('❌ Failed to initialize payment system:', error);
        }
    }

    // Load Stripe.js dynamically
    loadStripeJS() {
        return new Promise((resolve, reject) => {
            if (window.Stripe) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Create donation form
    async createDonationForm(containerId, options = {}) {
        if (!this.isInitialized) {
            console.error('Payment system not initialized');
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        // Create donation form HTML
        container.innerHTML = `
            <div class="donation-form">
                <div class="form-header">
                    <h2>Make a Donation</h2>
                    <p>Your generous gift helps us continue our ministry and serve our community.</p>
                </div>

                <form id="donation-form">
                    <!-- Donor Information -->
                    <div class="donor-info-section">
                        <h3>Donor Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="donor-name">Full Name *</label>
                                <input type="text" id="donor-name" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="donor-email">Email Address *</label>
                                <input type="email" id="donor-email" name="email" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="donor-phone">Phone Number (Optional)</label>
                            <input type="tel" id="donor-phone" name="phone">
                        </div>
                    </div>

                    <!-- Donation Details -->
                    <div class="donation-details-section">
                        <h3>Donation Details</h3>
                        <div class="form-group">
                            <label for="donation-type">Donation Type</label>
                            <select id="donation-type" name="donationType">
                                <option value="general">General Fund</option>
                                <option value="missions">Missions</option>
                                <option value="building">Building Fund</option>
                                <option value="youth">Youth Ministry</option>
                                <option value="children">Children's Ministry</option>
                                <option value="benevolence">Benevolence Fund</option>
                                <option value="tithe">Tithe</option>
                            </select>
                        </div>

                        <!-- Amount Selection -->
                        <div class="form-group">
                            <label>Donation Amount</label>
                            <div class="amount-buttons">
                                <button type="button" class="amount-btn" data-amount="25">$25</button>
                                <button type="button" class="amount-btn" data-amount="50">$50</button>
                                <button type="button" class="amount-btn" data-amount="100">$100</button>
                                <button type="button" class="amount-btn" data-amount="250">$250</button>
                                <button type="button" class="amount-btn" data-amount="500">$500</button>
                            </div>
                            <div class="custom-amount">
                                <label for="custom-amount">Custom Amount</label>
                                <div class="amount-input">
                                    <span class="currency">$</span>
                                    <input type="number" id="custom-amount" name="amount" min="1" step="0.01" placeholder="0.00">
                                </div>
                            </div>
                        </div>

                        <!-- Recurring Option -->
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="recurring" name="recurring">
                                <span class="checkmark"></span>
                                Make this a monthly recurring donation
                            </label>
                        </div>
                    </div>

                    <!-- Payment Element Container -->
                    <div class="payment-section">
                        <h3>Payment Information</h3>
                        <div id="payment-element">
                            <!-- Stripe Elements will create form elements here -->
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="form-actions">
                        <button type="submit" id="submit-donation" class="donation-submit-btn">
                            <span id="button-text">Donate Now</span>
                            <div id="loading-spinner" class="spinner hidden"></div>
                        </button>
                    </div>

                    <!-- Error Display -->
                    <div id="payment-errors" class="error-message hidden"></div>
                </form>
            </div>
        `;

        // Add styles
        this.addDonationFormStyles();

        // Set up form interactions
        this.setupFormInteractions();

        // Initialize payment element
        await this.initializePaymentElement();
    }

    // Setup form interactions
    setupFormInteractions() {
        // Amount button selection
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const amount = e.target.dataset.amount;
                document.getElementById('custom-amount').value = amount;
                
                // Update button states
                document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        // Custom amount input
        document.getElementById('custom-amount').addEventListener('input', () => {
            document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
        });

        // Form submission
        document.getElementById('donation-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDonationSubmission();
        });
    }

    // Initialize Stripe Payment Element
    async initializePaymentElement() {
        try {
            // Create a temporary payment intent to initialize elements
            const response = await fetch(`${this.apiBaseUrl}/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 10, // Temporary amount for initialization
                    donorInfo: { email: 'temp@example.com' }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to initialize payment');
            }

            const { clientSecret } = await response.json();

            // Create Elements instance
            this.elements = this.stripe.elements({
                clientSecret,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#3498db',
                        colorBackground: '#ffffff',
                        colorText: '#2c3e50',
                        colorDanger: '#e74c3c',
                        fontFamily: 'Arial, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px',
                    }
                }
            });

            // Create and mount Payment Element
            this.paymentElement = this.elements.create('payment');
            this.paymentElement.mount('#payment-element');

        } catch (error) {
            console.error('Error initializing payment element:', error);
            this.showError('Failed to load payment form. Please refresh the page.');
        }
    }

    // Handle donation submission
    async handleDonationSubmission() {
        if (!this.stripe || !this.elements) {
            this.showError('Payment system not ready. Please refresh the page.');
            return;
        }

        const form = document.getElementById('donation-form');
        const formData = new FormData(form);
        const donationData = Object.fromEntries(formData);

        // Validation
        if (!donationData.name || !donationData.email || !donationData.amount) {
            this.showError('Please fill in all required fields.');
            return;
        }

        const amount = parseFloat(donationData.amount);
        if (amount < 1) {
            this.showError('Minimum donation amount is $1.00');
            return;
        }

        // Show loading state
        this.setLoading(true);

        try {
            // Create payment intent with actual donation data
            const response = await fetch(`${this.apiBaseUrl}/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    donationType: donationData.donationType,
                    donorInfo: {
                        name: donationData.name,
                        email: donationData.email,
                        phone: donationData.phone
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret } = await response.json();

            // Confirm payment
            const { error, paymentIntent } = await this.stripe.confirmPayment({
                elements: this.elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success.html`,
                },
                redirect: 'if_required'
            });

            if (error) {
                this.showError(error.message);
            } else if (paymentIntent.status === 'succeeded') {
                this.showSuccess('Thank you for your donation! A receipt has been sent to your email.');
                form.reset();
                document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
            }

        } catch (error) {
            console.error('Payment error:', error);
            this.showError('Payment failed. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    // Show error message
    showError(message) {
        const errorDiv = document.getElementById('payment-errors');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }

    // Show success message
    showSuccess(message) {
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            background-color: #27ae60;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        `;
        
        const form = document.getElementById('donation-form');
        form.insertBefore(successDiv, form.firstChild);
        
        // Hide after 10 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 10000);
    }

    // Set loading state
    setLoading(isLoading) {
        const submitBtn = document.getElementById('submit-donation');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('loading-spinner');
        
        if (isLoading) {
            submitBtn.disabled = true;
            buttonText.textContent = 'Processing...';
            spinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            buttonText.textContent = 'Donate Now';
            spinner.classList.add('hidden');
        }
    }

    // Add donation form styles
    addDonationFormStyles() {
        if (document.getElementById('donation-form-styles')) return;

        const style = document.createElement('style');
        style.id = 'donation-form-styles';
        style.textContent = `
            .donation-form {
                max-width: 600px;
                margin: 0 auto;
                padding: 30px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }

            .form-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .form-header h2 {
                color: #2c3e50;
                margin-bottom: 10px;
            }

            .donor-info-section,
            .donation-details-section,
            .payment-section {
                margin-bottom: 30px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }

            .donor-info-section h3,
            .donation-details-section h3,
            .payment-section h3 {
                color: #3498db;
                margin-bottom: 20px;
                font-size: 1.2rem;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #2c3e50;
            }

            .form-group input,
            .form-group select {
                width: 100%;
                padding: 12px;
                border: 2px solid #e1e1e1;
                border-radius: 6px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }

            .form-group input:focus,
            .form-group select:focus {
                outline: none;
                border-color: #3498db;
            }

            .amount-buttons {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 10px;
                margin-bottom: 20px;
            }

            .amount-btn {
                padding: 12px;
                border: 2px solid #e1e1e1;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .amount-btn:hover,
            .amount-btn.selected {
                border-color: #3498db;
                background-color: #3498db;
                color: white;
            }

            .amount-input {
                position: relative;
                max-width: 200px;
            }

            .currency {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                font-weight: 600;
                color: #666;
            }

            .amount-input input {
                padding-left: 30px;
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                cursor: pointer;
                font-weight: normal !important;
            }

            .checkbox-label input[type="checkbox"] {
                width: auto !important;
                margin-right: 10px !important;
            }

            #payment-element {
                margin: 20px 0;
            }

            .form-actions {
                text-align: center;
                margin-top: 30px;
            }

            .donation-submit-btn {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                border: none;
                padding: 15px 40px;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-width: 160px;
            }

            .donation-submit-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(52,152,219,0.3);
            }

            .donation-submit-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }

            .spinner {
                border: 2px solid transparent;
                border-top: 2px solid #ffffff;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                animation: spin 1s linear infinite;
                margin-left: 10px;
                display: inline-block;
            }

            .hidden {
                display: none !important;
            }

            .error-message {
                background-color: #e74c3c;
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @media (max-width: 768px) {
                .donation-form {
                    padding: 20px;
                    margin: 0 15px;
                }

                .form-row {
                    grid-template-columns: 1fr;
                }

                .amount-buttons {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize payment system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.churchPayments = new ChurchPaymentSystem();
});

// Expose for manual initialization
window.ChurchPaymentSystem = ChurchPaymentSystem;