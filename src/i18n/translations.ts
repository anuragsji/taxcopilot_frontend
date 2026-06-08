export type Language = 'en' | 'hi' | 'bn' | 'pa' | 'ur' | 'mr';

export interface Translations {
  // Authentication
  auth: {
    welcomeBack: string;
    signIn: string;
    signUp: string;
    email: string;
    password: string;
    phoneNumber: string;
    otp: string;
    getOTP: string;
    verifyOTP: string;
    logout: string;
    firstName: string;
    lastName: string;
    register: string;
  };
  // Dashboard
  dashboard: {
    welcome: string;
    taxSummary: string;
    filingStatus: string;
    refundTracker: string;
    uploadDocuments: string;
    startFiling: string;
    viewReturns: string;
  };
  // Tax Engine
  tax: {
    oldRegime: string;
    newRegime: string;
    taxableIncome: string;
    totalTax: string;
    refund: string;
    taxPayable: string;
    chooseRegime: string;
    saveTax: string;
  };
  // Documents
  docs: {
    uploadTitle: string;
    dragDrop: string;
    selectFile: string;
    form16: string;
    ais: string;
    form26AS: string;
    salarySlips: string;
  };
  // General
  general: {
    save: string;
    cancel: string;
    next: string;
    previous: string;
    submit: string;
    loading: string;
    error: string;
    success: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    auth: {
      welcomeBack: 'Welcome Back',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email Address',
      password: 'Password',
      phoneNumber: 'Phone Number',
      otp: 'OTP',
      getOTP: 'Get OTP',
      verifyOTP: 'Verify OTP',
      logout: 'Logout',
      firstName: 'First Name',
      lastName: 'Last Name',
      register: 'Register',
    },
    dashboard: {
      welcome: 'Welcome',
      taxSummary: 'Tax Summary',
      filingStatus: 'Filing Status',
      refundTracker: 'Refund Tracker',
      uploadDocuments: 'Upload Documents',
      startFiling: 'Start Filing',
      viewReturns: 'View Returns',
    },
    tax: {
      oldRegime: 'Old Regime',
      newRegime: 'New Regime',
      taxableIncome: 'Taxable Income',
      totalTax: 'Total Tax',
      refund: 'Refund',
      taxPayable: 'Tax Payable',
      chooseRegime: 'Choose Tax Regime',
      saveTax: 'Save on Tax',
    },
    docs: {
      uploadTitle: 'Upload Tax Documents',
      dragDrop: 'Drag and drop files here',
      selectFile: 'Select File',
      form16: 'Form 16',
      ais: 'AIS',
      form26AS: 'Form 26AS',
      salarySlips: 'Salary Slips',
    },
    general: {
      save: 'Save',
      cancel: 'Cancel',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
  },
  hi: {
    auth: {
      welcomeBack: 'स्वागत है',
      signIn: 'साइन इन करें',
      signUp: 'साइन अप करें',
      email: 'ईमेल पता',
      password: 'पासवर्ड',
      phoneNumber: 'फ़ोन नंबर',
      otp: 'ओटीपी',
      getOTP: 'ओटीपी प्राप्त करें',
      verifyOTP: 'ओटीपी सत्यापित करें',
      logout: 'लॉग आउट',
      firstName: 'पहला नाम',
      lastName: 'अंतिम नाम',
      register: 'पंजीकरण करें',
    },
    dashboard: {
      welcome: 'स्वागत है',
      taxSummary: 'कर सारांश',
      filingStatus: 'फाइलिंग स्थिति',
      refundTracker: 'रिफंड ट्रैकर',
      uploadDocuments: 'दस्तावेज़ अपलोड करें',
      startFiling: 'फाइलिंग शुरू करें',
      viewReturns: 'रिटर्न देखें',
    },
    tax: {
      oldRegime: 'पुरानी व्यवस्था',
      newRegime: 'नई व्यवस्था',
      taxableIncome: 'कर योग्य आय',
      totalTax: 'कुल कर',
      refund: 'रिफंड',
      taxPayable: 'देय कर',
      chooseRegime: 'कर व्यवस्था चुनें',
      saveTax: 'कर बचाएं',
    },
    docs: {
      uploadTitle: 'कर दस्तावेज़ अपलोड करें',
      dragDrop: 'फ़ाइलें यहां खींचें और छोड़ें',
      selectFile: 'फ़ाइल चुनें',
      form16: 'फॉर्म 16',
      ais: 'एआईएस',
      form26AS: 'फॉर्म 26AS',
      salarySlips: 'वेतन पर्ची',
    },
    general: {
      save: 'सहेजें',
      cancel: 'रद्द करें',
      next: 'अगला',
      previous: 'पिछला',
      submit: 'जमा करें',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
    },
  },
  bn: {
    auth: {
      welcomeBack: 'স্বাগতম',
      signIn: 'সাইন ইন করুন',
      signUp: 'সাইন আপ করুন',
      email: 'ইমেইল ঠিকানা',
      password: 'পাসওয়ার্ড',
      phoneNumber: 'ফোন নম্বর',
      otp: 'ওটিপি',
      getOTP: 'ওটিপি পান',
      verifyOTP: 'ওটিপি যাচাই করুন',
      logout: 'লগ আউট',
      firstName: 'প্রথম নাম',
      lastName: 'শেষ নাম',
      register: 'নিবন্ধন করুন',
    },
    dashboard: {
      welcome: 'স্বাগতম',
      taxSummary: 'কর সারাংশ',
      filingStatus: 'ফাইলিং অবস্থা',
      refundTracker: 'রিফান্ড ট্র্যাকার',
      uploadDocuments: 'নথি আপলোড করুন',
      startFiling: 'ফাইলিং শুরু করুন',
      viewReturns: 'রিটার্ন দেখুন',
    },
    tax: {
      oldRegime: 'পুরাতন ব্যবস্থা',
      newRegime: 'নতুন ব্যবস্থা',
      taxableIncome: 'করযোগ্য আয়',
      totalTax: 'মোট কর',
      refund: 'ফেরত',
      taxPayable: 'প্রদেয় কর',
      chooseRegime: 'কর ব্যবস্থা চয়ন করুন',
      saveTax: 'কর সাশ্রয় করুন',
    },
    docs: {
      uploadTitle: 'কর নথি আপলোড করুন',
      dragDrop: 'ফাইল এখানে টেনে এনে ছেড়ে দিন',
      selectFile: 'ফাইল নির্বাচন করুন',
      form16: 'ফর্ম 16',
      ais: 'এআইএস',
      form26AS: 'ফর্ম 26AS',
      salarySlips: 'বেতন স্লিপ',
    },
    general: {
      save: 'সংরক্ষণ করুন',
      cancel: 'বাতিল করুন',
      next: 'পরবর্তী',
      previous: 'পূর্ববর্তী',
      submit: 'জমা দিন',
      loading: 'লোড হচ্ছে...',
      error: 'ত্রুটি',
      success: 'সফলতা',
    },
  },
  pa: {
    auth: {
      welcomeBack: 'ਜੀ ਆਇਆਂ ਨੂੰ',
      signIn: 'ਸਾਈਨ ਇਨ ਕਰੋ',
      signUp: 'ਸਾਈਨ ਅੱਪ ਕਰੋ',
      email: 'ਈਮੇਲ ਪਤਾ',
      password: 'ਪਾਸਵਰਡ',
      phoneNumber: 'ਫ਼ੋਨ ਨੰਬਰ',
      otp: 'ਓਟੀਪੀ',
      getOTP: 'ਓਟੀਪੀ ਪ੍ਰਾਪਤ ਕਰੋ',
      verifyOTP: 'ਓਟੀਪੀ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
      logout: 'ਲਾੱਗ ਆਊਟ',
      firstName: 'ਪਹਿਲਾ ਨਾਮ',
      lastName: 'ਆਖਰੀ ਨਾਮ',
      register: 'ਰਜਿਸਟਰ ਕਰੋ',
    },
    dashboard: {
      welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ',
      taxSummary: 'ਟੈਕਸ ਸੰਖੇਪ',
      filingStatus: 'ਫਾਇਲਿੰਗ ਸਥਿਤੀ',
      refundTracker: 'ਰਿਫੰਡ ਟਰੈਕਰ',
      uploadDocuments: 'ਦਸਤਾਵੇਜ਼ ਅੱਪਲੋਡ ਕਰੋ',
      startFiling: 'ਫਾਇਲਿੰਗ ਸ਼ੁਰੂ ਕਰੋ',
      viewReturns: 'ਰਿਟਰਨ ਦੇਖੋ',
    },
    tax: {
      oldRegime: 'ਪੁਰਾਣੀ ਵਿਵਸਥਾ',
      newRegime: 'ਨਵੀਂ ਵਿਵਸਥਾ',
      taxableIncome: 'ਕਰਯੋਗ ਆਮਦਨ',
      totalTax: 'ਕੁੱਲ ਟੈਕਸ',
      refund: 'ਰਿਫੰਡ',
      taxPayable: 'ਦੇਣਯੋਗ ਟੈਕਸ',
      chooseRegime: 'ਟੈਕਸ ਵਿਵਸਥਾ ਚੁਣੋ',
      saveTax: 'ਟੈਕਸ ਬਚਾਓ',
    },
    docs: {
      uploadTitle: 'ਟੈਕਸ ਦਸਤਾਵੇਜ਼ ਅੱਪਲੋਡ ਕਰੋ',
      dragDrop: 'ਫਾਈਲਾਂ ਨੂੰ ਇੱਥੇ ਖਿੱਚੋ ਅਤੇ ਛੱਡੋ',
      selectFile: 'ਫਾਈਲ ਚੁਣੋ',
      form16: 'ਫਾਰਮ 16',
      ais: 'ਏਆਈਐਸ',
      form26AS: 'ਫਾਰਮ 26AS',
      salarySlips: 'ਤਨਖਾਹ ਸਲਿੱਪਾਂ',
    },
    general: {
      save: 'ਸੁਰੱਖਿਅਤ ਕਰੋ',
      cancel: 'ਰੱਦ ਕਰੋ',
      next: 'ਅਗਲਾ',
      previous: 'ਪਿਛਲਾ',
      submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
      loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      error: 'ਗਲਤੀ',
      success: 'ਸਫਲਤਾ',
    },
  },
  ur: {
    auth: {
      welcomeBack: 'خوش آمدید',
      signIn: 'سائن ان کریں',
      signUp: 'سائن اپ کریں',
      email: 'ای میل ایڈریس',
      password: 'پاس ورڈ',
      phoneNumber: 'فون نمبر',
      otp: 'او ٹی پی',
      getOTP: 'او ٹی پی حاصل کریں',
      verifyOTP: 'او ٹی پی کی تصدیق کریں',
      logout: 'لاگ آؤٹ',
      firstName: 'پہلا نام',
      lastName: 'آخری نام',
      register: 'رجسٹر کریں',
    },
    dashboard: {
      welcome: 'خوش آمدید',
      taxSummary: 'ٹیکس کا خلاصہ',
      filingStatus: 'فائلنگ کی حیثیت',
      refundTracker: 'رقم کی واپسی ٹریکر',
      uploadDocuments: 'دستاویزات اپ لوڈ کریں',
      startFiling: 'فائلنگ شروع کریں',
      viewReturns: 'ریٹرن دیکھیں',
    },
    tax: {
      oldRegime: 'پرانا نظام',
      newRegime: 'نیا نظام',
      taxableIncome: 'قابل ٹیکس آمدنی',
      totalTax: 'کل ٹیکس',
      refund: 'رقم کی واپسی',
      taxPayable: 'قابل ادائیگی ٹیکس',
      chooseRegime: 'ٹیکس نظام منتخب کریں',
      saveTax: 'ٹیکس بچائیں',
    },
    docs: {
      uploadTitle: 'ٹیکس دستاویزات اپ لوڈ کریں',
      dragDrop: 'فائلوں کو یہاں گھسیٹیں اور چھوڑیں',
      selectFile: 'فائل منتخب کریں',
      form16: 'فارم 16',
      ais: 'اے آئی ایس',
      form26AS: 'فارم 26AS',
      salarySlips: 'تنخواہ سلپس',
    },
    general: {
      save: 'محفوظ کریں',
      cancel: 'منسوخ کریں',
      next: 'اگلا',
      previous: 'پچھلا',
      submit: 'جمع کرائیں',
      loading: 'لوڈ ہو رہا ہے...',
      error: 'خرابی',
      success: 'کامیابی',
    },
  },
  mr: {
    auth: {
      welcomeBack: 'स्वागत आहे',
      signIn: 'साइन इन करा',
      signUp: 'साइन अप करा',
      email: 'ईमेल पत्ता',
      password: 'पासवर्ड',
      phoneNumber: 'फोन नंबर',
      otp: 'ओटीपी',
      getOTP: 'ओटीपी मिळवा',
      verifyOTP: 'ओटीपी सत्यापित करा',
      logout: 'लॉग आउट',
      firstName: 'पहिले नाव',
      lastName: 'आडनाव',
      register: 'नोंदणी करा',
    },
    dashboard: {
      welcome: 'स्वागत आहे',
      taxSummary: 'कर सारांश',
      filingStatus: 'फाइलिंग स्थिती',
      refundTracker: 'परतावा ट्रॅकर',
      uploadDocuments: 'कागदपत्रे अपलोड करा',
      startFiling: 'फाइलिंग सुरू करा',
      viewReturns: 'रिटर्न पहा',
    },
    tax: {
      oldRegime: 'जुनी व्यवस्था',
      newRegime: 'नवीन व्यवस्था',
      taxableIncome: 'करपात्र उत्पन्न',
      totalTax: 'एकूण कर',
      refund: 'परतावा',
      taxPayable: 'देय कर',
      chooseRegime: 'कर व्यवस्था निवडा',
      saveTax: 'कर वाचवा',
    },
    docs: {
      uploadTitle: 'कर कागदपत्रे अपलोड करा',
      dragDrop: 'फाइल्स येथे ड्रॅग आणि ड्रॉप करा',
      selectFile: 'फाइल निवडा',
      form16: 'फॉर्म 16',
      ais: 'एआयएस',
      form26AS: 'फॉर्म 26AS',
      salarySlips: 'पगार स्लिप्स',
    },
    general: {
      save: 'जतन करा',
      cancel: 'रद्द करा',
      next: 'पुढे',
      previous: 'मागे',
      submit: 'सबमिट करा',
      loading: 'लोड होत आहे...',
      error: 'त्रुटी',
      success: 'यश',
    },
  },
};
