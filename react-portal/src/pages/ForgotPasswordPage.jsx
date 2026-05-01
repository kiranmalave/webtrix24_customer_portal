import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import LeftPanel from '../components/LeftPanel';
import { resetPasswordRequest } from '../api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email address.'); return; }
    setLoading(true);
    try {
      const { data } = await resetPasswordRequest({ email });
      if (data.flag === 'F') { toast.error(data.msg || 'Request failed.'); return; }
      setSent(true);
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
            <h1 className="text-[1.75rem] font-bold text-slate-800 mb-1.5">Reset Password</h1>
            <p className="text-slate-500 text-[0.95rem]">Enter your email to receive a reset link</p>
          </div>
          {sent ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📬</div>
              <h3 className="font-bold text-slate-800 mb-2">Check your inbox</h3>
              <p className="text-slate-500 mb-6">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <Link to="/login" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white no-underline transition-all duration-200 hover:bg-blue-700">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-800 mb-2">Email Address <span className="text-red-500 ml-0.5">*</span></label>
                <input
                  className="w-full px-4 py-2.5 border-[1.5px] border-slate-200 rounded-lg text-base leading-normal text-slate-800 bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold bg-blue-600 text-white cursor-pointer border-none transition-all duration-200 hover:bg-blue-700 hover:-translate-y-px hover:shadow-md disabled:opacity-65 disabled:cursor-not-allowed" type="submit" disabled={loading}>
                {loading ? <><span className="inline-block w-[18px] h-[18px] border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</> : 'Send Reset Link'}
              </button>
              <div className="mt-6 text-center text-[0.875rem] text-slate-500">
                <Link to="/login" className="text-blue-600 no-underline font-medium hover:underline">← Back to Sign In</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
