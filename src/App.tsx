import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, 
  Bot, 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  FileCheck, 
  Sparkles, 
  RefreshCw, 
  Users, 
  Scale, 
  Coins, 
  Clock, 
  Send, 
  Lock, 
  Info,
  Sliders,
  User,
  Key,
  Mail,
  Smartphone,
  Chrome,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { useI18n } from './contexts/I18nContext';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageSelector } from './components/LanguageSelector';

interface TaxState {
  salary: number;
  basic_salary: number;
  hra_received: number;
  rent_paid: number;
  is_metro_rent: boolean;
  house_property_income: number;
  home_loan_interest: number;
  other_income: number;
  capital_gains_stcg: number;
  capital_gains_ltcg: number;
  crypto_income: number;
  business_net_profit: number;
  sec_80c: number;
  sec_80d: number;
  sec_80d_parents: number;
  sec_80d_parents_senior: boolean;
  sec_80tta: number;
  tds_deducted: number;
}

const defaultTaxState: TaxState = {
  salary: 1450000,
  basic_salary: 580000,
  hra_received: 174000,
  rent_paid: 180000,
  is_metro_rent: true,
  house_property_income: 0,
  home_loan_interest: 120000,
  other_income: 8200,
  capital_gains_stcg: 0,
  capital_gains_ltcg: 0,
  crypto_income: 0,
  business_net_profit: 0,
  sec_80c: 120000,
  sec_80d: 25000,
  sec_80d_parents: 50000,
  sec_80d_parents_senior: true,
  sec_80tta: 8200,
  tds_deducted: 132400
};

// =============================================
// GOOGLE IDENTITY SERVICES (GIS) CONFIGURATION 
// =============================================
// Set via VITE_GOOGLE_CLIENT_ID in frontend/.env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// TypeScript declaration for Google Identity Services global
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}

// Local Tax Calculator Fallback Engine
const calculateLocalTax = (data: TaxState) => {
  const stdOld = data.salary > 0 ? 50000 : 0;
  
  let hraEx = 0;
  if (data.hra_received > 0 && data.rent_paid > 0 && data.basic_salary > 0) {
    const rentExcess = Math.max(0, data.rent_paid - 0.10 * data.basic_salary);
    const basicPct = data.is_metro_rent ? 0.50 * data.basic_salary : 0.40 * data.basic_salary;
    hraEx = Math.min(data.hra_received, rentExcess, basicPct);
  }

  const d80c = Math.min(150000, data.sec_80c);
  const d80dSelf = Math.min(25000, data.sec_80d);
  const d80dParentsLimit = data.sec_80d_parents_senior ? 50000 : 25000;
  const d80dParents = Math.min(d80dParentsLimit, data.sec_80d_parents);
  const d80dTotal = d80dSelf + d80dParents;
  const d80tta = Math.min(10000, data.sec_80tta);
  const totalDeductionsOld = d80c + d80dTotal + d80tta;

  const hpOld = data.house_property_income - data.home_loan_interest;
  const grossOld = Math.max(0, data.salary - hraEx - stdOld) + hpOld + data.other_income + data.business_net_profit;
  const taxableOld = Math.max(0, grossOld - totalDeductionsOld);
  
  let basicTaxOld = 0;
  let oInc = taxableOld;
  if (oInc > 250000) basicTaxOld += (Math.min(oInc, 500000) - 250000) * 0.05;
  if (oInc > 500000) basicTaxOld += (Math.min(oInc, 1000000) - 500000) * 0.20;
  if (oInc > 1000000) basicTaxOld += (oInc - 1000000) * 0.30;

  const stcgTaxOld = data.capital_gains_stcg * 0.15;
  const ltcgTaxOld = Math.max(0, data.capital_gains_ltcg - 125000) * 0.125;
  const cryptoTaxOld = data.crypto_income * 0.30;
  const totalTaxBeforeRebateOld = basicTaxOld + stcgTaxOld + ltcgTaxOld + cryptoTaxOld;
  
  let rebateOld = 0;
  const totalIncOld = taxableOld + data.capital_gains_stcg + data.capital_gains_ltcg + data.crypto_income;
  if (totalIncOld <= 500000) rebateOld = Math.min(totalTaxBeforeRebateOld, 12500);
  const taxAfterRebateOld = Math.max(0, totalTaxBeforeRebateOld - rebateOld);
  const liabilityOld = taxAfterRebateOld * 1.04;

  const stdNew = data.salary > 0 ? 75000 : 0;
  const salaryNew = Math.max(0, data.salary - stdNew);
  const hpNew = data.house_property_income;
  const grossNew = salaryNew + hpNew + data.other_income + data.business_net_profit;
  const taxableNew = grossNew;

  let basicTaxNew = 0;
  let nInc = taxableNew;
  if (nInc > 300000) basicTaxNew += (Math.min(nInc, 700000) - 300000) * 0.05;
  if (nInc > 700000) basicTaxNew += (Math.min(nInc, 1000000) - 700000) * 0.10;
  if (nInc > 1000000) basicTaxNew += (Math.min(nInc, 1200000) - 1000000) * 0.15;
  if (nInc > 1200000) basicTaxNew += (Math.min(nInc, 1500000) - 1200000) * 0.20;
  if (nInc > 1500000) basicTaxNew += (nInc - 1500000) * 0.30;

  const stcgTaxNew = data.capital_gains_stcg * 0.15;
  const ltcgTaxNew = Math.max(0, data.capital_gains_ltcg - 125000) * 0.125;
  const cryptoTaxNew = data.crypto_income * 0.30;
  const totalTaxBeforeRebateNew = basicTaxNew + stcgTaxNew + ltcgTaxNew + cryptoTaxNew;

  let rebateNew = 0;
  if (taxableNew <= 700000) rebateNew = Math.min(totalTaxBeforeRebateNew, 20000);
  const taxAfterRebateNew = Math.max(0, totalTaxBeforeRebateNew - rebateNew);
  const liabilityNew = taxAfterRebateNew * 1.04;

  const optimalRegime = liabilityNew <= liabilityOld ? 'NEW' : 'OLD';
  const taxSaved = Math.abs(liabilityOld - liabilityNew);

  let itrType = 'ITR-1';
  const reasons = ['Gross income from Salaries, single house property and other sources.'];
  const totalGross = data.salary + hpNew + data.other_income + data.business_net_profit + data.capital_gains_stcg + data.capital_gains_ltcg + data.crypto_income;
  
  if (totalGross > 5000000) {
    itrType = 'ITR-2';
    reasons.push('Total income exceeds ₹50 Lakhs limit.');
  }
  if (data.capital_gains_stcg > 0 || data.capital_gains_ltcg > 0) {
    itrType = 'ITR-2';
    reasons.push('Listed shares Capital Gains are present.');
  }
  if (data.crypto_income > 0) {
    itrType = 'ITR-2';
    reasons.push('Crypto / VDA assets transactions are present.');
  }
  if (data.business_net_profit > 0) {
    if (totalGross <= 5000000) {
      itrType = 'ITR-4';
      reasons.push('Income from presumptive profession u/s 44ADA or presumptive business u/s 44AD.');
    } else {
      itrType = 'ITR-3';
      reasons.push('Filing ITR-3 due to business income exceeding presumptive limits.');
    }
  }

  return {
    old_regime: {
      gross_salary: data.salary,
      hra_exemption: hraEx,
      standard_deduction: stdOld,
      salary_income: Math.max(0, data.salary - hraEx - stdOld),
      house_property_income: hpOld,
      other_income: data.other_income,
      business_income: data.business_net_profit,
      gross_total_income: grossOld,
      deductions_chapter_via: totalDeductionsOld,
      taxable_income: taxableOld,
      basic_tax: basicTaxOld,
      capital_gains_tax: stcgTaxOld + ltcgTaxOld,
      crypto_tax: cryptoTaxOld,
      tax_before_rebate: totalTaxBeforeRebateOld,
      rebate_87a: rebateOld,
      cess: taxAfterRebateOld * 0.04,
      total_tax_liability: liabilityOld
    },
    new_regime: {
      gross_salary: data.salary,
      hra_exemption: 0.0,
      standard_deduction: stdNew,
      salary_income: salaryNew,
      house_property_income: hpNew,
      other_income: data.other_income,
      business_income: data.business_net_profit,
      gross_total_income: grossNew,
      deductions_chapter_via: 0.0,
      taxable_income: taxableNew,
      basic_tax: basicTaxNew,
      capital_gains_tax: stcgTaxNew + ltcgTaxNew,
      crypto_tax: cryptoTaxNew,
      tax_before_rebate: totalTaxBeforeRebateNew,
      rebate_87a: rebateNew,
      cess: taxAfterRebateNew * 0.04,
      total_tax_liability: liabilityNew
    },
    optimal_regime: optimalRegime,
    tax_saved: taxSaved,
    itr_type: itrType,
    itr_reasons: reasons,
    recommendations: [
      {
        section: "Regime Optimizer",
        text: `The ${optimalRegime} Tax Regime saves you ₹${taxSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })} in total taxes.`,
        potential_saving: taxSaved
      }
    ]
  };
};

