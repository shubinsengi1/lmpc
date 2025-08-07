// Donation Form JavaScript with Stripe Integration

// Initialize Stripe (you'll need to replace with your publishable key)
const stripe = Stripe('pk_test_your_stripe_publishable_key_here'); // Replace with actual key
const elements = stripe.elements();

// DOM Elements
const donationModal = document.getElementById('donation-modal');
const successModal = document.getElementById('success-modal');
const donationForm = document.getElementById('donation-form');
const openDonationBtn = document.getElementById('open-donation-form');
const closeModalBtns = document.querySelectorAll('.close-modal');
const amountBtns = document.querySelectorAll('.amount-btn');
const customAmountDiv = document.querySelector('.custom-amount');
const customAmountInput = document.getElementById('custom-amount-input');
const donationTotal = document.getElementById('donation-total');
const submitBtn = document.getElementById('submit-donation');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');

let currentAmount = 0;
let cardElement;
let clientSecret = null;

// Initialize donation form
document.addEventListener('DOMContentLoaded', function() {
    setupStripeElements();
    setupEventListeners();
});

function setupStripeElements() {
    // Create card element
    cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
                fontFamily: 'Inter, Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif',
            },
            invalid: {
                color: '#9e2146',
            },
        },
    });

    // Mount card element
    cardElement.mount('#card-element');

    // Handle real-time validation errors from the card Element
    cardElement.on('change', ({error}) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
            displayError.textContent = error.message;
        } else {
            displayError.textContent = '';
        }
        
        updateSubmitButton();
    });
}

function setupEventListeners() {
    // Open donation modal
    openDonationBtn.addEventListener('click', openDonationModal);

    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeDonationModal);
    });

    // Close modal when clicking overlay
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeDonationModal();
        }
    });

    // Amount button selection
    amountBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            amountBtns.forEach(b => b.classList.remove('active'));
            
            if (this.classList.contains('custom')) {
                this.classList.add('active');
                customAmountDiv.style.display = 'block';
                customAmountInput.focus();
                currentAmount = parseFloat(customAmountInput.value) || 0;
            } else {
                this.classList.add('active');
                customAmountDiv.style.display = 'none';
                currentAmount = parseFloat(this.dataset.amount);
            }
            
            updateDonationTotal();
            updateSubmitButton();
        });
    });

    // Custom amount input
    customAmountInput.addEventListener('input', function() {
        currentAmount = parseFloat(this.value) || 0;
        updateDonationTotal();
        updateSubmitButton();
    });

    // Form submission
    donationForm.addEventListener('submit', handleFormSubmit);

    // Form validation
    donationForm.addEventListener('input', updateSubmitButton);
}

function openDonationModal() {
    donationModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeDonationModal() {
    donationModal.style.display = 'none';
    successModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetForm();
}

function closeSuccessModal() {
    closeDonationModal();
}

function resetForm() {
    donationForm.reset();
    amountBtns.forEach(btn => btn.classList.remove('active'));
    customAmountDiv.style.display = 'none';
    currentAmount = 0;
    clientSecret = null;
    updateDonationTotal();
    updateSubmitButton();
    
    // Clear Stripe card element
    cardElement.clear();
    document.getElementById('card-errors').textContent = '';
}

function updateDonationTotal() {
    donationTotal.textContent = `$${currentAmount.toFixed(2)}`;
}

function updateSubmitButton() {
    const isFormValid = validateForm();
    submitBtn.disabled = !isFormValid;
}

function validateForm() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    
    return currentAmount > 0 && firstName && lastName && email && isValidEmail(email);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showError('Please fill in all required fields and select a donation amount.');
        return;
    }

    setLoading(true);

    try {
        // Create payment intent
        const paymentIntentResponse = await createPaymentIntent();
        
        if (paymentIntentResponse.error) {
            throw new Error(paymentIntentResponse.error.message);
        }

        clientSecret = paymentIntentResponse.clientSecret;

        // Confirm payment with Stripe
        const {error, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: `${document.getElementById('first-name').value} ${document.getElementById('last-name').value}`,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value || undefined,
                    address: {
                        line1: document.getElementById('address').value || undefined,
                    }
                }
            }
        });

        if (error) {
            throw new Error(error.message);
        }

        if (paymentIntent.status === 'succeeded') {
            // Confirm donation on backend
            await confirmDonation(paymentIntent.id);
        }

    } catch (error) {
        console.error('Payment error:', error);
        showError(error.message || 'An error occurred while processing your donation.');
    } finally {
        setLoading(false);
    }
}

async function createPaymentIntent() {
    const donorInfo = {
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim()
    };

    const designation = document.getElementById('designation').value;

    const response = await fetch('/api/donations/create-payment-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: currentAmount,
            donorInfo: donorInfo,
            designation: designation,
            isRecurring: false
        }),
    });

    return await response.json();
}

async function confirmDonation(paymentIntentId) {
    const donorInfo = {
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim()
    };

    const designation = document.getElementById('designation').value;

    const response = await fetch('/api/donations/confirm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            paymentIntentId: paymentIntentId,
            donorInfo: donorInfo,
            amount: currentAmount,
            designation: designation
        }),
    });

    const result = await response.json();

    if (result.success) {
        showSuccessModal(result.donationId);
    } else {
        throw new Error(result.error?.message || 'Failed to confirm donation');
    }
}

function showSuccessModal(donationId) {
    donationModal.style.display = 'none';
    successModal.style.display = 'flex';
    
    document.getElementById('success-donation-id').textContent = `#LMPCA-${donationId}`;
    document.getElementById('success-amount').textContent = `$${currentAmount.toFixed(2)}`;
    document.getElementById('success-designation').textContent = document.getElementById('designation').value;
}

function setLoading(loading) {
    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'block';
    } else {
        updateSubmitButton();
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

function showError(message) {
    // Create or update error message element
    let errorElement = document.querySelector('.donation-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'donation-error';
        errorElement.style.cssText = `
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #b91c1c;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.9rem;
        `;
        donationForm.insertBefore(errorElement, donationForm.firstChild);
    }
    
    errorElement.textContent = message;
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Global function for closing success modal (called from HTML)
window.closeSuccessModal = closeSuccessModal;

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDonationModal();
    }
});

console.log('Donation system initialized successfully!');