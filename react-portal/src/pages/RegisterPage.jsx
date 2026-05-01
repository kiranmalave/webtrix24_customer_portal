import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import LeftPanel from '../components/LeftPanel';
import OtpInput from '../components/OtpInput';
import CrmTypeSelector from '../components/CrmTypeSelector';
import ChipSelector from '../components/ChipSelector';
import { useTogglePassword } from '../hooks/useTogglePassword';
import {
  registerUser, verifyDetails, companySetup, resendVerify,
} from '../api/auth';
import {
  COUNTRY_CODES, COMPANY_SIZES, LEAD_SOURCES, BUSINESS_TYPES,
} from '../api/constants';

// ── Steps ──────────────────────────────────────────────────
// 1 → Personal details (name, email, phone)
// 2 → OTP verification + set password
// 3 → CRM type selection
// 4 → Company name / GST / website
// 5 → Company size
// 6 → How did you hear about us
// 7 → Industry / business type
// 8 → Demo data preference
// 9 → Company logo
// 10 → Setting up (progress)
// 11 → Congratulations

const TOTAL_STEPS = 9; // steps 1-9 visible to user

function stepLabel(step) {
  const labels = [
    'Your Details', 'Verify Account', 'CRM Type', 'Company Info', 'Team Size',
    'Discovery', 'Industry', 'Demo Data', 'Company Logo',
  ];
  return labels[step - 1] || '';
}

