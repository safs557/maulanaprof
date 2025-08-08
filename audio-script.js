// Global variables
let currentLanguage = 'english';
let audioFiles = [];
let filteredAudio = [];
let currentlyPlaying = null;
let audioElements = {};
let paystackLoaded = false;
let paymentLoading = false;

// Translations object
const translations = {
    english: {
        site_title: "Prof. I. A. Maqari",
        nav_home: "Home",
        nav_audio: "Audio",
        nav_videos: "Videos",
        nav_admin: "Admin",
        donate_btn: "Support Islam",
        language_switch: "عربي",
        audio_title: "Audio Collection",
        search_placeholder: "Search audio by title...",
        loading_text: "Loading...",
        loading_audio: "Loading audio...",
        play_btn: "Play",
        pause_btn: "Pause",
        footer_contact_title: "Contact Information",
        footer_email: "📧 1440shamsusabo@gmail.com",
        footer_phone: "📞 08030909793",
        footer_location: "📍 Nigeria",
        footer_quick_links: "Quick Links",
        footer_home: "Home",
        footer_audio: "Audio",
        footer_videos: "Videos",
        footer_admin: "Admin",
        footer_support_title: "Support Our Work",
        footer_donate: "Support Islamic Education",
        footer_language: "Switch Language",
        developed_by: "Developed by",
        sponsored_by: "Sponsored by",
        donation_title: "Support Islamic Education & Da'wah",
        donation_subtitle: "Help us spread Islamic knowledge and support Prof. Maqari's educational mission",
        paystack_loading: "Loading payment system...",
        donor_name_label: "Donor Name",
        amount_label: "Amount (₦)",
        donor_email_label: "Email (Optional)",
        donor_phone_label: "Phone (Optional)",
        cancel_text: "Cancel",
        donate_now: "Donate Now - Support Islam",
        no_audio_found: "No audio found matching your search.",
        processing_payment: "Processing payment...",
        payment_success: "Payment successful! Thank you for your donation.",
        payment_failed: "Payment failed. Please try again."
    },
    arabic: {
        site_title: "أ. إ. أ. مقاري",
        nav_home: "الرئيسية",
        nav_audio: "الصوتيات",
        nav_videos: "الفيديوهات",
        nav_admin: "الإدارة",
        donate_btn: "ادعم الإسلام",
        language_switch: "English",
        audio_title: "مجموعة الصوتيات",
        search_placeholder: "البحث في الصوتيات بالعنوان...",
        loading_text: "جاري التحميل...",
        loading_audio: "جاري تحميل الصوتيات...",
        play_btn: "تشغيل",
        pause_btn: "إيقاف",
        footer_contact_title: "معلومات الاتصال",
        footer_email: "📧 1440shamsusabo@gmail.com",
        footer_phone: "📞 08030909793",
        footer_location: "📍 نيجيريا",
        footer_quick_links: "روابط سريعة",
        footer_home: "الرئيسية",
        footer_audio: "الصوتيات",
        footer_videos: "الفيديوهات",
        footer_admin: "الإدارة",
        footer_support_title: "ادعم عملنا",
        footer_donate: "ادعم التعليم الإسلامي",
        footer_language: "تغيير اللغة",
        developed_by: "تطوير",
        sponsored_by: "برعاية",
        donation_title: "ادعم التعليم الإسلامي والدعوة",
        donation_subtitle: "ساعدنا في نشر المعرفة الإسلامية ودعم مهمة الأستاذ مقاري التعليمية",
        paystack_loading: "جاري تحميل نظام الدفع...",
        donor_name_label: "اسم المتبرع",
        amount_label: "المبلغ (₦)",
        donor_email_label: "البريد الإلكتروني (اختياري)",
        donor_phone_label: "رقم الهاتف (اختياري)",
        cancel_text: "إلغاء",
        donate_now: "تبرع الآن - ادعم الإسلام",
        no_audio_found: "لم يتم العثور على صوتيات تطابق بحثك.",
        processing_payment: "جاري معالجة الدفع...",
        payment_success: "تم الدفع بنجاح! شكراً لك على تبرعك.",
        payment_failed: "فشل الدفع. يرجى المحاولة مرة أخرى."
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadPaystackScript();
    setupEventListeners();
    loadAudio();
    
    // Initialize Lucide icons
    lucide.createIcons();
});

