import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import LeftPanel from '../components/LeftPanel';
import { useTogglePassword } from '../hooks/useTogglePassword';
import { loginUser, getUserAccount } from '../api/auth';

export default function LoginPage() {
  const [form, setForm] = useState({ account_id: '', txt_username: '', txt_password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { show, toggle, type } = useTogglePassword();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.account_id.trim()) errs.account_id = 'Account ID is required';
    if (!form.txt_username.trim()) errs.txt_username = 'Username / Email / Mobile is required';
    if (!form.txt_password) errs.txt_password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      // Step 1: Verify account_id exists and get the portal URL
      const { data: accountData } = await getUserAccount({ account_id: form.account_id });
      if (accountData.flag === 'F') {
        toast.error(accountData.msg || 'Account not found. Please check your Account ID.');
        return;
      }
      const domainURL = accountData.data?.domainURL;
      if (!domainURL) {
        toast.error('Could not resolve portal. Please contact support.');
        return;
      }

      // // Step 2: Attempt login with full credentials
      // const { data } = await loginUser(form);
      // if (data.flag === 'F') {
      //   toast.error(data.msg || 'Login failed. Please try again.');
      //   return;
      // }

      // // Step 3: Redirect to the customer's portal with a session token
      // const token = data.loginkey;
      //window.location.href = `${domainURL}#login?token=${encodeURIComponent(token)}`;
      window.location.href = `${domainURL}#login`;
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <LeftPanel />
      <div className="flex flex-col justify-center items-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-[460px]">
          <div className="mb-8">
            <h1 className="text-[1.75rem] font-bold text-slate-800 mb-1.5">Welcome back</h1>
            <p className="text-slate-500 text-[0.95rem]">Sign in to your Webtrix24 account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-800 mb-2">Account ID <span className="text-red-500 ml-0.5">*</span></label>
              <input
                className={`w-full px-4 py-2.5 border-[1.5px] rounded-lg text-base leading-normal text-slate-800 bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 ${errors.account_id ? 'border-red-500' : 'border-slate-200'}`}
                type="text"
                placeholder="e.g. WS-0001 12"
                value={form.account_id}
                onChange={set('account_id')}
                autoComplete="username"
              />
              {errors.account_id && <div className="text-[0.8rem] text-red-500 mt-1.5 flex items-center gap-1">⚠ {errors.account_id}</div>}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-800 mb-2">Username / Email / Mobile <span className="text-red-500 ml-0.5">*</span></label>
              <input
                className={`w-full px-4 py-2.5 border-[1.5px] rounded-lg text-base leading-normal text-slate-800 bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 ${errors.txt_username ? 'border-red-500' : 'border-slate-200'}`}
                type="text"
                placeholder="Username, email or mobile"
                value={form.txt_username}
                onChange={set('txt_username')}
                autoComplete="username"
              />
              {errors.txt_username && <div className="text-[0.8rem] text-red-500 mt-1.5 flex items-center gap-1">⚠ {errors.txt_username}</div>}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-800 mb-2">Password <span className="text-red-500 ml-0.5">*</span></label>
              <div className="relative">
                <input
                  className={`w-full px-4 py-2.5 pr-12 border-[1.5px] rounded-lg text-base leading-normal text-slate-800 bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 ${errors.txt_password ? 'border-red-500' : 'border-slate-200'}`}
                  type={type}
                  placeholder="Enter your password"
                  value={form.txt_password}
                  onChange={set('txt_password')}
                  autoComplete="current-password"
                />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 flex items-center" onClick={toggle} tabIndex={-1}>
                  {show ? '🙈' : '👁'}
                </button>
              </div>
              {errors.txt_password && <div className="text-[0.8rem] text-red-500 mt-1.5 flex items-center gap-1">⚠ {errors.txt_password}</div>}
            </div>

            <div className="flex justify-end -mt-2 mb-5">
              <Link to="/forgot-password" className="text-[0.875rem] text-blue-600 no-underline font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white cursor-pointer border-none transition-all duration-200 hover:bg-blue-700 hover:-translate-y-px hover:shadow-md disabled:opacity-65 disabled:cursor-not-allowed" type="submit" disabled={loading}>
              {loading ? <><span className="inline-block w-[18px] h-[18px] border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-[0.875rem] text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 no-underline font-medium hover:underline">Create one for free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
