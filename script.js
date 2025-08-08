// Global variables
let currentLanguage = 'english';
let books = [];
let filteredBooks = [];
let showFullAbout = false;
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
        about_title: "About Prof. Ibrahim Ahmad Maqari",
        about_preview: "Professor Sheikh Ibrahim Ahmad Maqari is a globally respected Islamic scholar, seasoned academic, and passionate educator, known for his outstanding contributions to the study and dissemination of Islamic knowledge, Arabic linguistics, and community development in Nigeria and beyond.",
        about_full: "Born on September 15, 1976, in Zaria, Kaduna State, Nigeria, Professor Maqari hails from a noble Kanuri family with a strong tradition of Islamic scholarship. He memorized the Holy Qur'an at a young age, completing it during his primary school years in Katsina State. His early Islamic and Arabic studies were shaped at the Jama'atu Institute for Arabic Studies in Zaria.\n\nDriven by a quest for excellence in Islamic and Arabic education, he pursued higher studies at the prestigious Al-Azhar University in Cairo, Egypt, where he obtained his first degree in Arabic Language and Literature in 1999. Upon his return to Nigeria, Professor Maqari continued his academic journey, earning a Master's degree from Ahmadu Bello University, Zaria in 2005, and later a Ph.D. in Arabic and Linguistics from Bayero University, Kano in 2009.\n\nProfessor Maqari began his teaching career in 1999 at Ahmadu Bello University. Over the years, he has served as a lecturer at various institutions, including the Federal College of Education, Zaria, and Kaduna State University. In 2010, he joined Bayero University, Kano, where he rose through the ranks to become a Professor of Arabic and Linguistics in 2017.\n\nHe is a prolific scholar, authoring over 30 books and publishing numerous academic articles, many of which are used by students and researchers in universities across Nigeria and abroad. His works cover a broad range of Islamic and linguistic topics, including Qur'anic exegesis, Arabic grammar, jurisprudence, dream interpretation, and the refutation of religious innovations (bid'ah).\n\nIn 2012, he was appointed the Deputy Chief Imam of the Abuja National Mosque, a position through which he has contributed significantly to religious guidance, unity, and intellectual discourse among Muslims in Nigeria. Through his sermons, lectures, and writings, he has championed the values of Islamic moderation, scholarship, and unity among Muslims.\n\nProfessor Maqari is the founder and chairman of several key institutions, including Tazkiyyah Educational Resource Centre, Abuja; Tazkiyyah Group of Schools (with over 30 Islamic and Qur'anic schools across Nigeria); Falah Group of Schools; Vertex University Project; and Tazkiyyah Orphans and Vulnerable Children Initiative. These institutions reflect his commitment to education, youth empowerment, and social welfare.",
        books_title: "Books Collection",
        search_placeholder: "Search books by title or author...",
        loading_text: "Loading...",
        loading_books: "Loading books...",
        read_btn: "Read",
        download_btn: "Download",
        read_more: "Read More",
        read_less: "Read Less",
        contact_title: "Contact Us",
        contact_subtitle: "We value your feedback, suggestions, and appreciation. Get in touch with us",
        contact_form_title: "Send a Message",
        name_label: "Name *",
        email_label: "Email *",
        phone_label: "Phone",
        category_label: "Category *",
        subject_label: "Subject",
        message_label: "Message *",
        send_message: "Send Message",
        select_category: "Select category",
        complaint_option: "Complaint",
        suggestion_option: "Suggestion",
        appreciation_option: "Appreciation",
        response_times_title: "Response Times",
        complaints_time: "Complaints: Within 24 hours",
        suggestions_time: "Suggestions: Within 48 hours",
        appreciation_time: "Appreciation: Within a week",
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
        donation_subtitle: "Contribute to spreading knowledge, nurturing scholars, and empowering impactful da'wah efforts in our communities",
        paystack_loading: "Loading payment system...",
        donor_name_label: "Donor Name",
        amount_label: "Amount (₦)",
        donor_email_label: "Email (Optional)",
        donor_phone_label: "Phone (Optional)",
        cancel_text: "Cancel",
        donate_now: "Donate Now - Support Islam",
        no_books_found: "No books found matching your search.",
        hadith_knowledge: "When a person dies, their deeds end except for three: a continuing charity, beneficial knowledge, and a righteous child who prays for them. – Prophet Muhammad (PBUH)",
        processing_payment: "Processing payment...",
        payment_success: "Payment successful! Thank you for your donation.",
        payment_failed: "Payment failed. Please try again.",
        sending_message: "Sending...",
        message_sent: "Your message has been sent successfully! We will get back to you soon.",
        message_failed: "Failed to send message. Please try again.",
        network_error: "Network error. Please try again."
    },
    arabic: {
        site_title: "أ. إ. أ. مقاري",
        nav_home: "الرئيسية",
        nav_audio: "الصوتيات",
        nav_videos: "الفيديوهات",
        nav_admin: "الإدارة",
        donate_btn: "ادعم الإسلام",
        language_switch: "English",
        about_title: "عن الأستاذ إبراهيم أحمد مقاري",
        about_preview: "الأستاذ الشيخ إبراهيم أحمد مقاري عالم إسلامي محترم عالمياً وأكاديمي متمرس ومربي شغوف، معروف بمساهماته المتميزة في دراسة ونشر المعرفة الإسلامية واللسانيات العربية والتنمية المجتمعية في نيجيريا وخارجها.",
        about_full: "وُلد في 15 سبتمبر 1976 في زاريا، ولاية كادونا، نيجيريا، ينتمي الأستاذ مقاري إلى عائلة كانورية نبيلة لها تقليد قوي في المنح الدراسية الإسلامية. حفظ القرآن الكريم في سن مبكرة، وأكمله خلال سنوات دراسته الابتدائية في ولاية كاتسينا. تشكلت دراساته الإسلامية والعربية المبكرة في معهد الجماعة للدراسات العربية في زاريا.\n\nمدفوعاً بالسعي للتميز في التعليم الإسلامي والعربي، تابع دراساته العليا في جامعة الأزهر المرموقة في القاهرة، مصر، حيث حصل على درجته الأولى في اللغة العربية وآدابها عام 1999. عند عودته إلى نيجيريا، واصل الأستاذ مقاري رحلته الأكاديمية، وحصل على درجة الماجستير من جامعة أحمدو بيلو، زاريا عام 2005، وبعد ذلك الدكتوراه في اللغة العربية واللسانيات من جامعة بايرو، كانو عام 2009.\n\nبدأ الأستاذ مقاري مسيرته التدريسية عام 1999 في جامعة أحمدو بيلو. على مر السنين، خدم كمحاضر في مؤسسات مختلفة، بما في ذلك الكلية الفيدرالية للتربية، زاريا، وجامعة ولاية كادونا. في عام 2010، انضم إلى جامعة بايرو، كانو، حيث ترقى في الرتب ليصبح أستاذاً في اللغة العربية واللسانيات عام 2017.\n\nهو عالم غزير الإنتاج، ألف أكثر من 30 كتاباً ونشر العديد من المقالات الأكاديمية، والتي يستخدم الكثير منها الطلاب والباحثون في الجامعات في جميع أنحاء نيجيريا وخارجها. تغطي أعماله مجموعة واسعة من المواضيع الإسلامية واللغوية، بما في ذلك تفسير القرآن والنحو العربي والفقه وتفسير الأحلام ودحض البدع الدينية.\n\nفي عام 2012، تم تعيينه نائب كبير أئمة المسجد الوطني في أبوجا، وهو منصب ساهم من خلاله بشكل كبير في التوجيه الديني والوحدة والخطاب الفكري بين المسلمين في نيجيريا. من خلال خطبه ومحاضراته وكتاباته، دافع عن قيم الاعتدال الإسلامي والمنح الدراسية والوحدة بين المسلمين.\n\nالأستاذ مقاري هو مؤسس ورئيس عدة مؤسسات رئيسية، بما في ذلك مركز التزكية للموارد التعليمية، أبوجا؛ مجموعة مدارس التزكية (مع أكثر من 30 مدرسة إسلامية وقرآنية في جميع أنحاء نيجيريا)؛ مجموعة مدارس الفلاح؛ مشروع جامعة فيرتكس؛ ومبادرة التزكية للأيتام والأطفال المعرضين للخطر. تعكس هذه المؤسسات التزامه بالتعليم وتمكين الشباب والرعاية الاجتماعية.",
        books_title: "مجموعة الكتب",
        search_placeholder: "البحث في الكتب بالعنوان أو المؤلف...",
        loading_text: "جاري التحميل...",
        loading_books: "جاري تحميل الكتب...",
        read_btn: "اقرأ",
        download_btn: "تحميل",
        read_more: "اقرأ المزيد",
        read_less: "اقرأ أقل",
        contact_title: "تواصل معنا",
        contact_subtitle: "نحن نقدر ملاحظاتكم واقتراحاتكم وتقديركم. تواصلوا معنا",
        contact_form_title: "أرسل رسالة",
        name_label: "الاسم *",
        email_label: "البريد الإلكتروني *",
        phone_label: "رقم الهاتف",
        category_label: "الفئة *",
        subject_label: "الموضوع",
        message_label: "الرسالة *",
        send_message: "إرسال الرسالة",
        select_category: "اختر الفئة",
        complaint_option: "شكوى",
        suggestion_option: "اقتراح",
        appreciation_option: "تقدير",
        response_times_title: "أوقات الاستجابة",
        complaints_time: "الشكاوى: خلال 24 ساعة",
        suggestions_time: "الاقتراحات: خلال 48 ساعة",
        appreciation_time: "التقدير: خلال أسبوع",
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
        donation_subtitle: "ساهم في نشر المعرفة، وتربية العلماء، وتعزيز الجهود الدعوية المؤثرة في مجتمعاتنا",
        paystack_loading: "جاري تحميل نظام الدفع...",
        donor_name_label: "اسم المتبرع",
        amount_label: "المبلغ (₦)",
        donor_email_label: "البريد الإلكتروني (اختياري)",
        donor_phone_label: "رقم الهاتف (اختياري)",
        cancel_text: "إلغاء",
        donate_now: "تبرع الآن - ادعم الإسلام",
        no_books_found: "لم يتم العثور على كتب تطابق بحثك.",
        hadith_knowledge: "إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية، أو علم يُنتفع به، أو ولد صالح يدعو له – النبي محمد ﷺ",
        processing_payment: "جاري معالجة الدفع...",
        payment_success: "تم الدفع بنجاح! شكراً لك على تبرعك.",
        payment_failed: "فشل الدفع. يرجى المحاولة مرة أخرى.",
        sending_message: "جاري الإرسال...",
        message_sent: "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً",
        message_failed: "حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى",
        network_error: "حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى"
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadPaystackScript();
    setupEventListeners();
    loadBooks();
    
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
    
    // Contact form
    document.getElementById('contact-form').addEventListener('submit', handleContactForm);
    
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

// Load books from API
async function loadBooks() {
    try {
        const response = await fetch('/api/books');
        if (response.ok) {
            const data = await response.json();
            books = data.sort((a, b) => {
                const titleA = currentLanguage === 'arabic' ? a.title_arabic : a.title_english;
                const titleB = currentLanguage === 'arabic' ? b.title_arabic : b.title_english;
                return titleA.localeCompare(titleB, currentLanguage === 'arabic' ? 'ar' : 'en');
            });
            filteredBooks = [...books];
            displayBooks();
        }
    } catch (error) {
        console.error('Error loading books:', error);
        showNoBooks();
    } finally {
        hideLoadingSpinner();
    }
}

// Display books in grid
function displayBooks() {
    const booksGrid = document.getElementById('books-grid');
    const noBooks = document.getElementById('no-books');
    
    if (filteredBooks.length === 0) {
        showNoBooks();
        return;
    }
    
    noBooks.classList.add('d-none');
    booksGrid.innerHTML = '';
    
    filteredBooks.forEach(book => {
        const bookCard = createBookCard(book);
        booksGrid.appendChild(bookCard);
    });
}

// Create book card element
function createBookCard(book) {
    const col = document.createElement('div');
    col.className = 'col-6 col-sm-4 col-lg-3 col-xl-2';
    
    const title = currentLanguage === 'arabic' ? book.title_arabic : book.title_english;
    const t = translations[currentLanguage];
    
    col.innerHTML = `
        <div class="card book-card h-100 shadow-sm">
            <div class="position-relative" style="aspect-ratio: 4/3;">
                <img src="${book.cover_image ? `/uploads/covers/${book.cover_image}` : `https://via.placeholder.com/300x400/0d6efd/ffffff?text=${encodeURIComponent(title)}`}" 
                     alt="${title}" 
                     class="card-img-top book-cover h-100 w-100">
            </div>
            <div class="card-body p-2">
                <h6 class="card-title book-title small fw-semibold mb-2 ${currentLanguage === 'arabic' ? 'arabic' : ''}">${title}</h6>
                <div class="d-grid gap-1">
                    <button class="btn btn-primary btn-sm" onclick="readBook('${book.pdf_file}')">
                        <i data-lucide="eye" class="me-1" style="width: 12px; height: 12px;"></i>
                        ${t.read_btn}
                    </button>
                    <button class="btn btn-success btn-sm" onclick="downloadBook('${book.pdf_file}')">
                        <i data-lucide="download" class="me-1" style="width: 12px; height: 12px;"></i>
                        ${t.download_btn}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Show no books message
function showNoBooks() {
    document.getElementById('no-books').classList.remove('d-none');
    document.getElementById('books-grid').innerHTML = '';
}

// Hide loading spinner
function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredBooks = [...books];
    } else {
        filteredBooks = books.filter(book => {
            const title = currentLanguage === 'arabic' ? book.title_arabic : book.title_english;
            return title.toLowerCase().includes(searchTerm);
        });
    }
    
    displayBooks();
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
    
    // Re-sort and display books
    if (books.length > 0) {
        books.sort((a, b) => {
            const titleA = currentLanguage === 'arabic' ? a.title_arabic : a.title_english;
            const titleB = currentLanguage === 'arabic' ? b.title_arabic : b.title_english;
            return titleA.localeCompare(titleB, currentLanguage === 'arabic' ? 'ar' : 'en');
        });
        
        const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
        if (!searchTerm) {
            filteredBooks = [...books];
        } else {
            filteredBooks = books.filter(book => {
                const title = currentLanguage === 'arabic' ? book.title_arabic : book.title_english;
                return title.toLowerCase().includes(searchTerm);
            });
        }
        displayBooks();
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
        'about-title': t.about_title,
        'about-preview': t.about_preview,
        'read-more-text': showFullAbout ? t.read_less : t.read_more,
        'books-title': t.books_title,
        'loading-text': t.loading_text,
        'loading-books-text': t.loading_books,
        'no-books-text': t.no_books_found,
        'contact-title': t.contact_title,
        'contact-subtitle': t.contact_subtitle,
        'contact-form-title': t.contact_form_title,
        'name-label': t.name_label,
        'email-label': t.email_label,
        'phone-label': t.phone_label,
        'category-label': t.category_label,
        'subject-label': t.subject_label,
        'message-label': t.message_label,
        'send-message-text': t.send_message,
        'select-category': t.select_category,
        'complaint-option': t.complaint_option,
        'suggestion-option': t.suggestion_option,
        'appreciation-option': t.appreciation_option,
        'response-times-title': t.response_times_title,
        'complaints-time': t.complaints_time,
        'suggestions-time': t.suggestions_time,
        'appreciation-time': t.appreciation_time,
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
        'hadith-quote': t.hadith_knowledge,
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
    
    // Update about full content
    const aboutFullContent = document.getElementById('about-full-content');
    if (aboutFullContent) {
        aboutFullContent.innerHTML = '';
        t.about_full.split('\n\n').forEach(paragraph => {
            const p = document.createElement('p');
            p.textContent = paragraph;
            p.className = 'text-justify mb-3';
            aboutFullContent.appendChild(p);
        });
    }
    
    // Add Arabic class where needed
    const elementsToStyle = [
        'site-title', 'about-title', 'about-preview', 'books-title', 
        'search-input', 'contact-title', 'contact-subtitle', 'contact-form-title',
        'response-times-title', 'donation-modal-title', 'donation-modal-subtitle',
        'hadith-quote', 'footer-contact-title', 'footer-quick-links', 'footer-support-title'
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
        'name-input': currentLanguage === 'arabic' ? 'اسمك الكامل' : 'Your full name',
        'email-input': currentLanguage === 'arabic' ? 'بريدك الإلكتروني' : 'your.email@example.com',
        'phone-input': currentLanguage === 'arabic' ? 'رقم هاتفك' : 'Your phone number',
        'subject-input': currentLanguage === 'arabic' ? 'موضوع الرسالة' : 'Message subject',
        'message-textarea': currentLanguage === 'arabic' ? 'اكتب رسالتك هنا...' : 'Write your message here...',
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
        'search-input', 'name-input', 'email-input', 'phone-input', 
        'subject-input', 'message-textarea', 'donor-name-input', 'amount-input',
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

// Toggle about section
function toggleAbout() {
    const aboutFull = document.getElementById('about-full');
    const t = translations[currentLanguage];
    
    showFullAbout = !showFullAbout;
    
    if (showFullAbout) {
        aboutFull.classList.add('show');
        document.getElementById('read-more-text').textContent = t.read_less;
    } else {
        aboutFull.classList.remove('show');
        document.getElementById('read-more-text').textContent = t.read_more;
    }
}

// Read book
function readBook(pdfFile) {
    window.open(`/uploads/pdfs/${pdfFile}`, '_blank');
}

// Download book
function downloadBook(pdfFile) {
    const link = document.createElement('a');
    link.href = `/uploads/pdfs/${pdfFile}`;
    link.download = pdfFile;
    link.click();
}

// Show donation modal
function showDonationModal() {
    const modal = new bootstrap.Modal(document.getElementById('donationModal'));
    modal.show();
}

// Handle contact form submission
async function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        category: formData.get('category'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.querySelector('span').textContent;
    const t = translations[currentLanguage];
    
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = t.sending_message;
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });
        
        if (response.ok) {
            alert(t.message_sent);
            event.target.reset();
        } else {
            alert(t.message_failed);
        }
    } catch (error) {
        console.error('Contact form error:', error);
        alert(t.network_error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = originalText;
    }
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