// Initialize application
function initializeApp() {
    // Load saved language
    const savedLanguage = localStorage.getItem('language') || 'english';
    currentLanguage = savedLanguage;
    updateLanguage();
    
    // Setup scroll listener for back to top button
    window.addEventListener('scroll', handleScroll);
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('search-input').addEventListener('input', handleSearch);
    
    // Back to top button
    document.getElementById('back-to-top').addEventListener('click', scrollToTop);
}

// Load Paystack script
function loadPaystackScript() {
    if (window.PaystackPop) {
        paystackLoaded = true;
        hidePaystackLoading();
        return;
    }
    
    setTimeout(() => {
        if (window.PaystackPop) {
            paystackLoaded = true;
            hidePaystackLoading();
        }
    }, 2000);
}

// Hide Paystack loading indicator
function hidePaystackLoading() {
    const loadingElement = document.getElementById('paystack-loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// Load audio from API
async function loadAudio() {
    try {
        const response = await fetch('/api/audio');
        if (response.ok) {
            const data = await response.json();
            audioFiles = data.sort((a, b) => {
                const titleA = currentLanguage === 'arabic' ? a.title_arabic : a.title_english;
                const titleB = currentLanguage === 'arabic' ? b.title_arabic : b.title_english;
                return titleA.localeCompare(titleB, currentLanguage === 'arabic' ? 'ar' : 'en');
            });
            filteredAudio = [...audioFiles];
            displayAudio();
        }
    } catch (error) {
        console.error('Error loading audio:', error);
        showNoAudio();
    } finally {
        hideLoadingSpinner();
    }
}

// Display audio in grid
function displayAudio() {
    const audioGrid = document.getElementById('audio-grid');
    const noAudio = document.getElementById('no-audio');
    
    if (filteredAudio.length === 0) {
        showNoAudio();
        return;
    }
    
    noAudio.classList.add('d-none');
    audioGrid.innerHTML = '';
    
    filteredAudio.forEach(audio => {
        const audioCard = createAudioCard(audio);
        audioGrid.appendChild(audioCard);
    });
}

// Create audio card element
function createAudioCard(audio) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    const title = currentLanguage === 'arabic' ? audio.title_arabic : audio.title_english;
    const description = currentLanguage === 'arabic' ? audio.description_arabic : audio.description_english;
    const t = translations[currentLanguage];
    
    const isPlaying = currentlyPlaying === audio.id;
    const buttonClass = isPlaying ? 'btn-danger' : 'btn-success';
    const buttonText = isPlaying ? t.pause_btn : t.play_btn;
    const buttonIcon = isPlaying ? 'pause' : 'play';
    
    col.innerHTML = `
        <div class="card h-100 shadow-sm audio-card">
            <div class="card-body text-center">
                <div class="mb-3">
                    <i data-lucide="volume-2" class="text-success" style="width: 64px; height: 64px;"></i>
                </div>
                <h5 class="card-title mb-3 ${currentLanguage === 'arabic' ? 'arabic' : ''}">${title}</h5>
                <p class="card-text text-muted small mb-4 ${currentLanguage === 'arabic' ? 'arabic' : ''}">${description || ''}</p>
                <button class="btn ${buttonClass} w-100" onclick="toggleAudio(${audio.id}, '${audio.audio_file}')">
                    <i data-lucide="${buttonIcon}" class="me-2"></i>
                    ${buttonText}
                </button>
            </div>
        </div>
    `;
    
    return col;
}

// Show no audio message
function showNoAudio() {
    document.getElementById('no-audio').classList.remove('d-none');
    document.getElementById('audio-grid').innerHTML = '';
}

// Hide loading spinner
function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredAudio = [...audioFiles];
    } else {
        filteredAudio = audioFiles.filter(audio => {
            const title = currentLanguage === 'arabic' ? audio.title_arabic : audio.title_english;
            const description = currentLanguage === 'arabic' ? audio.description_arabic : audio.description_english;
            return title.toLowerCase().includes(searchTerm) || 
                   (description && description.toLowerCase().includes(searchTerm));
        });
    }
    
    displayAudio();
}

