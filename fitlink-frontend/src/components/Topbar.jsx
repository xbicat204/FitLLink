import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { logout } from '@/services/authService';
import { toast } from 'react-toastify';
import { Navigate, useNavigate } from 'react-router-dom';
import PetModal from '@/components/pet/PetModel';

export default function Topbar() {
  const { user } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);

  const dropdownRef = useRef();
  const navigate = useNavigate()

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClickLogout = async () => {
    try {
      await logout()
      toast.success("Logout Successful!")
      navigate('/login')

    } catch (error) {
      console.error('Logout failed:', error); // xử lý lỗi cụ thể
      throw error;
    }
  }

  const handleClickOwnPets = async () => {
    try {
      toast.success("Own Pet")
      setShowDropdown(false);
      setShowPetModal(true);
    } catch (error) {
      console.error('Logout failed:', error); // xử lý lỗi cụ thể
      throw error;
    }
  }

  return (
    <>
      <div className="text-sm text-gray-700 px-6 py-2 flex justify-between ml-24 mr-24 relative z-50">
        <div className="flex gap-4">
          <span>📧 username@domain.com</span>
          <span>📞 021 01263492</span>
        </div>

        <div className="flex gap-4 items-center">
          <span>Ordering</span>
          <span>Shipping</span>
          <span>Returns</span>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <span
                className="font-semibold cursor-pointer"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                {user.name == null ? 'Guest' : user.name}
              </span>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg text-gray-700">
                  <ul className="py-2">
                    <li 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      navigate('/customer/profile');
                      setShowDropdown(false);
                    }}
                  >
                    Profile
                  </li>
                    <li 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        navigate('/customer/orders');
                        setShowDropdown(false);
                      }}
                    >
                      Orders
                    </li>
                    <li onClick={handleClickOwnPets} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Own Pets</li>
                    <li 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      navigate('/customer/appointments');
                      setShowDropdown(false);
                    }}
                  >
                    Appointment History
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Wishlist</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Address Book</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Change Password</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Support</li>
                    <li onClick={handleClickLogout} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <span className="cursor-pointer" onClick={() => { navigate('/login') }}>Login / Register</span>
          )}
        </div>
      </div>


      {showPetModal && <PetModal onClose={() => setShowPetModal(false)} />}

    </>



  );
}
