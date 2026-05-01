import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/admin/index.php/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// ── Registration step 1: personal details ──────────────────
export const registerUser = (data) =>
  api.put('registeruser', new URLSearchParams(data));

// ── Email + Mobile OTP verification + password ─────────────
export const verifyDetails = (data) =>
  api.post('verifydDetails', new URLSearchParams(data));

// ── Company setup (multi-step form 1-6) ────────────────────
export const companySetup = (data) =>
  api.post('companySetup', new URLSearchParams(data));

// ── Re-send OTP ────────────────────────────────────────────
export const resendVerify = (data) =>
  api.post('resendVerifyDetails', new URLSearchParams(data));

// ── Check verify status ────────────────────────────────────
export const checkVerifyDetails = (data) =>
  api.post('checkVerifyDetails', new URLSearchParams(data));

// ── Login ──────────────────────────────────────────────────
export const loginUser = (data) =>
  api.post('login', new URLSearchParams(data));

// ── Get account / portal URL by account_id ─────────────────
export const getUserAccount = (data) =>
  api.post('userAccount', new URLSearchParams(data));

// ── Reset password request ─────────────────────────────────
export const resetPasswordRequest = (data) =>
  api.post('resetPasswordRequest', new URLSearchParams(data));

// ── Reset password ─────────────────────────────────────────
export const resetPassword = (data) =>
  api.post('resetpassword', new URLSearchParams(data));

// ── Login template / slides ────────────────────────────────
export const getLoginSlides = () =>
  api.post('logintemplate/getLoginTemplateList', new URLSearchParams({ status: 'active', getAll: 'Y' }));
