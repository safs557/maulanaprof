// Global variables
let currentLanguage = 'english';
let videoFiles = [];
let filteredVideos = [];
let currentFilter = 'all';
let paystackLoaded = false;
let paymentLoading = false;
let currentVideoModal = null;

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
        videos_title: "Video Collection",
        search_placeholder: "Search videos by title...",
        loading_text: "Loading...",
        loading_videos: "Loading videos...",
        filter_all: "All Videos",
        filter_youtube: "YouTube",
        filter_local: "Local Videos",
        watch_btn: "Watch",
        close_video: "Close",
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
        no_videos_found: "No videos found matching your search.",
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
        videos_title: "مجموعة الفيديوهات",
        search_placeholder: "البحث في الفيديوهات بالعنوان...",
        loading_text: "جاري التحميل...",
        loading_videos: "جاري تحميل الفيديوهات...",
        filter_all: "جميع الفيديوهات",
        filter_youtube: "يوتيوب",
        filter_local: "فيديوهات محلية",
        watch_btn: "مشاهدة",
        close_video: "إغلاق",
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
        no_videos_found: "لم يتم العثور على فيديوهات تطابق بحثك.",
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
    loadVideos();
    
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
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
    
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

// Load videos from API
async function loadVideos() {
    try {
        const response = await fetch('/api/videos');
        if (response.ok) {
            const data = await response.json();
            videoFiles = data.sort((a, b) => {
                const titleA = currentLanguage === 'arabic' ? a.title_arabic : a.title_english;
                const titleB = currentLanguage === 'arabic' ? b.title_arabic : b.title_english;
                return titleA.localeCompare(titleB, currentLanguage === 'arabic' ? 'ar' : 'en');
            });
            filteredVideos = [...videoFiles];
            displayVideos();
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showNoVideos();
    } finally {
        hideLoadingSpinner();
    }
}

// Display videos in grid
function displayVideos() {
    const videosGrid = document.getElementById('videos-grid');
    const noVideos = document.getElementById('no-videos');
    
    if (filteredVideos.length === 0) {
        showNoVideos();
        return;
    }
    
    noVideos.classList.add('d-none');
    videosGrid.innerHTML = '';
    
    filteredVideos.forEach(video => {
        const videoCard = createVideoCard(video);
        videosGrid.appendChild(videoCard);
    });
}

// Create video card element
function createVideoCard(video) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    const title = currentLanguage === 'arabic' ? video.title_arabic : video.title_english;
    const description = currentLanguage === 'arabic' ? video.description_arabic : video.description_english;
    const t = translations[currentLanguage];
    
    // Determine video type and thumbnail
    const isYouTube = video.youtube_url && video.youtube_url.trim();
    const videoType = isYouTube ? 'youtube' : 'local';
    const thumbnail = video.thumbnail || (isYouTube ? getYouTubeThumbnail(video.youtube_url) : '/placeholder-video.jpg');
    
    // Format duration
    const duration = video.duration ? formatDuration(video.duration) : '';
    
    col.innerHTML = `
        <div class="card h-100 shadow-sm video-card" data-type="${videoType}">
            <div class="position-relative">
                <img src="${thumbnail}" alt="${title}" class="card-img-top video-thumbnail" style="height: 200px; object-fit: cover;">
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge ${isYouTube ? 'bg-danger' : 'bg-primary'}">
                        <i data-lucide="${isYouTube ? 'youtube' : 'video'}" class="me-1" style="width: 12px; height: 12px;"></i>
                        ${isYouTube ? 'YouTube' : 'Local'}
                    </span>
                </div>
                ${duration ? `<div class="position-absolute bottom-0 end-0 m-2">
                    <span class="badge bg-dark bg-opacity-75">${duration}</span>
                </div>` : ''}
                <div class="position-absolute top-50 start-50 translate-middle">
                    <div class="btn btn-light btn-lg rounded-circle shadow" style="width: 60px; height: 60px;">
                        <i data-lucide="play" class="text-primary"></i>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title mb-2 ${currentLanguage === 'arabic' ? 'arabic' : ''}">${title}</h5>
                <p class="card-text text-muted small mb-3 ${currentLanguage === 'arabic' ? 'arabic' : ''}">${description || ''}</p>
                <button class="btn btn-primary w-100" onclick="playVideo(${video.id}, '${title}', '${description || ''}', '${video.youtube_url || ''}', '${video.video_file || ''}')">
                    <i data-lucide="play" class="me-2"></i>
                    ${t.watch_btn}
                </button>
            </div>
        </div>
    `;
    
    return col;
}

