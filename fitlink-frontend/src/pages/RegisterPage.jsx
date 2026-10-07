// pages/RegisterPage.jsx
import React from "react";
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';
import { registerStart } from "@/services/authService";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const normalizePhone = (phone) =>
  String(phone || '')
    .trim()
    .replace(/[\s.-]/g, '')
    .replace(/^(\+84|84)/, '0');

const schema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup
    .string()
    .transform((value) => normalizePhone(value))
    .required('Phone is required')
    .matches(/^0\d{9}$/, 'Phone format is invalid'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords do not match')
    .required('Password confirmation is required')
});

export default function RegisterPage() {
  const navigate = useNavigate();
  // role switch + slide
  const [role, setRole] = React.useState('student'); // 'student' | 'pt'
  const [animating, setAnimating] = React.useState(false);

  // form instances tách riêng
  const {
    register: registerStudent,
    handleSubmit: handleSubmitStudent,
    getValues: getValuesStudent,
    formState: { errors: errorsStudent, isSubmitting: isSubmittingStudent }
  } = useForm({ resolver: yupResolver(schema) });

  const {
    register: registerPT,
    handleSubmit: handleSubmitPT,
    formState: { errors: errorsPT, isSubmitting: isSubmittingPT }
  } = useForm({ resolver: yupResolver(schema) });

  // email countdown (Student)
  const [emailSent, setEmailSent] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(180);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  React.useEffect(() => {
    if (!emailSent || secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [emailSent, secondsLeft]);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // submit Student
  const onSubmitStudent = async ({ name, phone, password, email }) => {
    try {
      const res = await registerStart({ name, phone, password, email, role: 'student' });
      if (res?.requiresVerification === false) {
        toast.success(res.message || 'Account created successfully. Please sign in.');
        navigate('/login');
        return;
      }
      setEmailSent(true);
      setSecondsLeft(180);
      setResendCooldown(60);
      toast.success('Verification email sent. Please check your inbox within 3 minutes.');
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || 'Registration failed');
    }
  };

  // resend Student
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const { name, phone, password, email } = getValuesStudent();
      const res = await registerStart({ name, phone, password, email, role: 'student' });
      if (res?.requiresVerification === false) {
        toast.success(res.message || 'Account created successfully. Please sign in.');
        navigate('/login');
        return;
      }
      setSecondsLeft(180);
      setResendCooldown(60);
      toast.success('Verification email re-sent');
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || 'Re-send failed');
    }
  };

  // submit PT
  const onSubmitPT = async ({ name, phone, password, email }) => {
    try {
      const res = await registerStart({ name, phone, password, email, role: 'pt' });
      toast.success(res?.message || 'Registered as PT. Please complete your profile in Dashboard and submit for approval.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || 'Registration failed');
    }
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${ss.toString().padStart(2, '0')}`;
  };

  const switchRole = (next) => {
    if (next === role) return;
    setAnimating(true);
    setTimeout(() => {
      setRole(next);
      if (next === 'pt') setEmailSent(false); // ẩn UI email student khi chuyển sang PT
      setAnimating(false);
    }, 250);
  };

  return (
    <div className="min-h-screen w-full bg-[#0e0e0e] text-white">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold tracking-wide text-[#ff4d00]">
          FITLINK
        </Link>

        {/* Toggle role */}
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => switchRole('student')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${role === 'student' ? 'bg-[#ff4d00] text-white' : 'bg-transparent text-gray-400 hover:text-white'
              }`}
          >
            I’m a Student
          </button>
          <button
            onClick={() => switchRole('pt')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${role === 'pt' ? 'bg-[#ff4d00] text-white' : 'bg-transparent text-gray-400 hover:text-white'
              }`}
          >
            I’m a PT
          </button>
        </div>
      </header>

      {/* Two “pages” (each page = 2 columns). Slide horizontally */}
      <div className="mx-auto max-w-6xl px-6 pb-10 overflow-hidden rounded-2xl">
        <div
          className={`w-[200%] flex transition-transform duration-300 ease-in-out ${animating ? 'opacity-90' : ''} ${role === 'student' ? 'translate-x-0' : '-translate-x-1/2'
            }`}
        >
          {/* PAGE 1: Student (Left = Hero, Right = Student Form) */}
          <section className="w-1/2 flex-none grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pr-3">
            {/* Left / Hero */}
            <div className="relative hidden md:flex flex-col justify-end rounded-2xl overflow-hidden bg-[#111] shadow-2xl border border-[#1f1f1f]">
              <img
                src="/as/fitness-register.jpg"
                alt="Gym"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="relative p-8 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-sm tracking-wider text-gray-300/90 mb-3">SINCE • 1998</p>
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                  Build Your <span className="text-[#ff4d00]">Best Self</span>
                </h2>
                <p className="text-gray-200 mt-3 max-w-md">
                  Join personalized coaching and nutrition programs. Track your progress easily.
                </p>
                <button
                  type="button"
                  onClick={() => (window.location.href = '/')}
                  className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#ff4d00] hover:bg-[#ff661a] text-white px-5 py-3 font-semibold transition"
                >
                  Explore programs
                </button>
              </div>
            </div>

            {/* Right / Student Form */}
            <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#262626] p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#ff4d00]">Create Account</h1>
                <p className="text-gray-400 mt-1">Default registration role is Student.</p>
              </div>

              {!emailSent ? (
                <form onSubmit={handleSubmitStudent(onSubmitStudent)} className="space-y-4">
                  <Input label="Full name" name="name" register={registerStudent} errors={errorsStudent} />
                  <Input label="Email" name="email" register={registerStudent} errors={errorsStudent} />
                  <Input label="Phone number" name="phone" register={registerStudent} errors={errorsStudent} />
                  <Input label="Password" name="password" type="password" register={registerStudent} errors={errorsStudent} />
                  <Input label="Confirm password" name="confirmPassword" type="password" register={registerStudent} errors={errorsStudent} />
                  <button
                    type="submit"
                    disabled={isSubmittingStudent}
                    className="w-full rounded-lg bg-[#ff4d00] hover:bg-[#ff661a] text-white font-semibold py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmittingStudent ? 'Sending…' : 'Send verification email'}
                  </button>
                  <p className="text-sm text-center text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#ff4d00] font-medium hover:underline">
                      Sign in
                    </Link>
                  </p>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-black/30 border border-[#2a2a2a] p-4">
                    <p className="text-gray-200">
                      We’ve sent a verification email. Please check your inbox within <b className="text-[#ffb380]">3 minutes</b>.
                    </p>
                    <p className="text-gray-300 mt-1">
                      Link expires in: <b className="text-[#ffb380]">{fmt(secondsLeft)}</b>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className="w-full rounded-lg bg-[#ff4d00] hover:bg-[#ff661a] text-white font-semibold py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
                  </button>

                  <p className="text-sm text-center text-gray-400">
                    After verifying your email, you can{' '}
                    <Link to="/login" className="text-[#ff4d00] font-medium hover:underline">
                      sign in
                    </Link>.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* PAGE 2: PT (Left = PT Account Form, Right = PT Profile Basic) */}
          <section className="w-1/2 flex-none grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pl-3">
            {/* Left / PT Account Form */}
            <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#262626] p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#ff4d00]">Create Account</h1>
                <p className="text-gray-400 mt-1">
                  After registering, complete your profile in the Dashboard and submit for Admin approval.
                </p>
              </div>
              <form onSubmit={handleSubmitPT(onSubmitPT)} className="space-y-4">
                <Input label="Full name" name="name" register={registerPT} errors={errorsPT} />
                <Input label="Email" name="email" register={registerPT} errors={errorsPT} />
                <Input label="Phone number" name="phone" register={registerPT} errors={errorsPT} />
                <Input label="Password" name="password" type="password" register={registerPT} errors={errorsPT} />
                <Input label="Confirm password" name="confirmPassword" type="password" register={registerPT} errors={errorsPT} />

                {/* Disabled for now — you’ll wire API later */}
                {/* in the PT form button: remove disabled + change label */}
                <button
                  type="submit"
                  disabled={isSubmittingPT}
                  className="w-full rounded-lg bg-[#ff4d00] hover:bg-[#ff661a] text-white font-semibold py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmittingPT ? 'Sending…' : 'Register as PT'}
                </button>

              </form>
            </div>

            {/* Right / PT Profile Basic (replaces the hero) */}
            <div className="relative rounded-2xl overflow-hidden bg-[#111] shadow-2xl border border-[#1f1f1f] p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-2">PT profile basics</h2>
              <p className="text-gray-400 mb-4 text-sm">
                You can skip for now. After registration, finish your profile in the Dashboard and submit for approval.
              </p>

              <div className="grid grid-cols-1 gap-3">
                <label className="text-sm text-gray-300">Short bio
                  <textarea className="mt-1 w-full rounded-lg border border-[#333] bg-[#0e0e0e] text-white px-3 py-2" rows={3} placeholder="A short intro…" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm text-gray-300">Years of experience
                    <input className="mt-1 w-full rounded-lg border border-[#333] bg-[#0e0e0e] text-white px-3 py-2" type="number" min="0" placeholder="0" />
                  </label>
                  <label className="text-sm text-gray-300">Specialties
                    <input className="mt-1 w-full rounded-lg border border-[#333] bg-[#0e0e0e] text-white px-3 py-2" placeholder="fat loss, hypertrophy" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm text-gray-300">Primary Gym — Name
                    <input className="mt-1 w-full rounded-lg border border-[#333] bg-[#0e0e0e] text-white px-3 py-2" placeholder="Iron Gym…" />
                  </label>
                  <label className="text-sm text-gray-300">Primary Gym — Address
                    <input className="mt-1 w-full rounded-lg border border-[#333] bg-[#0e0e0e] text-white px-3 py-2" placeholder="Address…" />
                  </label>
                </div>

                <div className="rounded-lg bg-black/30 border border-[#2a2a2a] p-3 text-sm text-gray-300">
                  💡 Tip: You’ll see a banner in the Dashboard reminding you to complete the profile and “Submit for review”.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Reusable input
function Input({ label, name, register, errors, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        placeholder={label}
        {...register(name)}
        className="w-full rounded-lg border border-[#333] bg-[#0e0e0e] text-white placeholder-gray-500 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent"
      />
      {errors?.[name] && <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>}
    </div>
  );
}