// Handle scroll for back to top button
function handleScroll() {
    const backToTop = document.getElementById('back-to-top');
    if (window.pageYOffset > 300) {
        backToTop.classList.remove('d-none');
    } else {
        backToTop.classList.add('d-none');
    }
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toggle language
function toggleLanguage() {
    currentLanguage = currentLanguage === 'english' ? 'arabic' : 'english';
    localStorage.setItem('language', currentLanguage);
    updateLanguage();
    
    // Re-sort and display audio
    if (audioFiles.length > 0) {
        audioFiles.sort((a, b) => {
            const titleA = currentLanguage === 'arabic' ? a.title_arabic : a.title_english;
            const titleB = currentLanguage === 'arabic' ? b.title_arabic : b.title_english;
            return titleA.localeCompare(titleB, currentLanguage === 'arabic' ? 'ar' : 'en');
        });
        
        const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
        if (!searchTerm) {
            filteredAudio = [...audioFiles];
        } else {
            filteredAudio = audioFiles.filter(audio => {
                const title = currentLanguage === 'arabic' ? audio.title_arabic : audio.title_english;
                const description = currentLanguage === 'arabic' ? audio.description_arabic : audio.description_english;
                return title.toLowerCase().includes(searchTerm) || 
                       (description && description.toLowerCase().includes(searchTerm));
            });
        }
        displayAudio();
    }
}

// Update language in UI
function updateLanguage() {
    const t = translations[currentLanguage];
    
    // Update HTML attributes
    document.documentElement.dir = currentLanguage === 'arabic' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage === 'arabic' ? 'ar' : 'en';
    
    // Update all text content
    const textElements = {
        'site-title': t.site_title,
        'nav-home': t.nav_home,
        'nav-audio': t.nav_audio,
        'nav-videos': t.nav_videos,
        'nav-admin-text': t.nav_admin,
        'donate-btn-text': t.donate_btn,
        'language-btn-text': t.language_switch,
        'audio-title': t.audio_title,
        'loading-text': t.loading_text,
        'loading-audio-text': t.loading_audio,
        'no-audio-text': t.no_audio_found,
        'footer-contact-title': t.footer_contact_title,
        'footer-email': t.footer_email,
        'footer-phone': t.footer_phone,
        'footer-location': t.footer_location,
        'footer-quick-links': t.footer_quick_links,
        'footer-home': t.footer_home,
        'footer-audio': t.footer_audio,
        'footer-videos': t.footer_videos,
        'footer-admin': t.footer_admin,
        'footer-support-title': t.footer_support_title,
        'footer-donate-text': t.footer_donate,
        'footer-language-text': t.footer_language,
        'developed-by-text': t.developed_by,
        'sponsored-by-text': t.sponsored_by,
        'donation-modal-title': t.donation_title,
        'donation-modal-subtitle': t.donation_subtitle,
        'paystack-loading-text': t.paystack_loading,
        'donor-name-label': t.donor_name_label,
        'amount-label': t.amount_label,
        'donor-email-label': t.donor_email_label,
        'donor-phone-label': t.donor_phone_label,
        'donation-message': t.donation_subtitle,
        'cancel-text': t.cancel_text,
        'donate-now-text': paymentLoading ? t.processing_payment : t.donate_now
    };
    
    // Update all text elements
    Object.entries(textElements).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    });
    
    // Update placeholders
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.placeholder = t.search_placeholder;
    }
    
    // Update form placeholders
    updateFormPlaceholders(t);
    
    // Add Arabic class where needed
    const elementsToStyle = [
        'site-title', 'audio-title', 'search-input', 'donation-modal-title', 
        'donation-modal-subtitle', 'donation-message', 'footer-contact-title', 
        'footer-quick-links', 'footer-support-title'
    ];
    
    elementsToStyle.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (currentLanguage === 'arabic') {
                element.classList.add('arabic');
            } else {
                element.classList.remove('arabic');
            }
        }
    });
    
    // Update form inputs direction
    updateFormInputsDirection();
    
    // Reinitialize Lucide icons
    lucide.createIcons();
}

// Update form placeholders
function updateFormPlaceholders(t) {
    const placeholders = {
        'donor-name-input': currentLanguage === 'arabic' ? 'أدخل اسمك' : 'Enter your name',
        'amount-input': currentLanguage === 'arabic' ? 'أدخل المبلغ (الحد الأدنى ₦100)' : 'Enter amount (minimum ₦100)'
    };
    
    Object.entries(placeholders).forEach(([id, placeholder]) => {
        const element = document.getElementById(id);
        if (element) {
            element.placeholder = placeholder;
        }
    });
}

// Update form inputs direction
function updateFormInputsDirection() {
    const formInputs = [
        'search-input', 'donor-name-input', 'amount-input',
        'donor-email-input', 'donor-phone-input'
    ];
    
    formInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (currentLanguage === 'arabic') {
                element.classList.add('text-end');
                element.dir = 'rtl';
            } else {
                element.classList.remove('text-end');
                element.dir = 'ltr';
            }
        }
    });
}