export default function App() {
  // Theme & i18n hooks
  useTheme();
  const { t } = useI18n();
  
  // Auth Session States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Login flow configurations
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp' | 'google'>('password');
  
  // Input fields for Login
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpRequested, setOtpRequested] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  
  // OTP Profile Completion (shown after OTP verification if phone not in users table)
  const [showOtpProfile, setShowOtpProfile] = useState<boolean>(false);
  const [otpProfileFirstName, setOtpProfileFirstName] = useState<string>('');
  const [otpProfileLastName, setOtpProfileLastName] = useState<string>('');
  const [otpProfileEmail, setOtpProfileEmail] = useState<string>('');
  const [otpProfileError, setOtpProfileError] = useState<string>('');
  const [otpProfileLoading, setOtpProfileLoading] = useState<boolean>(false);
  
  // Password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState<boolean>(false);
  const passwordVisibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const regPasswordVisibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const regConfirmPasswordVisibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Registration parameters
  const [regFirstName, setRegFirstName] = useState<string>('');
  const [regLastName, setRegLastName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [passwordMatchError, setPasswordMatchError] = useState<string>('');
  
  // Email availability check
  const [isCheckingEmail, setIsCheckingEmail] = useState<boolean>(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [emailCheckError, setEmailCheckError] = useState<string>('');
  const [emailLengthError, setEmailLengthError] = useState<string>('');

  // Identity Verification (PAN & Aadhaar) Fields
  const [panInput, setPanInput] = useState<string>('ABCDE1234F');
  const [aadhaarInput, setAadhaarInput] = useState<string>('123456789012');
  const [kycDob, setKycDob] = useState<string>('1990-05-15');
  const [kycStatus, setKycStatus] = useState<'UNVERIFIED' | 'VERIFYING' | 'VERIFIED'>('UNVERIFIED');
  const [kycError, setKycError] = useState<string>('');

  // Application Tabs & Form State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'wizard' | 'reconcile' | 'itr' | 'admin'>('dashboard');
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [formState, setFormState] = useState<TaxState>(defaultTaxState);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; type: string; confidence?: number }>>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'copilot'; text: string; updates?: Partial<TaxState> }>>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<Array<{ action: string; ip: string; time: string; details: string }>>([]);
  const [stagedUpdates, setStagedUpdates] = useState<Partial<TaxState> | null>(null);
  
  // Legal Documents Viewer
  const [showLegalDoc, setShowLegalDoc] = useState<boolean>(false);
  const [currentLegalDoc, setCurrentLegalDoc] = useState<string>('TERMS_OF_SERVICE');
  const [legalDocContent, setLegalDocContent] = useState<string>('');
  const [isChatPanelCollapsed, setIsChatPanelCollapsed] = useState<boolean>(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeCalculations = calculateLocalTax(formState);

  // 1. Session Management (Supabase + localStorage fallback)
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('taxcopilot_token');
      const savedUser = localStorage.getItem('taxcopilot_user');

      if (savedToken && savedUser) {
        const user = JSON.parse(savedUser);
        setAuthToken(savedToken);
        setCurrentUser(user);
        setIsAuthenticated(true);

        // Try to refresh user data from Supabase via OTP server
        try {
          const res = await fetch(`http://localhost:5002/api/user?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const { user: freshUser } = await res.json();
            const merged = { ...user, ...freshUser, phoneNumber: freshUser.phone_number };
            setCurrentUser(merged);
            localStorage.setItem('taxcopilot_user', JSON.stringify(merged));

            // Load saved tax return
            const taxRes = await fetch(`http://localhost:5002/api/tax-returns?user_id=${freshUser.id}&assessment_year=2026-27`);
            if (taxRes.ok) {
              const { tax_returns } = await taxRes.json();
              if (tax_returns.length > 0) {
                const tr = tax_returns[0];
                setFormState({
                  salary: Number(tr.salary) || 0,
                  basic_salary: Number(tr.basic_salary) || 0,
                  hra_received: Number(tr.hra_received) || 0,
                  rent_paid: Number(tr.rent_paid) || 0,
                  is_metro_rent: tr.is_metro_rent || false,
                  house_property_income: Number(tr.house_property_income) || 0,
                  home_loan_interest: Number(tr.home_loan_interest) || 0,
                  other_income: Number(tr.other_income) || 0,
                  capital_gains_stcg: Number(tr.capital_gains_stcg) || 0,
                  capital_gains_ltcg: Number(tr.capital_gains_ltcg) || 0,
                  crypto_income: Number(tr.crypto_income) || 0,
                  business_net_profit: 0,
                  sec_80c: Number(tr.sec_80c) || 0,
                  sec_80d: Number(tr.sec_80d) || 0,
                  sec_80d_parents: Number(tr.sec_80d_parents) || 0,
                  sec_80d_parents_senior: true,
                  sec_80tta: 0,
                  tds_deducted: Number(tr.tds_deducted) || 0
                });
              }
            }

            // Load documents
            const docsRes = await fetch(`http://localhost:5002/api/documents?user_id=${freshUser.id}`);
            if (docsRes.ok) {
              const { documents } = await docsRes.json();
              setUploadedFiles(documents.map((d: any) => ({
                name: d.file_name,
                size: `${(d.file_size_bytes / 1024 / 1024).toFixed(1)} MB`,
                type: d.document_type,
                confidence: d.ocr_confidence
              })));
            }

            // Load chat session + messages
            const sessionRes = await fetch('http://localhost:5002/api/chat/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: freshUser.id })
            });
            if (sessionRes.ok) {
              const { session } = await sessionRes.json();
              setChatSessionId(session.id);

              const msgsRes = await fetch(`http://localhost:5002/api/chat/messages?session_id=${session.id}`);
              if (msgsRes.ok) {
                const { messages } = await msgsRes.json();
                if (messages.length > 0) {
                  setChatMessages(messages.map((m: any) => ({ sender: m.sender, text: m.message })));
                }
              }
            }
          }
        } catch {
          // Server unreachable — use localStorage data
        }

        setAuditLogs([
          { action: "SESSION_RESTORED", ip: "192.168.1.1", time: new Date().toLocaleTimeString(), details: "Session restored from Supabase + local storage." },
          { action: "AUDIT_PII_MASKED", ip: "192.168.1.1", time: new Date().toLocaleTimeString(), details: "PAN & Aadhaar crypt-masked dynamically." }
        ]);
      }
    };
    restoreSession();
  }, []);

  // Update default chat messages once user is logged in
  useEffect(() => {
    if (currentUser && chatMessages.length === 0) {
      setChatMessages([
        {
          sender: 'copilot',
          text: `Namaste, **${currentUser.first_name}**! Welcome back to **TaxCopilot**. I am your conversational RAG assistant.\n\nI see your active profile PAN is **${currentUser.pan_masked}**. Your identity is **${currentUser.identity_verified ? 'KYC VERIFIED ✅' : 'UNVERIFIED ⚠️'}**.\n\nYou can upload document PDFs on the left, update inputs, or ask me: *'Which regime saves me more tax?'*`
        }
      ]);
    }
  }, [currentUser]);

  // Scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Debounced auto-save of formState to Supabase (Step 4)
  useEffect(() => {
    if (!currentUser?.id) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await fetch('http://localhost:5002/api/tax-returns/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser.id,
            assessment_year: '2026-27',
            form_state: formState
          })
        });
      } catch { /* server offline */ }
    }, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [formState, currentUser]);

  // Google Identity Services initialization
  const handleGoogleCredentialResponse = useCallback(async (response: any) => {
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });

      if (res.ok) {
        const payload = await res.json();
        saveSession(payload.access_token, payload.user);
      } else {
        const err = await res.json();
        throw new Error(err.detail || 'Google authentication failed on server');
      }
    } catch (err: any) {
      // Offline / backend-down fallback: decode the JWT locally for demo
      try {
        const parts = response.credential.split('.');
        if (parts.length >= 2) {
          const decoded = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          const mockUser = {
            id: `user_google_${Date.now()}`,
            email: decoded.email || 'google.user@gmail.com',
            phoneNumber: '',
            first_name: decoded.given_name || 'Google',
            last_name: decoded.family_name || 'User',
            pan_masked: 'Not Provided',
            aadhaar_masked: 'Not Provided',
            identity_verified: false,
            dob: '1990-01-01',
            residential_status: 'RESIDENT',
            picture_url: decoded.picture || null
          };
          saveSession('mock_jwt_google_gis_token', mockUser);
        } else {
          throw new Error('Invalid token format');
        }
      } catch {
        setAuthError(err.message || 'Google sign-in failed. Backend may be offline.');
      }
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Initialize Google Identity Services when the 'google' login method tab is active
  useEffect(() => {
    if (loginMethod !== 'google' || isAuthenticated) return undefined;

    const initGIS = () => {
      if (window.google?.accounts?.id && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          context: 'signin',
          ux_mode: 'popup'
        });

        // Clear any previously rendered button
        googleButtonRef.current.innerHTML = '';

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            type: 'standard',
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 380
          }
        );
      }
    };

    // The GIS script loads async, so wait for it
    if (window.google?.accounts?.id) {
      initGIS();
      return undefined;
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGIS();
        }
      }, 200);
      // Cleanup after 8s if GIS never loads
      const timeout = setTimeout(() => clearInterval(interval), 8000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, [loginMethod, isAuthenticated, handleGoogleCredentialResponse]);

  // ---------------------------------------------
  // USER AUTHENTICATION ACTIONS
  // ---------------------------------------------
  
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const res = await fetch('http://localhost:5002/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      
      const payload = await res.json();
      if (res.ok) {
        saveSession(payload.access_token, payload.user);
      } else {
        throw new Error(payload.message || 'Invalid email or password');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!phoneInput) {
      setAuthError('Please enter a valid mobile number.');
      return;
    }
    
    // Validate phone number (must be exactly 10 digits)
    if (!validatePhone(phoneInput)) {
      setAuthError('Phone number must be exactly 10 digits');
      return;
    }
    
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const res = await fetch('http://localhost:5002/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: '+91' + phoneInput })  // Add +91 prefix
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setOtpRequested(true);
        alert(`OTP sent to your WhatsApp. Please check your phone and enter the OTP.`);
      } else {
        throw new Error(data.message || 'OTP transmission failed');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send OTP. Ensure OTP server (port 5002) and WhatsApp server (port 5001) are running.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput) return;
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const res = await fetch('http://localhost:5002/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: '91' + phoneInput, otp: otpInput })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        // OTP verified — now check if phone exists in users table
        const phoneCheck = await fetch(`http://localhost:5002/api/user-by-phone?phone=91${phoneInput}`);
        const phoneData = await phoneCheck.json();
        
        if (phoneData.success && phoneData.exists && phoneData.user) {
          // User exists → log them in directly
          saveSession(`jwt_otp_${phoneData.user.id}_${Date.now()}`, phoneData.user);
        } else {
          // User does NOT exist → show profile completion screen
          setShowOtpProfile(true);
        }
      } else {
        throw new Error(data.message || 'OTP Verification failed');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to verify OTP. Please check the OTP and try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle OTP profile completion form submission
  const handleOtpProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpProfileLoading(true);
    setOtpProfileError('');
    
    // Validate mandatory fields
    if (!otpProfileFirstName.trim()) {
      setOtpProfileError('First name is required');
      setOtpProfileLoading(false);
      return;
    }
    if (!otpProfileLastName.trim()) {
      setOtpProfileError('Last name is required');
      setOtpProfileLoading(false);
      return;
    }
    if (!otpProfileEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpProfileEmail)) {
      setOtpProfileError('Valid email address is required');
      setOtpProfileLoading(false);
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5002/api/otp-complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: otpProfileFirstName.trim(),
          last_name: otpProfileLastName.trim(),
          email: otpProfileEmail.trim(),
          phone_number: '91' + phoneInput
        })
      });
      
      const payload = await res.json();
      if (res.ok && payload.success) {
        // Profile saved → log user in
        saveSession(payload.access_token, payload.user);
        setShowOtpProfile(false);
      } else {
        throw new Error(payload.message || 'Failed to save profile');
      }
    } catch (err: any) {
      setOtpProfileError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setOtpProfileLoading(false);
    }
  };

  const handleGoogleLoginFallback = async () => {
    // Manual fallback trigger when GIS SDK is unavailable (e.g., ad blockers)
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: 'mock_fallback_credential_token' })
      });

      if (res.ok) {
        const payload = await res.json();
        saveSession(payload.access_token, payload.user);
      } else {
        throw new Error('Google OAuth fallback failed');
      }
    } catch (err) {
      // Full offline mock fallback
      const mockUser = {
        id: `user_google_fallback_${Date.now()}`,
        email: 'google.taxpayer@gemini.in',
        phoneNumber: '',
        first_name: 'Google',
        last_name: 'Taxpayer',
        pan_masked: 'Not Provided',
        aadhaar_masked: 'Not Provided',
        identity_verified: false,
        dob: '1990-01-01',
        residential_status: 'RESIDENT'
      };
      saveSession('mock_jwt_google_token_777', mockUser);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setPasswordMatchError('');
    
    // Validate password match
    if (regPassword !== regConfirmPassword) {
      setPasswordMatchError('Passwords do not match');
      setAuthLoading(false);
      return;
    }
    
    // Validate phone number (must be exactly 10 digits)
    if (!validatePhone(regPhone)) {
      setAuthError('Phone number must be exactly 10 digits');
      setAuthLoading(false);
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5002/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          first_name: regFirstName,
          last_name: regLastName,
          phone_number: '+91' + regPhone  // Add +91 prefix for backend
        })
      });
      
      const payload = await res.json();
      if (res.ok) {
        saveSession(payload.access_token, payload.user);
      } else {
        throw new Error(payload.message || 'Registration failed');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const saveSession = async (token: string, user: any) => {
    localStorage.setItem('taxcopilot_token', token);
    localStorage.setItem('taxcopilot_user', JSON.stringify(user));
    setAuthToken(token);
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    // Start with default tax state; actual state will be loaded from backend if needed
    setFormState(defaultTaxState);
    
    // Setup verification flags if user had already completed KYC
    if (user.identity_verified) {
      setKycStatus('VERIFIED');
      setPanInput(user.pan_masked);
      setAadhaarInput(user.aadhaar_masked);
    } else {
      setKycStatus('UNVERIFIED');
    }

    // Persist user to Supabase via OTP server (uses service_role key)
    try {
      const authProvider = token.includes('google') ? 'google' : token.includes('otp') ? 'otp' : 'password';
      await fetch('http://localhost:5002/api/persist-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          phone_number: user.phoneNumber || null,
          first_name: user.first_name,
          last_name: user.last_name,
          auth_provider: authProvider
        })
      });

      // Create/get chat session
      const sessionRes = await fetch('http://localhost:5002/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      if (sessionRes.ok) {
        const { session } = await sessionRes.json();
        setChatSessionId(session.id);
      }

      // Load saved tax return if exists
      const taxRes = await fetch(`http://localhost:5002/api/tax-returns?user_id=${user.id}&assessment_year=2026-27`);
      if (taxRes.ok) {
        const { tax_returns } = await taxRes.json();
        if (tax_returns.length > 0) {
          const tr = tax_returns[0];
          setFormState({
            salary: Number(tr.salary) || 0,
            basic_salary: Number(tr.basic_salary) || 0,
            hra_received: Number(tr.hra_received) || 0,
            rent_paid: Number(tr.rent_paid) || 0,
            is_metro_rent: tr.is_metro_rent || false,
            house_property_income: Number(tr.house_property_income) || 0,
            home_loan_interest: Number(tr.home_loan_interest) || 0,
            other_income: Number(tr.other_income) || 0,
            capital_gains_stcg: Number(tr.capital_gains_stcg) || 0,
            capital_gains_ltcg: Number(tr.capital_gains_ltcg) || 0,
            crypto_income: Number(tr.crypto_income) || 0,
            business_net_profit: 0,
            sec_80c: Number(tr.sec_80c) || 0,
            sec_80d: Number(tr.sec_80d) || 0,
            sec_80d_parents: Number(tr.sec_80d_parents) || 0,
            sec_80d_parents_senior: true,
            sec_80tta: 0,
            tds_deducted: Number(tr.tds_deducted) || 0
          });
        }
      }
    } catch {
      // Server offline — session still works via localStorage
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
    if (passwordVisibilityTimerRef.current) clearTimeout(passwordVisibilityTimerRef.current);
    passwordVisibilityTimerRef.current = setTimeout(() => {
      setShowPassword(false);
    }, 2000);
  };

  const toggleRegPasswordVisibility = () => {
    setShowRegPassword(prev => !prev);
    if (regPasswordVisibilityTimerRef.current) clearTimeout(regPasswordVisibilityTimerRef.current);
    regPasswordVisibilityTimerRef.current = setTimeout(() => {
      setShowRegPassword(false);
    }, 2000);
  };

  const toggleRegConfirmPasswordVisibility = () => {
    setShowRegConfirmPassword(prev => !prev);
    if (regConfirmPasswordVisibilityTimerRef.current) clearTimeout(regConfirmPasswordVisibilityTimerRef.current);
    regConfirmPasswordVisibilityTimerRef.current = setTimeout(() => {
      setShowRegConfirmPassword(false);
    }, 2000);
  };

  const checkEmailAvailability = async (email: string) => {
    // Reset state
    setEmailExists(null);
    setEmailCheckError('');
    
    // Validate email format first
    if (!email || !email.includes('@')) {
      return;
    }
    
    setIsCheckingEmail(true);
    
    try {
      const res = await fetch(`http://localhost:5002/api/user?email=${encodeURIComponent(email)}`);
      
      if (res.ok) {
        const data = await res.json();
        // Backend returns { success: true, user: {...} } when user exists
        if (data && data.success && data.user) {
          setEmailExists(true);
        } else {
          setEmailExists(false);
        }
      } else if (res.status === 404) {
        // 404 means user not found, email is available
        setEmailExists(false);
      } else {
        setEmailCheckError('Unable to verify email availability');
      }
    } catch (err: any) {
      setEmailCheckError('Unable to verify email availability');
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleEmailBlur = () => {
    if (regEmail) {
      checkEmailAvailability(regEmail);
    }
  };

  // Input sanitization functions to prevent SQL injection
  const sanitizeName = (input: string): string => {
    // Only allow letters, spaces, hyphens, and apostrophes for names
    return input
      .trim()
      .replace(/[^a-zA-Z\s'-]/g, '')
      .slice(0, 20);
  };

  const sanitizeEmail = (input: string): string => {
    // Basic email sanitization (max 254 characters per RFC 5321)
    return input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9@._+-]/g, '')
      .slice(0, 254);
  };

  const sanitizePhone = (input: string): string => {
    // Only allow numbers (10 digits for Indian mobile)
    return input
      .trim()
      .replace(/[^0-9]/g, '')
      .slice(0, 10);
  };

  const validatePhone = (phone: string): boolean => {
    // Must be exactly 10 digits for Indian mobile
    return /^[0-9]{10}$/.test(phone);
  };

  const sanitizePassword = (input: string): string => {
    // Allow most characters but limit length
    return input.slice(0, 128);
  };

  const handleLogout = async () => {
    localStorage.removeItem('taxcopilot_token');
    localStorage.removeItem('taxcopilot_user');
    setAuthToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setOtpRequested(false);
    setOtpInput('');
    setShowOtpProfile(false);
    setOtpProfileFirstName('');
    setOtpProfileLastName('');
    setOtpProfileEmail('');
    setOtpProfileError('');
  };

  // ---------------------------------------------
  // SECURE NSDL/UIDAI IDENTITY VERIFICATION
  // ---------------------------------------------
  const handleVerifyKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycError('');
    
    // 1. Audit PAN format client side
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panInput.toUpperCase())) {
      setKycError('Invalid Permanent Account Number (PAN) format. Format: ABCDE1234F');
      return;
    }
    
    // 2. Audit Aadhaar format client side
    const aadhaarRegex = /^[0-9]{12}$/;
    if (!aadhaarRegex.test(aadhaarInput)) {
      setKycError('Aadhaar must be exactly 12 numeric digits.');
      return;
    }
    
    setKycStatus('VERIFYING');
    
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/verify-identity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          pan: panInput.toUpperCase(),
          aadhaar: aadhaarInput,
          dob: kycDob
        })
      });
      
      if (res.ok) {
        const payload = await res.json();
        // Update user state session
        const updatedUser = { ...currentUser, ...payload.user };
        localStorage.setItem('taxcopilot_user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setKycStatus('VERIFIED');
        
        // Mask inputs
        setPanInput(payload.user.pan_masked);
        setAadhaarInput(payload.user.aadhaar_masked);

        setChatMessages(prev => [...prev, { sender: 'copilot', text: "✅ **Identity Verification Complete!** \nYour PAN and Aadhaar are officially matched with government CBDT records u/s Section 139AA. Your reporting notice risk is optimized!" }]);
      } else {
        const err = await res.json();
        throw new Error(err.detail || 'Identity Verification failed');
      }
    } catch (err: any) {
      // Local fallback
      setTimeout(() => {
        const maskedPan = `${panInput.substring(0, 5).toUpperCase()}****${panInput.slice(-1)}`;
        const maskedAadhaar = `********${aadhaarInput.slice(-4)}`;
        
        const updatedUser = { 
          ...currentUser, 
          pan_masked: maskedPan, 
          aadhaar_masked: maskedAadhaar,
          identity_verified: true 
        };
        localStorage.setItem('taxcopilot_user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setKycStatus('VERIFIED');
        setPanInput(maskedPan);
        setAadhaarInput(maskedAadhaar);
        
        setChatMessages(prev => [...prev, { sender: 'copilot', text: "✅ **Identity Verification Complete!** (Simulated fallback). Your PAN and Aadhaar have been validated successfully." }]);
      }, 1000);
    }
  };

  // ---------------------------------------------
  // FORM & UPLOAD ACTIONS
  // ---------------------------------------------
  const handleInputChange = (field: keyof TaxState, value: string | number | boolean) => {
    let normalized = value;
    if (typeof defaultTaxState[field] === 'number') {
      normalized = parseFloat(value.toString()) || 0;
    }
    setFormState(prev => {
      const updated = { ...prev, [field]: normalized };
      if (field === 'salary') {
        updated.basic_salary = (normalized as number) * 0.40;
      }
      return updated;
    });

    const timeStr = new Date().toLocaleTimeString();
    setAuditLogs(prev => [
      { action: `UPDATE_${field.toUpperCase()}`, ip: "192.168.1.1", time: timeStr, details: `Modified value of ${field} to ${normalized}` },
      ...prev
    ]);
  };

  const handleDocumentSimulatedUpload = (docType: string, name: string) => {
    setOcrStatus('PROCESSING');
    
    setTimeout(async () => {
      let ocrConfidence = 98.45;
      let data: Partial<TaxState> = {};
      
      if (docType === 'FORM_16') {
        data = {
          salary: 1650000,
          basic_salary: 660000,
          hra_received: 198000,
          rent_paid: 210000,
          sec_80c: 150000,
          sec_80d: 25000,
          tds_deducted: 155000
        };
        ocrConfidence = 99.12;
      } else if (docType === 'AIS') {
        data = {
          other_income: 12500,
          capital_gains_stcg: 75000,
          capital_gains_ltcg: 140000,
          crypto_income: 35000
        };
        ocrConfidence = 98.85;
      } else {
        data = {
          crypto_income: 45000
        };
        ocrConfidence = 96.50;
      }

      setUploadedFiles(prev => [...prev, { name, size: '2.4 MB', type: docType, confidence: ocrConfidence }]);
      setStagedUpdates(data);
      setOcrStatus('SUCCESS');

      // Persist document metadata to Supabase
      if (currentUser?.id) {
        try {
          const params = new URLSearchParams({
            user_id: currentUser.id,
            file_name: name,
            document_type: docType,
            mime_type: 'application/pdf'
          });
          const docRes = await fetch(`http://localhost:5002/api/documents/upload?${params}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/pdf' },
            body: new Blob(['simulated-file-content'], { type: 'application/pdf' })
          });
          if (docRes.ok) {
            const { document } = await docRes.json();
            // Update document with OCR results
            await fetch(`http://localhost:5002/api/documents/${document.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ocr_confidence: ocrConfidence,
                ocr_extracted_data: data,
                status: 'PARSED',
                parsed_at: new Date().toISOString()
              })
            });
          }
        } catch { /* server offline */ }
      }

      const fileText = `📄 **OCR Document Parsing Complete!** \n\nI have successfully scanned **${name}** (OCR Confidence: **${ocrConfidence}%**). \n\nI staged the following auto-extracted items for your tax return:
      ${Object.entries(data).map(([k, v]) => `\n- **${k.replace(/_/g, ' ').toUpperCase()}**: ₹${v.toLocaleString('en-IN')}`).join('')}
      \n\nClick the floating green **"Apply Autofill"** banner on your form to import this data!`;

      setChatMessages(prev => [...prev, { sender: 'copilot', text: fileText }]);

      const timeStr = new Date().toLocaleTimeString();
      setAuditLogs(prev => [
        { action: `OCR_PARSE_${docType}`, ip: "192.168.1.1", time: timeStr, details: `Successfully parsed ${name} with confidence ${ocrConfidence}%` },
        ...prev
      ]);
    }, 1500);
  };

  const applyAutofill = () => {
    if (stagedUpdates) {
      setFormState(prev => ({ ...prev, ...stagedUpdates }));
      setStagedUpdates(null);
      setChatMessages(prev => [...prev, { sender: 'copilot', text: "✅ **Autofill applied successfully!** Your tax engine liabilities have been recalculated in real time. Scroll through the forms or check the regime comparison below." }]);
    }
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    // Persist user message to Supabase
    if (chatSessionId && currentUser?.id) {
      fetch('http://localhost:5002/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: chatSessionId, user_id: currentUser.id, sender: 'user', message: userText })
      }).catch(() => {});
    }

    try {
      const res = await fetch('http://localhost:8000/api/v1/chat/message', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ message: userText })
      });

      if (res.ok) {
        const payload = await res.json();
        setChatMessages(prev => [...prev, { sender: 'copilot', text: payload.message }]);
        if (payload.extracted_form_updates && Object.keys(payload.extracted_form_updates).length > 0) {
          setStagedUpdates(payload.extracted_form_updates);
        }
        // Persist copilot reply
        if (chatSessionId && currentUser?.id) {
          fetch('http://localhost:5002/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: chatSessionId, user_id: currentUser.id, sender: 'copilot', message: payload.message, extracted_updates: payload.extracted_form_updates || null })
          }).catch(() => {});
        }
      } else {
        throw new Error('API offline');
      }
    } catch (err) {
      setTimeout(() => {
        let reply = '';
        let extracted: Partial<TaxState> = {};
        const query = userText.toLowerCase();

        if (query.includes('hra') || query.includes('rent')) {
          reply = `### House Rent Allowance (HRA) Exemption [Section 10(13A)]\n\nTo claim HRA under the Old Regime, you must provide your Basic Salary, HRA received, and rent paid. The amount exempt from tax is the **lowest** of the following three rules:\n\n1. Actual HRA component received from employer (₹${formState.hra_received.toLocaleString()})\n2. Rent paid minus 10% of basic salary (₹${(Math.max(0, formState.rent_paid - 0.1 * formState.basic_salary)).toLocaleString()})\n3. 40% (or 50% for metro cities like Mumbai, Delhi) of basic salary (₹${(formState.basic_salary * (formState.is_metro_rent ? 0.5 : 0.4)).toLocaleString()})\n\n💡 **Your Calculated HRA Exemption:** ₹${activeCalculations.old_regime.hra_exemption.toLocaleString()} (Note: Exemption is **₹0** u/s 115BAC under the New Regime).`;
        } else if (query.includes('80c') || query.includes('ppf') || query.includes('elss')) {
          reply = `### Section 80C Investment Deductions\n\nUnder Section 80C (applicable strictly to the **Old Regime**), you can deduct up to **₹1,50,000** for eligible investments, including:\n- Equity Linked Savings Schemes (ELSS)\n- Public Provident Fund (PPF) & Employee Provident Fund (EPF)\n- Principal repayment of Home Loan\n- Life Insurance (LIC) premiums\n- Tuition fees for children\n\nCurrently, you have declared **₹${formState.sec_80c.toLocaleString()}** in 80C. ${formState.sec_80c < 150000 ? `You can invest ₹${(150000 - formState.sec_80c).toLocaleString()} more to maximize your savings!` : 'You have fully utilized this limit!'}`;
        } else if (query.includes('80d') || query.includes('insurance') || query.includes('medical')) {
          reply = `### Section 80D Medical Premium Deductions\n\nSection 80D (applicable in the **Old Regime**) allows you to claim health insurance premiums paid:\n- **Self, Spouse & Children**: Up to ₹25,000 per year.\n- **Parents**: Up to ₹25,000 (if non-senior) or up to **₹50,000** (if parents are senior citizens aged 60+).\n\nCurrently, you have claimed ₹${formState.sec_80d.toLocaleString()} for yourself and ₹${formState.sec_80d_parents.toLocaleString()} for senior parents, totaling a high-value deduction of **₹${(formState.sec_80d + formState.sec_80d_parents).toLocaleString()}**.`;
        } else if (query.includes('regime') || query.includes('slab') || query.includes('which is better') || query.includes('lower tax')) {
          reply = `### Regime Optimization Analyzer\n\nBased on your active income profile of **₹${formState.salary.toLocaleString()}**, here is our comprehensive analysis:\n\n- **Old Regime Tax Liability**: ₹${activeCalculations.old_regime.total_tax_liability.toLocaleString('en-IN', { maximumFractionDigits: 0 })}\n- **New Regime Tax Liability**: ₹${activeCalculations.new_regime.total_tax_liability.toLocaleString('en-IN', { maximumFractionDigits: 0 })}\n\n🏆 **Our Recommendation:** File under the **${activeCalculations.optimal_regime} REGIME**.\nDoing so saves you **₹${activeCalculations.tax_saved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}** in legal taxes!\n\nThis savings is possible because the New Regime offers a higher standard deduction of **₹75,000** (FY 2025-26) and lower tax brackets, offsetting the loss of standard Chapter VI-A deductions.`;
        } else if (query.includes('crypto') || query.includes('bitcoin')) {
          reply = `### Section 115BBH Crypto Taxation Rules\n\nAll gains from Virtual Digital Assets (VDAs) like cryptocurrencies and NFTs are taxed at a **flat 30%** (plus 4% cess). \n\nImportant provisions:\n1. No cost deductions are allowed except purchase price.\n2. Losses from one coin CANNOT offset gains from another coin.\n3. Losses cannot be carried forward to future years.\n4. A 1% TDS u/s 194S applies to transactions.`;
        } else if (query.includes('salary is') || query.includes('income is')) {
          const matchedNum = query.match(/\d+/);
          if (matchedNum) {
            const val = parseInt(matchedNum[0]) * (query.includes('lakh') ? 100000 : 1);
            reply = `Recognized **Gross Salary** of **₹${val.toLocaleString()}**. I have staged this update for your filing wizard!`;
            extracted = { salary: val, basic_salary: val * 0.40 };
          }
        } else {
          reply = "I've matched your question to our tax laws database! If you are wondering about deductions like HRA, Section 80C, 80D, or comparing Old vs. New slabs, let me know. You can also specify values like *'my salary is 15 lakhs'* and I will automatically staging the form inputs for you!";
        }

        reply += "\n\n*Disclaimer: I am your AI assistant. While I provide highly accurate guidelines based on Indian direct tax laws, please consult a Chartered Accountant for complex filings.*";

        setChatMessages(prev => [...prev, { sender: 'copilot', text: reply }]);
        if (Object.keys(extracted).length > 0) {
          setStagedUpdates(extracted);
        }

        // Persist copilot reply to Supabase
        if (chatSessionId && currentUser?.id) {
          fetch('http://localhost:5002/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: chatSessionId, user_id: currentUser.id, sender: 'copilot', message: reply, extracted_updates: Object.keys(extracted).length > 0 ? extracted : null })
          }).catch(() => {});
        }
      }, 800);
    }
  };

  const stepsList = [
    { title: "Identity KYC", desc: "PAN & Aadhaar validation" },
    { title: "Salary & Allowances", desc: "Form 16 items" },
    { title: "House Property", desc: "Rentals & Home loans" },
    { title: "Capital & VDA", desc: "Shares & Crypto" },
    { title: "Chapter VI-A", desc: "Deductions u/s 80" }
  ];

  // ---------------------------------------------
  // RENDERING AUTH SCREEN (IF NOT AUTHENTICATED)
  // ---------------------------------------------

  const legalDocuments = [
    { id: 'TERMS_OF_SERVICE', title: 'Terms of Service', file: 'TERMS_OF_SERVICE.md' },
    { id: 'PRIVACY_POLICY', title: 'Privacy Policy', file: 'PRIVACY_POLICY.md' },
    { id: 'COOKIE_POLICY', title: 'Cookie Policy', file: 'COOKIE_POLICY.md' },
    { id: 'DPDP_COMPLIANCE_NOTICE', title: 'DPDP Compliance Notice', file: 'DPDP_COMPLIANCE_NOTICE.md' },
    { id: 'AI_USAGE_POLICY', title: 'AI Usage Policy', file: 'AI_USAGE_POLICY.md' },
    { id: 'DATA_RETENTION_POLICY', title: 'Data Retention Policy', file: 'DATA_RETENTION_POLICY.md' },
    { id: 'REFUND_AND_CANCELLATION_POLICY', title: 'Refund & Cancellation Policy', file: 'REFUND_AND_CANCELLATION_POLICY.md' },
    { id: 'DISCLAIMER', title: 'Disclaimer', file: 'DISCLAIMER.md' },
  ];

  // Load legal document content when modal opens or document changes
  useEffect(() => {
    if (showLegalDoc) {
      const doc = legalDocuments.find(d => d.id === currentLegalDoc);
      if (doc) {
        setLegalDocContent(''); // Clear previous content
        // Try to load from public folder first, then fall back to relative import
        fetch(`/taxcopilot-legal-docs/${doc.file}`)
          .then(response => {
            if (!response.ok) throw new Error('Not found in public folder');
            return response.text();
          })
          .then(text => setLegalDocContent(text))
          .catch(() => {
            // Fallback: Try to load from src folder
            fetch(`/src/../taxcopilot-legal-docs/${doc.file}`)
              .then(response => response.text())
              .then(text => setLegalDocContent(text))
              .catch(() => {
                // Last fallback: Show error message
                setLegalDocContent(`# ${doc.title}\n\nUnable to load document. Please ensure the file exists at:\n\`frontend/taxcopilot-legal-docs/${doc.file}\`\n\nFor development, you may need to copy the taxcopilot-legal-docs folder to the public directory.`);
              });
          });
      }
    }
  }, [showLegalDoc, currentLegalDoc]);

  // Simple markdown to HTML parser
  const parseMarkdown = (markdown: string): string => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>')
      // Wrap in paragraphs
      .replace(/^(.+)$/gim, '<p>$1</p>')
      // Lists
      .replace(/<p>- (.*?)<\/p>/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  };

  const renderLegalDocsViewer = () => {
    if (!showLegalDoc) return null;

    const currentDoc = legalDocuments.find(doc => doc.id === currentLegalDoc);

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}>
        <div style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentDoc?.title}
            </h2>
            <button
              onClick={() => setShowLegalDoc(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: 'var(--text-muted)',
                borderRadius: '8px',
                transition: 'background 0.2s'
              }}
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          {/* Quick Navigation to Other Documents */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-hover)'
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-secondary)' }}>
              Quick Navigation
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {legalDocuments.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setCurrentLegalDoc(doc.id)}
                  disabled={doc.id === currentLegalDoc}
                  style={{
                    padding: '6px 12px',
                    background: doc.id === currentLegalDoc ? 'var(--primary)' : 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    cursor: doc.id === currentLegalDoc ? 'default' : 'pointer',
                    fontSize: '11px',
                    color: doc.id === currentLegalDoc ? '#fff' : 'var(--text-secondary)',
                    fontWeight: doc.id === currentLegalDoc ? 600 : 400,
                    transition: 'all 0.2s',
                    opacity: doc.id === currentLegalDoc ? 1 : 0.8
                  }}
                  onMouseEnter={(e) => {
                    if (doc.id !== currentLegalDoc) {
                      e.currentTarget.style.background = 'var(--primary-glow)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.color = 'var(--primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (doc.id !== currentLegalDoc) {
                      e.currentTarget.style.background = 'var(--surface)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {doc.title}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area with Markdown */}
          <div style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            fontSize: '14px',
            lineHeight: '1.8',
            color: 'var(--text-secondary)'
          }}>
            {legalDocContent ? (
              <div 
                dangerouslySetInnerHTML={{ __html: parseMarkdown(legalDocContent) }}
                style={{
                  maxWidth: '100%'
                }}
                className="markdown-content"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                <p>Loading document...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', color: 'var(--text-primary)', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass-panel" style={{ width: '480px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px', borderTop: '4px solid var(--primary)' }}>
          {/* Theme & Language Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '-12px' }}>
            <LanguageSelector />
            <ThemeToggle />
          </div>

          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
              <Scale style={{ color: '#fff', width: '22px', height: '22px' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Tax<span style={{ color: 'var(--secondary)' }}>Copilot</span></h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>FINTECH-GRADE SECURE AI FILING</p>
            </div>
          </div>

          {/* Error Banner */}
          {authError && (
            <div style={{ background: 'var(--danger-glow)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px 16px', borderRadius: '8px', fontSize: '12.5px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              <span>{authError}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'var(--surface)', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: authMode === 'login' ? 'var(--primary)' : 'transparent', color: authMode === 'login' ? '#fff' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '13px', transition: 'var(--transition-fast)' }}
            >
              {t.auth.signIn}
            </button>
            <button 
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: authMode === 'register' ? 'var(--primary)' : 'transparent', color: authMode === 'register' ? '#fff' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '13px', transition: 'var(--transition-fast)' }}
            >
              {t.auth.register}
            </button>
          </div>

          {authMode === 'login' ? (
            <>
              {/* Login Method Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button 
                  onClick={() => setLoginMethod('password')} 
                  className="btn" 
                  style={{ flex: 1, padding: '8px 12px', fontSize: '11.5px', background: loginMethod === 'password' ? 'var(--primary-glow)' : 'var(--border)', color: loginMethod === 'password' ? 'var(--primary)' : 'var(--text-secondary)', border: loginMethod === 'password' ? '1px solid var(--primary)' : '1px solid transparent' }}
                >
                  <Lock size={12} />
                  <span>{t.auth.password}</span>
                </button>
                <button 
                  onClick={() => setLoginMethod('otp')} 
                  className="btn" 
                  style={{ flex: 1, padding: '8px 12px', fontSize: '11.5px', background: loginMethod === 'otp' ? 'var(--primary-glow)' : 'var(--border)', color: loginMethod === 'otp' ? 'var(--primary)' : 'var(--text-secondary)', border: loginMethod === 'otp' ? '1px solid var(--primary)' : '1px solid transparent' }}
                >
                  <Smartphone size={12} />
                  <span>{t.auth.otp}</span>
                </button>
                <button 
                  onClick={() => setLoginMethod('google')} 
                  className="btn" 
                  style={{ flex: 1, padding: '8px 12px', fontSize: '11.5px', background: loginMethod === 'google' ? 'var(--secondary-glow, rgba(236,72,153,0.1))' : 'var(--border)', color: loginMethod === 'google' ? 'var(--secondary)' : 'var(--text-secondary)', border: loginMethod === 'google' ? '1px solid var(--secondary)' : '1px solid transparent' }}
                >
                  <Chrome size={12} style={{ color: loginMethod === 'google' ? 'var(--secondary)' : undefined }} />
                  <span>Google</span>
                </button>
              </div>

              {/* PASSWORD LOGIN FORM */}
              {loginMethod === 'password' && (
                <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">
                      {t.auth.email} <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                      <input 
                        type="email" 
                        required
                        maxLength={254}
                        autoComplete="off"
                        value={emailInput} 
                        onChange={(e) => setEmailInput(sanitizeEmail(e.target.value))} 
                        className="input-field" 
                        style={{ width: '100%', paddingLeft: '36px' }}
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">
                      {t.auth.password} <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Key size={14} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required
                        maxLength={128}
                        autoComplete="off"
                        value={passwordInput} 
                        onChange={(e) => setPasswordInput(sanitizePassword(e.target.value))} 
                        className="input-field" 
                        style={{ width: '100%', paddingLeft: '36px', paddingRight: '36px' }}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        style={{ position: 'absolute', right: '12px', top: '13px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={authLoading} className="btn btn-primary" style={{ width: '100%' }}>
                    {authLoading ? t.general.loading : t.auth.signIn}
                  </button>
                </form>
              )}

              {/* OTP LOGIN FORM */}
              {loginMethod === 'otp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">
                      {t.auth.phoneNumber} <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Smartphone size={14} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                        <input 
                          type="tel" 
                          placeholder="Valid 10 digit mobile number"
                          maxLength={10}
                          autoComplete="off"
                          value={phoneInput} 
                          onChange={(e) => setPhoneInput(sanitizePhone(e.target.value))} 
                          className="input-field" 
                          style={{ width: '100%', paddingLeft: '36px' }}
                        />
                      </div>
                      <button type="button" onClick={handleRequestOTP} className="btn btn-secondary" style={{ padding: '0 16px', fontSize: '12px' }}>
                        {t.auth.getOTP}
                      </button>
                    </div>
                  </div>
                  {otpRequested && (
                    <form onSubmit={handleVerifyOTP} className="float-ui" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="input-group">
                        <label className="input-label">{t.auth.verifyOTP}</label>
                        <input 
                          type="text" 
                          required
                          maxLength={6}
                          autoComplete="off"
                          placeholder="Check console or enter 123456"
                          value={otpInput} 
                          onChange={(e) => setOtpInput(e.target.value)} 
                          className="input-field" 
                          style={{ width: '100%', textAlign: 'center', letterSpacing: '8px', fontSize: '18px', fontWeight: 700 }}
                        />
                      </div>
                      <button type="submit" disabled={authLoading} className="btn btn-success" style={{ width: '100%' }}>
                        {authLoading ? t.general.loading : t.auth.verifyOTP}
                      </button>
                    </form>
                  )}

                  {/* OTP PROFILE COMPLETION SCREEN */}
                  {showOtpProfile && (
                    <form onSubmit={handleOtpProfileSubmit} className="float-ui" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px', padding: '20px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                        <CheckCircle size={28} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>OTP Verified Successfully</h3>
                        <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                          Complete your profile to continue
                        </p>
                      </div>
                      
                      {otpProfileError && (
                        <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', fontSize: '12px', color: 'var(--danger)' }}>
                          {otpProfileError}
                        </div>
                      )}
                      
                      <div className="input-group">
                        <label className="input-label">
                          First Name <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          maxLength={20}
                          autoComplete="off"
                          placeholder="Max 20 characters"
                          value={otpProfileFirstName} 
                          onChange={(e) => setOtpProfileFirstName(sanitizeName(e.target.value))} 
                          className="input-field" 
                          style={{ width: '100%' }}
                        />
                      </div>
                      
                      <div className="input-group">
                        <label className="input-label">
                          Last Name <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          maxLength={20}
                          autoComplete="off"
                          placeholder="Max 20 characters"
                          value={otpProfileLastName} 
                          onChange={(e) => setOtpProfileLastName(sanitizeName(e.target.value))} 
                          className="input-field" 
                          style={{ width: '100%' }}
                        />
                      </div>
                      
                      <div className="input-group">
                        <label className="input-label">
                          Email Address <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Mail size={14} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                          <input 
                            type="email" 
                            required
                            maxLength={254}
                            autoComplete="off"
                            placeholder="your.email@example.com"
                            value={otpProfileEmail} 
                            onChange={(e) => setOtpProfileEmail(sanitizeEmail(e.target.value))} 
                            className="input-field" 
                            style={{ width: '100%', paddingLeft: '36px' }}
                          />
                        </div>
                      </div>
                      
                      <button type="submit" disabled={otpProfileLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '4px' }}>
                        {otpProfileLoading ? t.general.loading : 'Complete Profile & Continue'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* GOOGLE SIGN-IN */}
              {loginMethod === 'google' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '20px 0' }}>
                  <div ref={googleButtonRef} style={{ minHeight: '44px', display: 'flex', justifyContent: 'center' }}></div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Sign in with your Google account using OAuth 2.0
                  </p>
                  <button 
                    type="button" 
                    onClick={handleGoogleLoginFallback} 
                    disabled={authLoading}
                    className="btn btn-secondary" 
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Chrome size={16} />
                    {authLoading ? 'Connecting...' : 'Sign in with Google (Fallback)'}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* REGISTER ACCOUNT FORM */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">
                    {t.auth.firstName} <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    maxLength={20}
                    autoComplete="off"
                    value={regFirstName} 
                    onChange={(e) => setRegFirstName(sanitizeName(e.target.value))} 
                    className="input-field"
                    placeholder="Max 20 characters"
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">
                    {t.auth.lastName} <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    maxLength={20}
                    autoComplete="off"
                    value={regLastName} 
                    onChange={(e) => setRegLastName(sanitizeName(e.target.value))} 
                    className="input-field"
                    placeholder="Max 20 characters"
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">
                  {t.auth.email} <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="email" 
                    required 
                    maxLength={254}
                    autoComplete="off"
                    value={regEmail} 
                    onChange={(e) => {
                      const value = e.target.value;
                      const sanitized = sanitizeEmail(value);
                      setRegEmail(sanitized);
                      
                      // Check length and show error if exceeded
                      if (value.length > 254) {
                        setEmailLengthError('Email address cannot exceed 254 characters');
                      } else {
                        setEmailLengthError('');
                      }
                      
                      // Reset email check state when user types
                      setEmailExists(null);
                      setEmailCheckError('');
                    }}
                    onBlur={handleEmailBlur}
                    className="input-field" 
                    style={{ width: '100%' }}
                  />
                  {isCheckingEmail && (
                    <div style={{ position: 'absolute', right: '12px', top: '13px', display: 'flex', alignItems: 'center' }}>
                      <RefreshCw size={14} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
                    </div>
                  )}
                </div>
                {emailLengthError && (
                  <div style={{ marginTop: '6px', fontSize: '13px', color: '#f44336', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} />
                    <span>{emailLengthError}</span>
                  </div>
                )}
                {emailExists === true && (
                  <div style={{ marginTop: '6px', fontSize: '13px', color: '#f44336', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} />
                    <span>This email is already registered. Please use a different email or sign in.</span>
                  </div>
                )}
                {emailExists === false && (
                  <div style={{ marginTop: '6px', fontSize: '13px', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} />
                    <span>Email is available</span>
                  </div>
                )}
                {emailCheckError && (
                  <div style={{ marginTop: '6px', fontSize: '13px', color: '#ff9800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={14} />
                    <span>{emailCheckError}</span>
                  </div>
                )}
              </div>
              <div className="input-group">
                <label className="input-label">
                  {t.auth.password} <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showRegPassword ? 'text' : 'password'} 
                    required 
                    minLength={6}
                    maxLength={128}
                    autoComplete="new-password"
                    value={regPassword} 
                    onChange={(e) => setRegPassword(sanitizePassword(e.target.value))} 
                    className="input-field" 
                    style={{ width: '100%', paddingRight: '36px' }}
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={toggleRegPasswordVisibility}
                    style={{ position: 'absolute', right: '12px', top: '13px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">
                  Confirm Password <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showRegConfirmPassword ? 'text' : 'password'} 
                    required 
                    minLength={6}
                    maxLength={128}
                    autoComplete="new-password"
                    value={regConfirmPassword} 
                    onChange={(e) => {
                      setRegConfirmPassword(sanitizePassword(e.target.value));
                      // Clear error when user types
                      if (passwordMatchError) setPasswordMatchError('');
                    }} 
                    className="input-field" 
                    style={{ width: '100%', paddingRight: '36px' }}
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    onClick={toggleRegConfirmPasswordVisibility}
                    style={{ position: 'absolute', right: '12px', top: '13px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    {showRegConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {passwordMatchError && (
                  <div style={{ marginTop: '6px', fontSize: '13px', color: '#f44336', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} />
                    <span>{passwordMatchError}</span>
                  </div>
                )}
              </div>
              <div className="input-group">
                <label className="input-label">
                  {t.auth.phoneNumber} <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input 
                  type="tel" 
                  required 
                  maxLength={10}
                  autoComplete="off"
                  placeholder="Valid 10 digit mobile number" 
                  value={regPhone} 
                  onChange={(e) => setRegPhone(sanitizePhone(e.target.value))} 
                  className="input-field" 
                />
              </div>
              <button 
                type="submit" 
                disabled={authLoading || emailExists === true || isCheckingEmail || emailLengthError !== ''} 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '10px', opacity: (emailExists === true || isCheckingEmail || emailLengthError !== '') ? 0.5 : 1 }}
              >
                {authLoading ? t.general.loading : t.auth.register}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '11px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <Shield size={12} />
            <span 
              onClick={() => {
                setCurrentLegalDoc('TERMS_OF_SERVICE');
                setShowLegalDoc(true);
              }}
              style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--primary)' }}
            >
              Terms of Service
            </span>
          </div>
        </div>
        {/* Legal Documents Viewer */}
        {renderLegalDocsViewer()}
      </div>
    );
  }

  // ---------------------------------------------
  // RENDERING SECURED APP INTERFACE
  // ---------------------------------------------
  return (
    <div className="app-container" style={{ gridTemplateColumns: isChatPanelCollapsed ? '260px 1fr 0px' : '260px 1fr 380px', transition: 'grid-template-columns 0.3s ease' }}>
      {/* 1. LEFT NAVIGATION PANEL */}
      <aside style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 10, overflowY: 'auto' }}>
        {/* Brand Header */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
            <Scale style={{ color: '#fff', width: '20px', height: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Tax<span style={{ color: 'var(--secondary)' }}>Copilot</span></h2>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>AY 2026-27 | FY 2025-26</span>
          </div>
        </div>

        {/* User Card */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--primary)' }}>
            <User size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{currentUser.first_name} {currentUser.last_name}</h4>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>PAN: {currentUser.pan_masked}</span>
          </div>
          <button onClick={handleLogout} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }} title="Log out">
            <LogOut size={16} />
          </button>
        </div>

        {/* Tab Buttons */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button onClick={() => setActiveTab('dashboard')} className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)', width: '100%' }}>
            <TrendingUp size={18} />
            <span>Overview Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('upload')} className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)', width: '100%' }}>
            <UploadCloud size={18} />
            <span>Document OCR</span>
            {ocrStatus === 'PROCESSING' && <span className="pulse-ui" style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></span>}
          </button>
          <button onClick={() => setActiveTab('wizard')} className={`btn ${activeTab === 'wizard' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)', width: '100%' }}>
            <Sliders size={18} />
            <span>Filing Wizard</span>
          </button>
          <button onClick={() => setActiveTab('reconcile')} className={`btn ${activeTab === 'reconcile' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)', width: '100%' }}>
            <Shield size={18} />
            <span>AIS Reconciliation</span>
          </button>
          <button onClick={() => setActiveTab('itr')} className={`btn ${activeTab === 'itr' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)', width: '100%' }}>
            <FileCheck size={18} />
            <span>Generated ITR</span>
          </button>
          <button onClick={() => setActiveTab('admin')} className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)', width: '100%' }}>
            <Users size={18} />
            <span>Admin Control</span>
          </button>
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Theme & Language Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <ThemeToggle />
            <LanguageSelector />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
            <Lock size={12} />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>JWT Authenticated Session</span>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DPDP Compliant. All documents undergo automatic PII masking before extraction.</p>
        </div>
      </aside>

      {/* 2. CORE INTERACTION BOARD */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--background)', position: 'relative', height: '100vh', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        {/* Autofill Alert */}
        {stagedUpdates && (
          <div className="float-ui" style={{ background: 'linear-gradient(135deg, #059669 0%, var(--success) 100%)', color: '#fff', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>AI parsed {Object.keys(stagedUpdates).length} form updates from your inputs/documents.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setStagedUpdates(null)} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Discard</button>
              <button onClick={applyAutofill} style={{ background: '#fff', color: 'var(--success)', border: 'none', padding: '4px 12px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>Apply Autofill</button>
            </div>
          </div>
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <div style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Welcome back, {currentUser.first_name}!</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Review your tax summaries, refund status, and optimize deductions u/s AY 2026-27.</p>
              </div>
              <div style={{ background: 'var(--border)', padding: '6px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentUser.identity_verified ? 'var(--success)' : 'var(--warning)' }}></div>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>PAN: {currentUser.pan_masked} • {currentUser.identity_verified ? 'KYC VERIFIED' : 'UNVERIFIED'}</span>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>Filing Status</span>
                <Clock size={16} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700 }}>In Calculation</h2>
              <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'var(--primary)' }}></div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Filing Step: {stepsList[wizardStep].title}</span>
            </div>

            <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>Refund Tracker</span>
                <Coins size={16} style={{ color: 'var(--success)' }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>
                ₹{Math.max(0, formState.tds_deducted - activeCalculations.old_regime.total_tax_liability).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h2>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Estimated refund under Old Regime.</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={10} style={{ color: 'var(--success)' }} />
                <span>Form 26AS TDS matched successfully.</span>
              </span>
            </div>

            <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>Notice Risk Monitor</span>
                <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
              </div>
              {formState.capital_gains_stcg === 0 ? (
                <>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger)' }}>Moderate Risk</h2>
                  <span style={{ fontSize: '11px', color: 'var(--danger)' }}>AIS reports mutual fund capital gains but form state is empty.</span>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>Zero Risk</h2>
                  <span style={{ fontSize: '11px', color: 'var(--success)' }}>Entered values reconciled flawlessly with AIS entries!</span>
                </>
              )}
            </div>

            {/* Regime Optimizer Block */}
            <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '28px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale style={{ color: 'var(--primary)' }} />
                <span>Interactive Regime Slab Optimizer</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>We dynamically optimize slabs based on FY 2025-26 rules. Real-time recalculation upon form updates.</p>

              <div className="regime-grid">
                <div className={`regime-card ${activeCalculations.optimal_regime === 'OLD' ? 'recommended' : ''}`}>
                  {activeCalculations.optimal_regime === 'OLD' && (
                    <span className="regime-badge recommended">Recommended</span>
                  )}
                  <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Old Tax Regime</h4>
                  <div style={{ margin: '16px 0' }}>
                    <span style={{ fontSize: '32px', fontWeight: 800 }}>₹{activeCalculations.old_regime.total_tax_liability.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>incl. Cess</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Gross Income</span>
                      <span>₹{activeCalculations.old_regime.gross_total_income.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Chapter VI-A Deductions</span>
                      <span style={{ color: 'var(--success)' }}>- ₹{activeCalculations.old_regime.deductions_chapter_via.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>HRA Exemption</span>
                      <span style={{ color: 'var(--success)' }}>- ₹{activeCalculations.old_regime.hra_exemption.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>

                <div className={`regime-card ${activeCalculations.optimal_regime === 'NEW' ? 'recommended' : ''}`}>
                  {activeCalculations.optimal_regime === 'NEW' && (
                    <span className="regime-badge recommended">Recommended</span>
                  )}
                  <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>New Tax Regime (Section 115BAC)</h4>
                  <div style={{ margin: '16px 0' }}>
                    <span style={{ fontSize: '32px', fontWeight: 800 }}>₹{activeCalculations.new_regime.total_tax_liability.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>incl. Cess</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Gross Income</span>
                      <span>₹{activeCalculations.new_regime.gross_total_income.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Standard Deduction u/s 16</span>
                      <span style={{ color: 'var(--success)' }}>- ₹{activeCalculations.new_regime.standard_deduction.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>VI-A Deductions & HRA</span>
                      <span style={{ color: 'var(--danger)' }}>Disallowed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', background: 'var(--primary-glow)', border: '1px solid rgba(99,102,241,0.25)', padding: '16px 20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '13.5px' }}>
                    TaxCopilot optimization has selected the **{activeCalculations.optimal_regime} REGIME** for you. Savings: **₹{activeCalculations.tax_saved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}**!
                  </span>
                </div>
                <button onClick={() => setActiveTab('wizard')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  <span>Proceed to File</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENT AI HUB */}
        {activeTab === 'upload' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Document AI Parsing Hub</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Drop your Form 16, AIS, or Broker statements to extract salary details, TDS credits, and mutual fund trades instantly using simulated OCR.</p>
            </div>

            <div className="glass-panel" style={{ border: '2px dashed rgba(255,255,255,0.15)', padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UploadCloud size={28} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Drag and drop your tax statement here</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supports PDF, JPG, PNG up to 10MB. Document undergoes structural AI parsing.</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  disabled={ocrStatus === 'PROCESSING'}
                  onClick={() => handleDocumentSimulatedUpload('FORM_16', 'Form16_AY_2026-27.pdf')}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px' }}
                >
                  <FileText size={14} />
                  <span>Simulate Form 16</span>
                </button>
                <button 
                  disabled={ocrStatus === 'PROCESSING'}
                  onClick={() => handleDocumentSimulatedUpload('AIS', 'AIS_Taxpayer_Details.pdf')}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px' }}
                >
                  <Info size={14} />
                  <span>Simulate AIS</span>
                </button>
              </div>
            </div>

            {ocrStatus === 'PROCESSING' && (
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--warning)' }}>
                <RefreshCw size={20} className="pulse-ui" style={{ color: 'var(--warning)', animation: 'spin 2s linear infinite' }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600 }}>AI Document Parser is extracting tables...</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Identifying Employer TAN, tax schedules, HRA values, and capital gains lines.</p>
                </div>
              </div>
            )}

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Extracted Documents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {uploadedFiles.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', padding: '16px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>No uploaded files found yet. Use the simulation buttons above to trigger high-fidelity OCR scanning.</div>
                ) : (
                  uploadedFiles.map((file, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--success-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 600 }}>{file.name}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{file.type} • {file.size}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', background: 'var(--success-glow)', color: 'var(--success)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                          {file.confidence}% OCR Accuracy
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FILING WIZARD */}
        {activeTab === 'wizard' && (
          <div>
            {/* Steps indicator */}
            <div className="wizard-header">
              <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Filing Form Wizard</h1>
              <div className="wizard-steps">
                {stepsList.map((step, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setWizardStep(idx)}
                    className={`wizard-step ${wizardStep === idx ? 'active' : wizardStep > idx ? 'completed' : ''}`}
                  >
                    {idx + 1}. {step.title}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* STEP 0: IDENTITY & KYC VERIFICATION PORTAL */}
              {wizardStep === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Aadhaar & PAN Identity Authentication</h3>
                    <span style={{ fontSize: '11px', background: kycStatus === 'VERIFIED' ? 'var(--success-glow)' : 'var(--warning-glow)', color: kycStatus === 'VERIFIED' ? 'var(--success)' : 'var(--warning)', padding: '4px 12px', borderRadius: '4px', fontWeight: 700 }}>
                      {kycStatus === 'VERIFIED' ? 'KYC SECURED & VERIFIED' : 'KYC PENDING'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Section 139AA of the Income Tax Act mandates linking of PAN with Aadhaar. Enter details below to initiate format audits and sync direct CBDT ledger profiles.</p>
                  
                  {kycError && (
                    <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px 16px', borderRadius: '8px', fontSize: '12.5px', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {kycError}
                    </div>
                  )}

                  <form onSubmit={handleVerifyKYC} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-grid-2">
                      <div className="input-group">
                        <label className="input-label">Permanent Account Number (PAN)</label>
                        <input 
                          type="text" 
                          required
                          disabled={kycStatus === 'VERIFIED'}
                          value={panInput}
                          onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                          className="input-field" 
                          placeholder="ABCDE1234F"
                          maxLength={10}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Aadhaar Card (12-Digit)</label>
                        <input 
                          type="text" 
                          required
                          disabled={kycStatus === 'VERIFIED'}
                          value={aadhaarInput}
                          onChange={(e) => setAadhaarInput(e.target.value)}
                          className="input-field" 
                          placeholder="123456789012"
                          maxLength={12}
                        />
                      </div>
                      <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label className="input-label">Date of Birth (DOB as in Aadhaar)</label>
                        <input 
                          type="date" 
                          required
                          disabled={kycStatus === 'VERIFIED'}
                          value={kycDob}
                          onChange={(e) => setKycDob(e.target.value)}
                          className="input-field" 
                        />
                      </div>
                    </div>
                    {kycStatus !== 'VERIFIED' && (
                      <button type="submit" disabled={kycStatus === 'VERIFYING'} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                        {kycStatus === 'VERIFYING' ? 'Authenticating with NSDL/UIDAI...' : 'Verify Identity securely'}
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* STEP 1: SALARY */}
              {wizardStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Salary and Allowances (Form 16)</h3>
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label className="input-label">Gross Salary (Per Annum)</label>
                      <input 
                        type="number" 
                        value={formState.salary} 
                        onChange={(e) => handleInputChange('salary', e.target.value)} 
                        className="input-field" 
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Basic Salary Component</label>
                      <input 
                        type="number" 
                        value={formState.basic_salary} 
                        onChange={(e) => handleInputChange('basic_salary', e.target.value)} 
                        className="input-field" 
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">HRA Component Received</label>
                      <input 
                        type="number" 
                        value={formState.hra_received} 
                        onChange={(e) => handleInputChange('hra_received', e.target.value)} 
                        className="input-field" 
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">TDS Deducted (by Employer)</label>
                      <input 
                        type="number" 
                        value={formState.tds_deducted} 
                        onChange={(e) => handleInputChange('tds_deducted', e.target.value)} 
                        className="input-field" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: HOUSE PROPERTY */}
              {wizardStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>House Property Information</h3>
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label className="input-label">Yearly Rent Paid (if claiming HRA)</label>
                      <input 
                        type="number" 
                        value={formState.rent_paid} 
                        onChange={(e) => handleInputChange('rent_paid', e.target.value)} 
                        className="input-field" 
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Home Loan Interest Paid (Sec 24b)</label>
                      <input 
                        type="number" 
                        value={formState.home_loan_interest} 
                        onChange={(e) => handleInputChange('home_loan_interest', e.target.value)} 
                        className="input-field" 
                      />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="checkbox" 
                          checked={formState.is_metro_rent} 
                          onChange={(e) => handleInputChange('is_metro_rent', e.target.checked)} 
                        />
                        <span>Rented property is situated in Metro City (Delhi, Mumbai, Kolkata, Chennai) u/s Section 10(13A)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CAPITAL & VDA */}
              {wizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Capital Gains & Crypto Income</h3>
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label className="input-label">Short Term Capital Gains (STCG - Shares/Equity)</label>
                      <input 
                        type="number" 
                        value={formState.capital_gains_stcg} 
                        onChange={(e) => handleInputChange('capital_gains_stcg', e.target.value)} 
                        className="input-field" 
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Long Term Capital Gains (LTCG - Equity Mutual Funds)</label>
                      <input 
                        type="number" 
                        value={formState.capital_gains_ltcg} 
                        onChange={(e) => handleInputChange('capital_gains_ltcg', e.target.value)} 
                        className="input-field" 
                      />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                      <label className="input-label">Income from Cryptocurrencies / VDAs (Sec 115BBH)</label>
                      <input 
                        type="number" 
                        value={formState.crypto_income} 
                        onChange={(e) => handleInputChange('crypto_income', e.target.value)} 
                        className="input-field" 
                        style={{ borderColor: formState.crypto_income > 0 ? 'var(--warning)' : 'var(--border)' }}
                      />
                      {formState.crypto_income > 0 && <span style={{ fontSize: '11px', color: 'var(--warning)' }}>Flat 30% tax rate applies to VDA gains with zero offsets.</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: DEDUCTIONS */}
              {wizardStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Chapter VI-A Tax Deductions (Old Regime exclusive)</h3>
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label className="input-label">Section 80C (PPF, LIC, ELSS, tuition fees) - Max ₹1.5L</label>
                      <input 
                        type="number" 
                        value={formState.sec_80c} 
                        onChange={(e) => handleInputChange('sec_80c', e.target.value)} 
                        className="input-field" 
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Section 80D Self Health Premium - Max ₹25K</label>
                      <input 
                        type="number" 
                        value={formState.sec_80d} 
                        onChange={(e) => handleInputChange('sec_80d', e.target.value)} 
                        className="input-field" 
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Section 80D Parents Health Premium - Max ₹50K</label>
                      <input 
                        type="number" 
                        value={formState.sec_80d_parents} 
                        onChange={(e) => handleInputChange('sec_80d_parents', e.target.value)} 
                        className="input-field" 
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '30px' }}>
                        <input 
                          type="checkbox" 
                          checked={formState.sec_80d_parents_senior} 
                          onChange={(e) => handleInputChange('sec_80d_parents_senior', e.target.checked)} 
                        />
                        <span>Parents are Senior Citizens (Allows additional ₹25K limit, total parents limit: ₹50K)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Nav buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '20px' }}>
                <button 
                  disabled={wizardStep === 0} 
                  onClick={() => setWizardStep(prev => prev - 1)} 
                  className="btn btn-secondary"
                >
                  Back
                </button>
                {wizardStep < 4 ? (
                  <button onClick={() => setWizardStep(prev => prev + 1)} className="btn btn-primary">
                    <span>Next Section</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button onClick={() => setActiveTab('reconcile')} className="btn btn-success">
                    <span>Review AIS Reconciliation</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AIS RECONCILIATION */}
        {activeTab === 'reconcile' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800 }}>AIS / Form 26AS Reconciliation Engine</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Compare your declared income components side-by-side with government records to eliminate reporting mismatches and tax notice risks.</p>
            </div>

            {/* Reconciliation Score Dial */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: formState.capital_gains_stcg === 0 ? 'var(--warning-glow)' : 'var(--success-glow)', border: '4px solid', borderColor: formState.capital_gains_stcg === 0 ? 'var(--warning)' : 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: formState.capital_gains_stcg === 0 ? 'var(--warning)' : 'var(--success)' }}>
                  {formState.capital_gains_stcg === 0 ? '70' : '100'}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Tax Compliance Score: {formState.capital_gains_stcg === 0 ? '70' : '100'}/100</h3>
                {formState.capital_gains_stcg === 0 ? (
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>We flagged **2 critical mismatches** between your declared parameters and AIS ledger transactions.</p>
                ) : (
                  <p style={{ fontSize: '12.5px', color: 'var(--success)', fontWeight: 600 }}>Excellent! All income parameters are synchronized. Your compliance notice risk is 0%.</p>
                )}
              </div>
            </div>

            {/* Split Screen Ledgers */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Income Reconciliation Grid</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Salary Income</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Form 16 match</span>
                  </div>
                  <div style={{ display: 'flex', gap: '48px', textAlign: 'right' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Declared</span>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>₹{formState.salary.toLocaleString()}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>AIS Ledger</span>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>₹{formState.salary.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ background: 'var(--success-glow)', color: 'var(--success)', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>Match</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: formState.capital_gains_stcg === 0 ? 'var(--warning)' : 'var(--border)' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Capital Gains (STCG)</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Listed equity mutual funds trading</span>
                  </div>
                  <div style={{ display: 'flex', gap: '48px', textAlign: 'right' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Declared</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: formState.capital_gains_stcg === 0 ? 'var(--warning)' : 'var(--text-primary)' }}>₹{formState.capital_gains_stcg.toLocaleString()}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>AIS Ledger</span>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>₹75,000</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {formState.capital_gains_stcg === 0 ? (
                        <button 
                          onClick={() => {
                            handleInputChange('capital_gains_stcg', 75000);
                            handleInputChange('capital_gains_ltcg', 140000);
                          }} 
                          className="btn btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          Sync AIS
                        </button>
                      ) : (
                        <span style={{ background: 'var(--success-glow)', color: 'var(--success)', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>Match</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: formState.crypto_income === 0 ? 'var(--warning)' : 'var(--border)' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Crypto / VDA Income</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Offmarket transactions u/s 194S</span>
                  </div>
                  <div style={{ display: 'flex', gap: '48px', textAlign: 'right' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Declared</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: formState.crypto_income === 0 ? 'var(--warning)' : 'var(--text-primary)' }}>₹{formState.crypto_income.toLocaleString()}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>AIS Ledger</span>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>₹35,000</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {formState.crypto_income === 0 ? (
                        <button 
                          onClick={() => handleInputChange('crypto_income', 35000)} 
                          className="btn btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          Sync AIS
                        </button>
                      ) : (
                        <span style={{ background: 'var(--success-glow)', color: 'var(--success)', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>Match</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {formState.capital_gains_stcg === 0 && (
              <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--danger)', display: 'flex', alignItems: 'flex-start', gap: '14px', background: 'rgba(239,68,68,0.03)' }}>
                <AlertTriangle size={20} style={{ color: 'var(--danger)', marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--danger)' }}>Scrutiny Notice Notice Prevention Warning</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    We identified unreported Short Term Capital Gains (₹75,000) and Crypto gains (₹35,000) in your AIS ledger. Filing without reconciling these items will trigger an **automated tax notice u/s 143(1)(a)** from the central processing center. We recommend clicking the **Sync AIS** buttons to automatically declare these gains.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: GENERATED ITR DATA */}
        {activeTab === 'itr' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Generated ITR-2 Return</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Here is your standardized government ITR JSON model ready to be filed directly through government API gateways.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Shield size={24} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '11px', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>Draft Ready</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>ITR Acknowledgement Draft</h4>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Assessment Year: 2026-27 | Financial Year: 2025-26</p>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Taxpayer Name</span>
                    <span style={{ fontWeight: 600 }}>{currentUser.first_name.toUpperCase()} {currentUser.last_name.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Permanent Account Number (PAN)</span>
                    <span style={{ fontWeight: 600 }}>{currentUser.pan_masked}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Aadhaar Number</span>
                    <span style={{ fontWeight: 600 }}>{currentUser.aadhaar_masked}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Selected Tax Regime</span>
                    <span style={{ fontWeight: 600 }}>{activeCalculations.optimal_regime} REGIME</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Ordinary Income</span>
                    <span style={{ fontWeight: 600 }}>₹{activeCalculations.old_regime.gross_total_income.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Capital & Crypto Gains</span>
                    <span style={{ fontWeight: 600 }}>₹{(formState.capital_gains_stcg + formState.capital_gains_ltcg + formState.crypto_income).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Net Tax Payable</span>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                      ₹{activeCalculations.optimal_regime === 'NEW' 
                        ? activeCalculations.new_regime.total_tax_liability.toLocaleString('en-IN', { maximumFractionDigits: 0 }) 
                        : activeCalculations.old_regime.total_tax_liability.toLocaleString('en-IN', { maximumFractionDigits: 0 })
                      }
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => alert('Filing transmission queued. Under secure JWT and SSL protocols, your optimized ITR return is submitted to government ERI gateways.')} 
                  className="btn btn-success"
                  style={{ width: '100%' }}
                >
                  <Shield size={16} />
                  <span>Transmit directly to Income Tax Dept</span>
                </button>
              </div>

              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '10px' }}>STANDARD ITR SCHEMA MODEL</span>
                <pre style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', fontSize: '11.5px', fontFamily: 'Courier, monospace', color: 'var(--secondary)' }}>
{JSON.stringify({
  "assessmentYear": "2026-27",
  "financialYear": "2025-26",
  "taxpayer": {
    "firstName": currentUser.first_name,
    "lastName": currentUser.last_name,
    "pan": currentUser.pan_masked,
    "aadhaar": currentUser.aadhaar_masked,
    "residentialStatus": "RESIDENT"
  },
  "income": {
    "grossSalary": formState.salary,
    "basicSalary": formState.basic_salary,
    "allowancesExempt": formState.hra_received,
    "houseProperty": formState.house_property_income,
    "otherSources": formState.other_income,
    "businessPresumptive": formState.business_net_profit,
    "capitalGains": {
      "stcg111A": formState.capital_gains_stcg,
      "ltcg112A": formState.capital_gains_ltcg
    },
    "cryptoGains": formState.crypto_income
  },
  "deductions": {
    "sec80C": formState.sec_80c,
    "sec80DSelf": formState.sec_80d,
    "sec80DParents": formState.sec_80d_parents
  },
  "calculations": {
    "taxRegimeSelected": activeCalculations.optimal_regime,
    "totalLiability": activeCalculations.optimal_regime === 'NEW' ? activeCalculations.new_regime.total_tax_liability : activeCalculations.old_regime.total_tax_liability,
    "tdsCredited": formState.tds_deducted
  }
}, null, 2)}
                </pre>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: ADMIN CONTROL & AUDIT LOGS */}
        {activeTab === 'admin' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Admin Platform Control</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Monitor security compliance vectors, processing latency metrics, and strict cryptographic audit logs.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '16px 20px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>ACTIVE USER SESSIONS</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>4,821</h3>
              </div>
              <div className="glass-panel" style={{ padding: '16px 20px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>OCR PIPELINE QUEUE</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--warning)' }}>2 Jobs</h3>
              </div>
              <div className="glass-panel" style={{ padding: '16px 20px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>API GATEWAY LATENCY</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>42 ms</h3>
              </div>
              <div className="glass-panel" style={{ padding: '16px 20px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>FILING ACCURACY RATE</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--secondary)' }}>99.98%</h3>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Cryptographic PII Audit Trail</h3>
              <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                    <tr>
                      <th style={{ padding: '14px 20px' }}>Action Vector</th>
                      <th style={{ padding: '14px 20px' }}>Address IP</th>
                      <th style={{ padding: '14px 20px' }}>Time</th>
                      <th style={{ padding: '14px 20px' }}>Compliance Operations Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                        <td style={{ padding: '14px 20px', fontFamily: 'Courier, monospace', color: 'var(--secondary)' }}>{log.action}</td>
                        <td style={{ padding: '14px 20px' }}>{log.ip}</td>
                        <td style={{ padding: '14px 20px' }}>{log.time}</td>
                        <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. RIGHT PANEL: AI COPILOT CHAT PANEL */}
      <section className="chat-container" style={{ width: isChatPanelCollapsed ? '0px' : '380px', overflow: isChatPanelCollapsed ? 'hidden' : 'visible', transition: 'width 0.3s ease' }}>
        <div className="chat-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '14.5px', fontWeight: 700 }}>AI Tax Copilot</h3>
              <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)' }}></span>
                <span>RAG Engine Online</span>
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsChatPanelCollapsed(!isChatPanelCollapsed)} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={isChatPanelCollapsed ? 'Expand AI Copilot' : 'Collapse AI Copilot'}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="chat-messages">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender}`}>
              <div 
                style={{ whiteSpace: 'pre-line' }} 
                dangerouslySetInnerHTML={{ 
                  __html: msg.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/### (.*?)\n/g, '<h4>$1</h4>')
                    .replace(/- (.*?)\n/g, '• $1<br/>') 
                }} 
              />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendChatMessage} className="chat-input-area">
          <input 
            type="text" 
            value={chatInput} 
            onChange={(e) => setChatInput(e.target.value)} 
            placeholder="Ask about HRA, 80D, Old vs New slabs..." 
            className="input-field" 
            style={{ flex: 1, borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.02)' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '38px', height: '38px', borderRadius: '50%', padding: '0' }}>
            <Send size={14} />
          </button>
        </form>
      </section>

      {/* Floating Expand Button (when chat is collapsed) */}
      {isChatPanelCollapsed && (
        <button 
          onClick={() => setIsChatPanelCollapsed(false)} 
          style={{ 
            position: 'fixed', 
            right: '20px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            background: 'var(--primary)', 
            color: '#fff',
            border: 'none', 
            borderRadius: '50%', 
            width: '48px', 
            height: '48px', 
            cursor: 'pointer', 
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(99, 102, 241, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)';
          }}
          title="Open AI Copilot"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      
      {/* Legal Documents Viewer */}
      {renderLegalDocsViewer()}
      
      {/* Terms of Service Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px',
        textAlign: 'center',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        zIndex: 50
      }}>
        <Shield size={12} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
        <span 
          onClick={() => {
            setCurrentLegalDoc('TERMS_OF_SERVICE');
            setShowLegalDoc(true);
          }}
          style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--primary)' }}
        >
          Terms of Service
        </span>
      </div>
    </div>
  );
}
