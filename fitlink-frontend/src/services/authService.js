import axios from "@/api/axiosClient";

const normalizePhone = (phone) =>
  String(phone || "")
    .trim()
    .replace(/[\s.-]/g, "")
    .replace(/^(\+84|84)/, "0");

export const loginWithGoogle = async (idToken) => {
  try {
    // cookie được set bởi backend, frontend không cần lưu token
    const res = await axios.post('/auth/google', { idToken }, { skipErrorToast: true });
    return res.data; // chỉ cần user
  } catch (error) {
    console.error('Google login failed:', error);
    throw error;
  }
};

export const login = async (phone, password) => {
    try {
        const res = await axios.post('/auth/login', { phone: normalizePhone(phone), password }, { skipErrorToast: true });
        // setToken(res.data.accessToken);
        return res.data;
    } catch (error) {
        console.error('Login failed:', error); // xử lý lỗi cụ thể
        throw error;
    }

};

export const registerByPhone = async (name, phone, password, email) => {
    try {
        const res = await axios.post('/auth/register', { phone: normalizePhone(phone), password, name, email }, { skipErrorToast: true });
        // setToken(res.data.accessToken);
        return res.data;
    } catch (error) {
        console.error('Register failed:', error); // xử lý lỗi cụ thể
        throw error;
    }
}

export const logout = async () => {
    try {
        await axios.post('/auth/logout', {}, { skipErrorToast: true })
    } catch (error) {
        console.error('Logout failed:', error); // xử lý lỗi cụ thể
        throw error;
    }
}

export const sendForgotPasswordRequest = async ({ phone }) => {
  return await axios.post('/auth/forgot-password', { phone: normalizePhone(phone) }, { skipErrorToast: true });
};

export const resetPassword = async (token, newPassword, confirmPassword) => {
  const res = await axios.post(`/auth/reset-password/${token}`, { password: newPassword, confirmPassword }, { skipErrorToast: true });
  return res.data;
};

export const registerStart = async ({ name, phone, password, email, role }) => {  
  const res = await axios.post('/auth/register/start', { name, phone: normalizePhone(phone), password, email, role }, { skipErrorToast: true });
  return res.data;
};


