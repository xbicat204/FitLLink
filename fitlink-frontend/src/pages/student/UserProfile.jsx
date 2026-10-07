import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import MainLayout from '@/layouts/MainLayout';
import { userService } from "@/services";
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthProvider';

const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên là bắt buộc')
    .min(2, 'Tên phải từ 2 ký tự')
    .max(30, 'Tên tối đa 30 ký tự'),
  email: yup
    .string()
    .email('Email không đúng định dạng'),
  gender: yup
    .string()
    .oneOf(['male', 'female', 'other'], 'Giới tính không hợp lệ'),
  address: yup
    .string(),
  dob: yup
    .date()
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === '' ? null : value;
    })
});

const passwordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Mật khẩu hiện tại là bắt buộc'),
  newPassword: yup
    .string()
    .required('Mật khẩu mới là bắt buộc')
    .min(6, 'Mật khẩu ít nhất 6 ký tự'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Mật khẩu xác nhận không khớp')
    .required('Xác nhận mật khẩu là bắt buộc')
});

export default function UserProfile() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    reset: resetProfile
  } = useForm({
    resolver: yupResolver(profileSchema)
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPassword
  } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileData = await userService.getUserProfile();
        resetProfile({
          name: profileData.name || '',
          email: profileData.email || '',
          gender: profileData.gender || '',
          address: profileData.address || '',
          dob: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : ''
        });
      } catch (error) {
        toast.error('Không thể tải thông tin profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [resetProfile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitProfile = async (data) => {
    try {
      const response = await userService.updateProfile(data, avatarFile);
      // Update AuthProvider context with the updated profile
      // The backend returns { message, user }, so we need to extract the user
      setUser(response.user);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Cập nhật profile thành công!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Cập nhật profile thất bại');
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Đổi mật khẩu thành công!');
      resetPassword();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 min-h-screen bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-32 pb-16 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-orange-600 font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {user?.name || 'Người dùng'}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500">Số điện thoại: {user?.phone}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Thông tin cá nhân
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'password'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Đổi mật khẩu
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        {...registerProfile('name')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Nhập họ và tên"
                      />
                      {profileErrors.name && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        {...registerProfile('email')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Nhập email"
                      />
                      {profileErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới tính
                      </label>
                      <select
                        {...registerProfile('gender')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                      {profileErrors.gender && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.gender.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        {...registerProfile('dob')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      {profileErrors.dob && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.dob.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <textarea
                      {...registerProfile('address')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Nhập địa chỉ"
                    />
                    {profileErrors.address && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                        ) : user?.avatar ? (
                          <img src={user.avatar} alt="Current avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingProfile}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingProfile ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu hiện tại *
                    </label>
                    <input
                      type="password"
                      {...registerPassword('currentPassword')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới *
                    </label>
                    <input
                      type="password"
                      {...registerPassword('newPassword')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Nhập mật khẩu mới"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu mới *
                    </label>
                    <input
                      type="password"
                      {...registerPassword('confirmPassword')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Xác nhận mật khẩu mới"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingPassword}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}