function StepBar({ step, total }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-8">
      <div className="text-[0.8rem] text-slate-500 mb-2">Step {step} of {total} — {stepLabel(step)}</div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-[width] duration-[400ms]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [vcode, setVcode] = useState('');         // encrypted customer_id from API
  const [loading, setLoading] = useState(false);
  const [setupPct, setSetupPct] = useState(0);
  const [accountName, setAccountName] = useState('');

  // step 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [crmType, setCrmType] = useState('crm');
  const [errors1, setErrors1] = useState({});

  // step 2
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const { show: showPwd, toggle: togglePwd, type: pwdType } = useTogglePassword();
  const { show: showCPwd, toggle: toggleCPwd, type: cPwdType } = useTogglePassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors2, setErrors2] = useState({});

  // steps 3-8
  const [companyName, setCompanyName] = useState('');
  const [gst, setGst] = useState('');
  const [website, setWebsite] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [source, setSource] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [demoData, setDemoData] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  // ── Validate step 1 ──────────────────────────────────────
  const validateStep1 = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Valid email is required';
    if (!phone.trim() || !/^\d{7,15}$/.test(phone.replace(/\s/g, '')))
      errs.phone = 'Valid phone number is required';
    return errs;
  };

  // ── Step 1 submit ────────────────────────────────────────
  const submitStep1 = async (e) => {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors1(errs); return; }
    setErrors1({});
    setLoading(true);
    try {
      const { data } = await registerUser({
        name, email, countryCode, phone,
      });
      if (data.flag === 'F') { toast.error(data.msg || 'Registration failed.'); return; }
      setVcode(data.customer_id);
      toast.success('OTP sent to your email & mobile!');
      setStep(2);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 submit ────────────────────────────────────────
  const submitStep2 = async (e) => {
    e.preventDefault();
    const errs = {};
    if (emailOtp.length < 6) errs.emailOtp = 'Enter 6-digit email OTP';
    if (mobileOtp.length < 6) errs.mobileOtp = 'Enter 6-digit mobile OTP';
    if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors2(errs); return; }
    setErrors2({});
    setLoading(true);
    try {
      const { data } = await verifyDetails({
        emailOTP: emailOtp, mobileOTP: mobileOtp,
        txt_password: password, vcode,
      });
      if (data.flag === 'F') { toast.error(data.msg || 'Verification failed.'); return; }
      setVcode(data.customer_id || vcode);
      toast.success("Account verified! Let's set up your company.");
      setStep(3);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerify({ vcode });
      toast.success('OTP resent successfully!');
    } catch {
      toast.error('Failed to resend OTP.');
    }
  };

  // ── Steps 3-8 nav ────────────────────────────────────────
  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // ── Final submit (step 8 → 9) ────────────────────────────
  const submitCompanySetup = async () => {
    if (!companyName.trim()) { toast.error('Company name is required'); return; }
    setStep(10);
    setSetupPct(0);

    // animate progress
    let pct = 0;
    const iv = setInterval(() => {
      pct += 3;
      if (pct >= 90) { clearInterval(iv); }
      setSetupPct(pct);
    }, 300);

    try {
      const formData = new FormData();
      formData.append('vcode', vcode);
      formData.append('comapnyName', companyName);
      formData.append('gst', gst);
      formData.append('website', website);
      formData.append('company_size', companySize);
      formData.append('source', source);
      formData.append('business_type', businessType);
      formData.append('demo_data', demoData);
      formData.append('crm_type', crmType);
      if (logoFile) formData.append('companyLogo', logoFile);

      const { data } = await companySetup(Object.fromEntries(formData));
      clearInterval(iv);
      setSetupPct(100);

      if (data.flag === 'F') {
        toast.error(data.msg || 'Setup failed. Please try again.');
        setStep(9);
        return;
      }
      setAccountName(data.account_name);
      setTimeout(() => setStep(11), 600);
    } catch {
      clearInterval(iv);
      toast.error('Setup failed. Please contact support.');
      setStep(9);
    }
  };

  // ── Redirect to subdomain ────────────────────────────────
  const redirectToApp = useCallback(() => {
    window.location.href = `https://${accountName}.webtrix24.com/`;
  }, [accountName]);

  // Auto-redirect 5 seconds after reaching the congrats screen
  useEffect(() => {
    if (step === 11 && accountName) {
      const timer = setTimeout(redirectToApp, 5000);
      return () => clearTimeout(timer);
    }
  }, [step, accountName, redirectToApp]);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <LeftPanel />
      <div className="flex flex-col justify-center items-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-[460px]">

          {/* ── STEP 1: Personal details ─────────────────── */}
          {step === 1 && (
            <>
              <div className="mb-8">
                <h1 className="text-[1.75rem] font-bold text-slate-800 mb-1.5">Get Started for Free</h1>
                <p className="text-slate-500 text-[0.95rem]">Create your Webtrix24 account in seconds</p>
              </div>
              <StepBar step={1} total={TOTAL_STEPS} />
              <form onSubmit={submitStep1} noValidate>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-800 mb-2">Full Name <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    className={`w-full px-4 py-2.5 border-[1.5px] rounded-lg text-base leading-normal text-slate-800 bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 ${errors1.name ? 'border-red-500' : 'border-slate-200'}`}
                    type="text" placeholder="John Doe"
                    value={name} onChange={(e) => setName(e.target.value)}
                  />
                  {errors1.name && <div className="text-[0.8rem] text-red-500 mt-1.5 flex items-center gap-1">⚠ {errors1.name}</div>}
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-800 mb-2">Email Address <span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    className={`w-full px-4 py-2.5 border-[1.5px] rounded-lg text-base leading-normal text-slate-800 bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 ${errors1.email ? 'border-red-500' : 'border-slate-200'}`}
                    type="email" placeholder="you@company.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  {errors1.email && <div className="text-[0.8rem] text-red-500 mt-1.5 flex items-center gap-1">⚠ {errors1.email}</div>}
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-800 mb-2">Phone Number <span className="text-red-500 ml-0.5">*</span></label>
                  <div className="grid grid-cols-[110px_1fr] gap-2">
                    <select
                      className="w-full px-3 py-3.5 border-[1.5px] border-slate-200 rounded-lg text-base leading-normal text-slate-800 bg-white outline-none cursor-pointer transition-[border-color] duration-200 focus:border-blue-500"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <input
                      className={`w-full px-4 py-2.5 border-[1.5px] rounded-lg text-base leading-normal text-slate-800 bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 ${errors1.phone ? 'border-red-500' : 'border-slate-200'}`}
                      type="tel" placeholder="9876543210"
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                      maxLength={15}
                    />
                  </div>
                  {errors1.phone && <div className="text-[0.8rem] text-red-500 mt-1.5 flex items-center gap-1">⚠ {errors1.phone}</div>}
                </div>

                <div className="mb-5 text-[0.8rem] text-slate-500">
                  By registering you accept our{' '}
                  <a href="https://www.webtrix24.com/terms" target="_blank" rel="noreferrer" className="text-blue-600 no-underline font-medium hover:underline">Terms of Use</a>{' '}
                  and{' '}
                  <a href="https://www.webtrix24.com/privacy" target="_blank" rel="noreferrer" className="text-blue-600 no-underline font-medium hover:underline">Privacy Policy</a>.
                </div>

                <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white cursor-pointer border-none transition-all duration-200 hover:bg-blue-700 hover:-translate-y-px hover:shadow-md disabled:opacity-65 disabled:cursor-not-allowed" type="submit" disabled={loading}>
                  {loading ? <><span className="inline-block w-[18px] h-[18px] border-2 border-white/40 border-t-white rounded-full animate-spin" /> Please wait…</> : 'Continue →'}
                </button>
              </form>
              <div className="mt-6 text-center text-[0.875rem] text-slate-500">
                Already have an account? <Link to="/login" className="text-blue-600 no-underline font-medium hover:underline">Sign In</Link>
              </div>
            </>
          )}

          {/* ── STEP 2: OTP + Password ───────────────────── */}
          {step === 2 && (
            <>
              <div className="mb-8">
                <h1 className="text-[1.75rem] font-bold text-slate-800 mb-1.5">Verify Your Account</h1>
                <p className="text-slate-500 text-[0.95rem]">We sent OTPs to <strong>{email}</strong> and your mobile</p>
              </div>
              <StepBar step={2} total={TOTAL_STEPS} />
              <form onSubmit={submitStep2} noValidate>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-800 mb-2">Email OTP <span className="text-red-500 ml-0.5">*</span></label>
                  <OtpInput length={6} value={emailOtp} onChange={setEmailOtp} />
                  {errors2.emailOtp && <div className="text-[0.8rem] text-red-500 mt-1.5 flex items-center justify-center gap-1">⚠ {errors2.emailOtp}</div>}
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-800 mb-2">Mobile OTP <span className="text-red-500 ml-0.5">*</span></label>
                  <OtpInput length={6} value={mobileOtp} onChange={setMobileOtp} />
                  {errors2.mobileOtp && <div className="text-[0.8rem] text-red-500 mt-1.5 flex items-center justify-center gap-1">⚠ {errors2.mobileOtp}</div>}
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-800 mb-2">Set Password <span className="text-red-500 ml-0.5">*</span></label>
                  <div className="relative">
                    <input
                      className={`w-full px-4 py-2.5 pr-12 border-[1.5px] rounded-lg text-base leading-normal text-slate-800 bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 ${errors2.password ? 'border-red-500' : 'border-slate-200'}`}
                      type={pwdType} placeholder="Min 6 characters"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 flex items-center" onClick={togglePwd} tabIndex={-1}>{showPwd ? '🙈' : '👁'}</button>
                  </div>
                  {errors2.password && <div className="text-[0.8rem] text-red-500 mt-1.5 flex items-center gap-1">⚠ {errors2.password}</div>}
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-800 mb-2">Confirm Password <span className="text-red-500 ml-0.5">*</span></label>
                  <div className="relative">
                    <input
                      className={`w-full px-4 py-2.5 pr-12 border-[1.5px] rounded-lg text-base leading-normal text-slate-800 bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 ${errors2.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}
                      type={cPwdType} placeholder="Re-enter password"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 flex items-center" onClick={toggleCPwd} tabIndex={-1}>{showCPwd ? '🙈' : '👁'}</button>
                  </div>
                  {errors2.confirmPassword && <div className="text-[0.8rem] text-red-500 mt-1.5 flex items-center gap-1">⚠ {errors2.confirmPassword}</div>}
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-transparent text-slate-500 border-[1.5px] border-slate-200 cursor-pointer transition-all duration-200 hover:bg-slate-50" onClick={() => setStep(1)}>← Back</button>
                  <button className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white cursor-pointer border-none transition-all duration-200 hover:bg-blue-700 disabled:opacity-65 disabled:cursor-not-allowed" type="submit" disabled={loading}>
                    {loading ? <><span className="inline-block w-[18px] h-[18px] border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying…</> : 'Verify & Continue →'}
                  </button>
                </div>
              </form>
              <div className="mt-6 text-center text-[0.875rem] text-slate-500">
                Didn't receive OTP?{' '}
                <button className="text-blue-600 font-medium bg-transparent border-none cursor-pointer font-[inherit] text-[inherit] hover:underline" onClick={handleResend}>
                  Resend
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: CRM type ─────────────────────────── */}
          {step === 3 && (
            <>
              <div className="mb-8">
                <h1 className="text-[1.75rem] font-bold text-slate-800 mb-1.5">Choose Your CRM</h1>
                <p className="text-slate-500 text-[0.95rem]">Select the type of CRM that best fits your business</p>
              </div>
              <StepBar step={3} total={TOTAL_STEPS} />
              <div className="mb-5">
                <CrmTypeSelector value={crmType} onChange={setCrmType} />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-transparent text-slate-500 border-[1.5px] border-slate-200 cursor-pointer transition-all duration-200 hover:bg-slate-50" onClick={prev}>← Back</button>
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white cursor-pointer border-none transition-all duration-200 hover:bg-blue-700" onClick={next}>Next →</button>
              </div>
            </>
          )}

          {/* ── STEP 4: Company info ─────────────────────── */}
          {step === 4 && (
            <>
              <div className="mb-8">
                <h1 className="text-[1.75rem] font-bold text-slate-800 mb-1.5">Company Details</h1>
                <p className="text-slate-500 text-[0.95rem]">Tell us a bit about your business</p>
              </div>
              <StepBar step={4} total={TOTAL_STEPS} />
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-800 mb-2">Company Name <span className="text-red-500 ml-0.5">*</span></label>
                <input
                  className="w-full px-4 py-2.5 border-[1.5px] border-slate-200 rounded-lg text-base leading-normal text-slate-800 bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10" type="text" placeholder="Acme Pvt Ltd"
                  value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-800 mb-2">GST Number <span className="text-slate-500 font-normal">(optional)</span></label>
                <input
                  className="w-full px-4 py-2.5 border-[1.5px] border-slate-200 rounded-lg text-base leading-normal text-slate-800 bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10" type="text" placeholder="22AAAAA0000A1Z5"
                  value={gst} onChange={(e) => setGst(e.target.value)}
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-800 mb-2">Company Website <span className="text-slate-500 font-normal">(optional)</span></label>
                <input
                  className="w-full px-4 py-2.5 border-[1.5px] border-slate-200 rounded-lg text-base leading-normal text-slate-800 bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10" type="url" placeholder="https://yourcompany.com"
                  value={website} onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-transparent text-slate-500 border-[1.5px] border-slate-200 cursor-pointer transition-all duration-200 hover:bg-slate-50" onClick={prev}>← Back</button>
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white cursor-pointer border-none transition-all duration-200 hover:bg-blue-700" onClick={() => {
                  if (!companyName.trim()) { toast.error('Company name is required'); return; }
                  next();
                }}>
                  Next →
                </button>
              </div>
            </>
          )}

          {/* ── STEP 5: Company size ─────────────────────── */}
          {step === 5 && (
            <>
              <div className="mb-8">
                <h1 className="text-[1.75rem] font-bold text-slate-800 mb-1.5">Team Size</h1>
                <p className="text-slate-500 text-[0.95rem]">How many people are in your organisation?</p>
              </div>
              <StepBar step={5} total={TOTAL_STEPS} />
              <div className="mb-5">
                <ChipSelector options={COMPANY_SIZES} value={companySize} onChange={setCompanySize} single />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-transparent text-slate-500 border-[1.5px] border-slate-200 cursor-pointer transition-all duration-200 hover:bg-slate-50" onClick={prev}>← Back</button>
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white cursor-pointer border-none transition-all duration-200 hover:bg-blue-700" onClick={next}>Next →</button>
              </div>
            </>
          )}

          {/* ── STEP 6: Discovery ────────────────────────── */}
          {step === 6 && (
            <>
              <div className="mb-8">
                <h1 className="text-[1.75rem] font-bold text-slate-800 mb-1.5">How Did You Hear About Us?</h1>
                <p className="text-slate-500 text-[0.95rem]">Help us understand how you found Webtrix24</p>
              </div>
              <StepBar step={6} total={TOTAL_STEPS} />
              <div className="mb-5">
                <ChipSelector options={LEAD_SOURCES} value={source} onChange={setSource} single />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-transparent text-slate-500 border-[1.5px] border-slate-200 cursor-pointer transition-all duration-200 hover:bg-slate-50" onClick={prev}>← Back</button>
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white cursor-pointer border-none transition-all duration-200 hover:bg-blue-700" onClick={next}>Next →</button>
              </div>
            </>
          )}

          {/* ── STEP 7: Business type ────────────────────── */}
          {step === 7 && (
            <>
              <div className="mb-8">
                <h1 className="text-[1.75rem] font-bold text-slate-800 mb-1.5">Your Industry</h1>
                <p className="text-slate-500 text-[0.95rem]">Which sector does your business operate in?</p>
              </div>
              <StepBar step={7} total={TOTAL_STEPS} />
              <div className="mb-5">
                <ChipSelector options={BUSINESS_TYPES} value={businessType} onChange={setBusinessType} single />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-transparent text-slate-500 border-[1.5px] border-slate-200 cursor-pointer transition-all duration-200 hover:bg-slate-50" onClick={prev}>← Back</button>
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white cursor-pointer border-none transition-all duration-200 hover:bg-blue-700" onClick={next}>Next →</button>
              </div>
            </>
          )}

          {/* ── STEP 8: Demo data ────────────────────────── */}
          {step === 8 && (
            <>
              <div className="mb-8">
                <h1 className="text-[1.75rem] font-bold text-slate-800 mb-1.5">Demo Data</h1>
                <p className="text-slate-500 text-[0.95rem]">Would you like us to pre-fill your account with sample data?</p>
              </div>
              <StepBar step={8} total={TOTAL_STEPS} />
              <div className="mb-5">
                <ChipSelector options={['Yes', 'No']} value={demoData} onChange={setDemoData} single />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-transparent text-slate-500 border-[1.5px] border-slate-200 cursor-pointer transition-all duration-200 hover:bg-slate-50" onClick={prev}>← Back</button>
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white cursor-pointer border-none transition-all duration-200 hover:bg-blue-700" onClick={next}>Next →</button>
              </div>
            </>
          )}

          {/* ── STEP 9: Logo upload ──────────────────────── */}
          {step === 9 && (
            <>
              <div className="mb-8">
                <h1 className="text-[1.75rem] font-bold text-slate-800 mb-1.5">Company Logo</h1>
                <p className="text-slate-500 text-[0.95rem]">Upload a PNG/JPG (200×140 px recommended)</p>
              </div>
              <StepBar step={9} total={TOTAL_STEPS} />
              <label className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 block hover:border-blue-600 hover:bg-blue-50">
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-cover rounded-lg mt-3 mx-auto" />
                ) : (
                  <>
                    <div className="text-4xl mb-2">🖼️</div>
                    <div className="font-semibold mb-1">Click to upload</div>
                    <div className="text-[0.8rem] text-slate-500">PNG or JPG, max 2 MB</div>
                  </>
                )}
              </label>
              <div className="text-[0.8rem] text-slate-500 mt-3">
                <ul className="pl-5">
                  <li>Use a PNG file for better results.</li>
                  <li>Dimensions: 200×140 px recommended.</li>
                </ul>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-transparent text-slate-500 border-[1.5px] border-slate-200 cursor-pointer transition-all duration-200 hover:bg-slate-50" onClick={prev}>← Back</button>
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white cursor-pointer border-none transition-all duration-200 hover:bg-blue-700 disabled:opacity-65 disabled:cursor-not-allowed"
                  onClick={submitCompanySetup}
                  disabled={loading}
                >
                  {loading ? <><span className="inline-block w-[18px] h-[18px] border-2 border-white/40 border-t-white rounded-full animate-spin" /> Setting up…</> : 'Submit & Launch 🚀'}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 10: Setup in progress ───────────────── */}
          {step === 10 && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">⚙️</div>
              <h2 className="text-[1.5rem] font-bold text-slate-800 mb-2">Setting Up Your Workspace</h2>
              <p className="text-slate-500">
                We're creating your subdomain and database. This takes just a moment…
              </p>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden my-6">
                <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-[width] duration-300" style={{ width: `${setupPct}%` }} />
              </div>
              <div className="text-[0.875rem] text-slate-500">{setupPct}% complete</div>
            </div>
          )}

          {/* ── STEP 11: Congratulations ─────────────────── */}
          {step === 11 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-[1.5rem] font-bold text-slate-800 mb-2">Congratulations!</h2>
              <p className="text-slate-500 mb-6">Your Webtrix24 workspace is ready. Welcome aboard!</p>
              {accountName && (
                <p className="text-slate-500 mb-6">
                  Your subdomain:{' '}
                  <strong>{accountName}.webtrix24.com</strong>
                </p>
              )}
              <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white cursor-pointer border-none transition-all duration-200 hover:bg-blue-700" onClick={redirectToApp}>
                Go to My Dashboard →
              </button>
              <div className="text-[0.85rem] text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                <span className="inline-block w-[18px] h-[18px] border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                Redirecting automatically in 5 seconds…
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