// Get YouTube thumbnail URL
function getYouTubeThumbnail(url) {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/placeholder-video.jpg';
}

// Extract YouTube video ID from URL
function extractYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Format duration from seconds to MM:SS
function formatDuration(seconds) {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Show no videos message
function showNoVideos() {
    document.getElementById('no-videos').classList.remove('d-none');
    document.getElementById('videos-grid').innerHTML = '';
}

// Hide loading spinner
function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    applyFilters(searchTerm, currentFilter);
}

// Handle filter buttons
function handleFilter(event) {
    const filterType = event.currentTarget.dataset.filter;
    currentFilter = filterType;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    applyFilters(searchTerm, filterType);
}

// Apply search and filter
function applyFilters(searchTerm, filterType) {
    let filtered = [...videoFiles];
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(video => {
            const title = currentLanguage === 'arabic' ? video.title_arabic : video.title_english;
            const description = currentLanguage === 'arabic' ? video.description_arabic : video.description_english;
            return title.toLowerCase().includes(searchTerm) || 
                   (description && description.toLowerCase().includes(searchTerm));
        });
    }
    
    // Apply type filter
    if (filterType !== 'all') {
        filtered = filtered.filter(video => {
            if (filterType === 'youtube') {
                return video.youtube_url && video.youtube_url.trim();
            } else if (filterType === 'local') {
                return video.video_file && video.video_file.trim();
            }
            return true;
        });
    }
    
    filteredVideos = filtered;
    displayVideos();
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
    
    // Re-sort and display videos
    if (videoFiles.length > 0) {
        videoFiles.sort((a, b) => {
            const titleA = currentLanguage === 'arabic' ? a.title_arabic : a.title_english;
            const titleB = currentLanguage === 'arabic' ? b.title_arabic : b.title_english;
            return titleA.localeCompare(titleB, currentLanguage === 'arabic' ? 'ar' : 'en');
        });
        
        const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
        applyFilters(searchTerm, currentFilter);
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
        'videos-title': t.videos_title,
        'loading-text': t.loading_text,
        'loading-videos-text': t.loading_videos,
        'filter-all-text': t.filter_all,
        'filter-youtube-text': t.filter_youtube,
        'filter-local-text': t.filter_local,
        'no-videos-text': t.no_videos_found,
        'close-video-text': t.close_video,
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
        'site-title', 'videos-title', 'search-input', 'donation-modal-title', 
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

// Play video in modal
function playVideo(videoId, title, description, youtubeUrl, videoFile) {
    const modal = new bootstrap.Modal(document.getElementById('videoModal'));
    const videoContainer = document.getElementById('video-container');
    const modalTitle = document.getElementById('video-modal-title');
    const modalDescription = document.getElementById('video-modal-description');
    
    // Set title and description
    modalTitle.textContent = title;
    modalDescription.textContent = description || '';
    
    // Clear previous video
    videoContainer.innerHTML = '';
    
    if (youtubeUrl && youtubeUrl.trim()) {
        // YouTube video
        const videoId = extractYouTubeVideoId(youtubeUrl);
        if (videoId) {
            videoContainer.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    class="w-100 h-100">
                </iframe>
            `;
        }
    } else if (videoFile && videoFile.trim()) {
        // Local video file
        videoContainer.innerHTML = `
            <video 
                controls 
                autoplay 
                class="w-100 h-100"
                style="background: #000;">
                <source src="/uploads/videos/${videoFile}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    }
    
    currentVideoModal = modal;
    modal.show();
}

// Close video modal and stop playback
function closeVideoModal() {
    const videoContainer = document.getElementById('video-container');
    videoContainer.innerHTML = '';
    currentVideoModal = null;
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
