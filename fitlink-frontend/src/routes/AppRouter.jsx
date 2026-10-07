import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/student/HomePage";
import PrivateRoute from "@/routes/PrivateRoute";
import AboutPage from "@/pages/student/AboutPage";
import RegisterPage from "@/pages/RegisterPage";
import NewsPage from "@/pages/student/NewsPage";
import ContactPage from "@/pages/student/ContactPage";
import ProgramsPage from "@/pages/student/ProgramsPage";
import PricingPage from "@/pages/student/PricingPage";
import UserProfile from "@/pages/student/UserProfile";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import VerifyEmail from "@/pages/VerifyEmail";
import PTList from "@/pages/student/PTList";
import ManagerUser from "@/pages/admin/managerUser/ManagerUser";
import UserDetail from "@/pages/admin/managerUser/UserDetail";

import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import DashboardPage from "@/pages/admin/dashboardAdmin/DashboardPage";
import PTDashboard from "@/pages/pt/PTDashboard";
import PTPackages from "@/pages/pt/PTPackages";
import PTProfile from "@/pages/pt/PTProfile";
import PTDetail from "@/pages/student/PTDetail";
import PTMessagePage from "@/pages/pt/PTMessagePage";
import PaymentResult from "@/pages/payment/PaymentResult";
import MyCalendar from "@/pages/calendar/MyCalendar";
import PTStudents from "@/pages/pt/PTStudent";
import PTListAdmin from "@/pages/admin/managerUser/PTList";
import StudentListAdmin from "@/pages/admin/managerUser/StudentList";
import AdminLayout from "@/layouts/AdminLayout";
import SearchPTs from "@/pages/student/SearchPTs";
import PTCalendarPage from "@/pages/pt/PTCalendarPage";
import PTRequestList from "@/pages/admin/PTRequestList";
import PTRequestDetail from "@/pages/admin/PTRequestDetail";
import PTCreatePackage from "@/pages/pt/PTCreatePackage";
import PTSchedule from "@/pages/pt/PTSchedule";
import TrainingCalendar from "@/components/TrainingCalendar";
import MessagePage from "@/pages/MessagePage";
import ChatAIPage from "@/pages/AIChatPage";
import BookingWizard from "@/pages/booking/BookingWizard";
import NotificationsPage from "@/pages/student/NotificationsPage";
import PTPackageDetail from "@/pages/pt/PTPackageDetail";
import PTPackageEdit from "@/pages/pt/PTPackageEdit";
import PTWallet from "@/pages/pt/PTWalletPage";
import AdminPayouts from "@/pages/admin/AdminPayouts";
import PTMaterialsPage from "@/pages/pt/PTMaterialsPage";
import PTFeedback from "@/pages/pt/PTFeedbackPage";
import PTApprovalPage from "@/pages/pt/PTApprovalPage";
import MyPackage from "@/components/MyPackage";
import Transactions from "@/pages/admin/Transactions";



export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/list-pt" element={<SearchPTs />} />
      <Route path="/training-calendar" element={<TrainingCalendar />} />
      <Route path="/my-packages" element={<MyPackage />} />
      <Route
        path="/profile"
        element={
          <PrivateRoute allowedRoles={["student", "pt"]}>
            <UserProfile />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/programs" element={<ProgramsPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route
        path="/chat"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <MessagePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat/:ptId"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <MessagePage />
          </PrivateRoute>
        }
      />
      <Route path="/chat-ai" element={<ChatAIPage />} />
      {/* Trainer - Nguyen */}
      <Route path="/trainer/:id" element={<PTDetail />} />
      <Route path="/pt/:id" element={<PTDetail />} />
      {/* <Route path="/booking/:id" element={<BookingPage />} />
       */}
      <Route path="/booking/:id" element={<BookingWizard />} />
      {/* Admin router */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route path="/admin/users" element={<ManagerUser />} />
      <Route
        path="/admin-transactions"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <Transactions />
            </AdminLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/users/pts"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <PTListAdmin />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users/students"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <StudentListAdmin />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route path="/admin/users/:id" element={<UserDetail />} />
      <Route path="/admin/payouts" element={<AdminPayouts />} />
      <Route path="/pt" element={<Navigate to="/pt/dashboard" replace />} />
      <Route path="/admin/pt-requests" element={<PTRequestList />} />
      <Route path="/admin/pt-requests/:id" element={<PTRequestDetail />} />
      <Route
        path="/pt/dashboard"
        element={
          <PrivateRoute allowedRoles={["pt"]}>
            <PTDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/pt/packages"
        element={
          <PrivateRoute allowedRoles={["pt"]}>
            <PTPackages />
          </PrivateRoute>
        }
      />
      <Route
        path="/pt/packages/:packageId"
        element={
          <PrivateRoute allowedRoles={["pt"]}>
            <PTPackageDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/pt/packages/:packageId/edit"
        element={
          <PrivateRoute allowedRoles={["pt"]}>
            <PTPackageEdit />
          </PrivateRoute>
        }
      />
      <Route
        path="/pt/packages/new"
        element={
          <PrivateRoute allowedRoles={["pt"]}>
            <PTCreatePackage />
          </PrivateRoute>
        }
      />
      <Route
        path="/pt/profile"
        element={
          <PrivateRoute allowedRoles={["pt"]}>
            <PTProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/pt/materials"
        element={
          <PrivateRoute allowedRoles={["pt"]}>
            <PTMaterialsPage />
          </PrivateRoute>
        }
      />
      <Route path="/payment/result" element={<PaymentResult />} />
      {/* ... */}
      <Route path="/pt/schedule1" element={<MyCalendar />} />
      <Route path="/pt/schedule" element={<PTSchedule />} />
      {/* Student có thể dùng cùng page này nếu muốn, hoặc tách ra layout khác */}
      <Route path="/pt/students" element={<PTStudents />} />
      <Route path="/pt/wallet" element={<PTWallet />} />
      <Route path="/pt/feedback" element={<PTFeedback />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route
        path="/pt/chat"
        element={
          <PrivateRoute allowedRoles={["pt"]}>
            <PTMessagePage />
          </PrivateRoute>
        }
      />
      <Route path="/pt/approval-request" element={<PTApprovalPage />} />
      <Route path="/chat" element={<MessagePage />} />
    </Routes>
  );
}
