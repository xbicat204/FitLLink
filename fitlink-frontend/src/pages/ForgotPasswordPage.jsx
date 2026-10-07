import React from "react";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { sendForgotPasswordRequest } from "@/services/authService";
import { Link } from 'react-router-dom';

const schema = yup.object().shape({
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^0\d{9}$/, 'Invalid phone number format'),
});

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async ({ phone }) => {
    try {
      await sendForgotPasswordRequest({ phone });
      toast.success('✅ A reset link has been sent to your email!');
    } catch (err) {
      toast.error(err?.response?.data?.message || '❌ Failed to send reset link!');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0e0e0e] text-white">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-wide text-[#ff4d00]"
        >
          FITLINK
        </Link>
      </header>

      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left / Hero block */}
          <div className="relative hidden md:flex flex-col justify-end rounded-2xl overflow-hidden bg-[#111] shadow-2xl border border-[#1f1f1f]">
            {/* <img
              src="/as/forgot-password-gym.jpg"
              alt="Forgot password illustration"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            /> */}
            <div className="relative p-8 bg-gradient-to-t from-black/70 to-transparent">
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Forgot your <span className="text-[#ff4d00]">Password?</span>
              </h2>
              <p className="text-gray-200 mt-3 max-w-md">
                Enter your registered phone number — we’ll send a reset link to the associated email.
              </p>
              <div className="mt-8">
                <img
                  src="/forgot-password.png"
                  alt="Forgot password"
                  className="w-full h-auto max-w-sm rounded-lg opacity-90"
                />
              </div>
            </div>
          </div>

          {/* Right / Form */}
          <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#262626] p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#ff4d00]">
                Forgot Password
              </h1>
              <p className="text-gray-400 mt-1">
                Enter your phone number to receive a password reset link via email
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="0xxxxxxxxx"
                  {...register('phone')}
                  className="w-full rounded-lg border border-[#333] bg-[#0e0e0e] text-white placeholder-gray-500 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[#ff4d00] hover:bg-[#ff661a] text-white font-semibold py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Send reset link'}
              </button>

              <p className="text-sm text-center text-gray-400">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-[#ff4d00] font-medium hover:underline"
                >
                  Go back to login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