// Toggle audio playback
function toggleAudio(audioId, audioFile) {
    // Stop currently playing audio
    if (currentlyPlaying && currentlyPlaying !== audioId) {
        const currentAudio = audioElements[currentlyPlaying];
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
    }
    
    // Toggle the selected audio
    if (currentlyPlaying === audioId) {
        const audioElement = audioElements[audioId];
        if (audioElement) {
            audioElement.pause();
            setCurrentlyPlaying(null);
        }
    } else {
        let audioElement = audioElements[audioId];
        if (!audioElement) {
            audioElement = new Audio(`/uploads/audio/${audioFile}`);
            audioElement.addEventListener('ended', () => {
                setCurrentlyPlaying(null);
            });
            audioElement.addEventListener('error', (e) => {
                console.error('Audio playback error:', e);
                alert('Error playing audio file. Please try again.');
                setCurrentlyPlaying(null);
            });
            audioElements[audioId] = audioElement;
        }
        
        audioElement.play().then(() => {
            setCurrentlyPlaying(audioId);
        }).catch((error) => {
            console.error('Audio play error:', error);
            alert('Error playing audio file. Please try again.');
        });
    }
}

// Set currently playing audio and update UI
function setCurrentlyPlaying(audioId) {
    currentlyPlaying = audioId;
    displayAudio(); // Refresh the display to update button states
}

// Show donation modal
function showDonationModal() {
    const modal = new bootstrap.Modal(document.getElementById('donationModal'));
    modal.show();
}

// Handle donation
async function handleDonation() {
    const form = document.getElementById('donation-form');
    const formData = new FormData(form);
    
    const amount = formData.get('amount');
    const emailInput = formData.get('email');
    const email = emailInput && emailInput.trim() ? emailInput.trim() : '1440shamsusabo@gmail.com';
    const phone = formData.get('phone') || '08030909793';
    const donorName = formData.get('donorName') || 'Anonymous';
    
    const t = translations[currentLanguage];
    
    // Validation
    if (!amount || parseInt(amount) < 100) {
        alert(currentLanguage === 'arabic' ? 'يرجى إدخال مبلغ صحيح (الحد الأدنى ₦100)' : 'Please enter a valid amount (minimum ₦100)');
        return;
    }
    
    if (!paystackLoaded || !window.PaystackPop) {
        alert(currentLanguage === 'arabic' ? 'نظام الدفع غير جاهز. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.' : 'Payment system is not ready. Please check your internet connection and try again.');
        return;
    }
    
    paymentLoading = true;
    document.getElementById('donate-now-text').textContent = t.processing_payment;
    document.getElementById('donate-now-btn').disabled = true;
    
    try {
        const reference = `maqari_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const paystackConfig = {
            key: "pk_live_e6942e61f70c87019cbeb64ffed04e10fbd2ee10",
            email: email,
            amount: parseInt(amount) * 100,
            currency: 'NGN',
            ref: reference,
            metadata: {
                donor_name: donorName,
                phone: phone,
            },
            callback: function(response) {
                paymentLoading = false;
                document.getElementById('donate-now-btn').disabled = false;
                document.getElementById('donate-now-text').textContent = t.donate_now;
                
                if (response.status === 'success') {
                    fetch('/api/donations/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            reference: response.reference,
                            amount: parseInt(amount),
                            donor_name: donorName,
                            email,
                            phone,
                            type: 'income',
                            description: 'Donation received via Paystack',
                        }),
                    })
                    .then(async (verifyResponse) => {
                        if (verifyResponse.ok) {
                            alert(t.payment_success);
                            bootstrap.Modal.getInstance(document.getElementById('donationModal')).hide();
                            form.reset();
                        } else {
                            alert('Payment successful but verification failed. Please contact support with reference: ' + response.reference);
                        }
                    })
                    .catch((error) => {
                        console.error('Payment verification error:', error);
                        alert('Payment successful but verification failed. Please contact support with reference: ' + response.reference);
                    });
                } else {
                    alert(t.payment_failed);
                }
            },
            onClose: function() {
                paymentLoading = false;
                document.getElementById('donate-now-btn').disabled = false;
                document.getElementById('donate-now-text').textContent = t.donate_now;
            }
        };
        
        const handler = window.PaystackPop.setup(paystackConfig);
        handler.openIframe();
        
    } catch (error) {
        paymentLoading = false;
        document.getElementById('donate-now-btn').disabled = false;
        document.getElementById('donate-now-text').textContent = t.donate_now;
        console.error('Payment initialization error:', error);
        alert(currentLanguage === 'arabic' ? 'فشل في تهيئة الدفع. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.' : 'Failed to initialize payment. Please try again or contact support.');
    }
}
