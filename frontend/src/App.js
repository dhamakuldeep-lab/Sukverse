import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";

// ✅ Authentication Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// ✅ Dashboards
import StudentDashboard from "./pages/StudentDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import AdminPanel from "./pages/AdminPanel";

// ✅ Admin Management
import UserList from "./pages/UserList";
import AddEditUserPage from "./pages/AddEditUserPage";
import BulkUserUploadPage from "./pages/BulkUserUploadPage";
import RoleManagementPage from "./pages/RoleManagementPage";

// ✅ Workshop & Lessons
import WorkshopDetailPage from "./pages/WorkshopDetailPage";
import PythonEditorPage from "./pages/PythonEditorPage";
import QuizPage from "./pages/QuizPage";
import FinalQuizPage from "./pages/FinalQuizPage";
import CertificatePage from "./pages/CertificatePage";
import SectionPage from "./pages/SectionPage";

// ✅ Admin Workshop Management
import AdminWorkshopsPage from "./pages/AdminWorkshopsPage";
import AdminEditWorkshopPage from "./pages/AdminEditWorkshopPage";
import AdminSectionPage from "./pages/AdminSectionPage";

// ✅ Trainer Workshop Management
import CreateWorkshopForm from "./pages/CreateWorkshopForm";
import EditWorkshopForm from "./pages/EditWorkshopForm";
import WorkshopFlowDesigner from "./pages/WorkshopFlowDesigner";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* ✅ Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ✅ Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ✅ Dashboards */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/trainer/*" element={<TrainerDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />

          {/* ✅ Admin User & Role Management */}
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/users/add" element={<AddEditUserPage />} />
          <Route path="/admin/users/edit/:id" element={<AddEditUserPage />} />
          <Route path="/admin/users/bulk-upload" element={<BulkUserUploadPage />} />
          <Route path="/admin/roles" element={<RoleManagementPage />} />

          {/* ✅ Workshop Details & Lessons */}
          <Route path="/workshops/:id" element={<WorkshopDetailPage />} />
          <Route path="/workshops/:id/editor" element={<PythonEditorPage />} />
          <Route path="/workshops/:id/quiz" element={<QuizPage />} />
          <Route path="/workshops/:id/final-quiz" element={<FinalQuizPage />} />
          <Route path="/workshops/:id/certificate" element={<CertificatePage />} />
          <Route path="/workshops/:id/sections/:sectionId" element={<SectionPage />} />

          {/* ✅ Trainer Workshop Management */}
          <Route path="/trainer/workshops/create" element={<CreateWorkshopForm />} />
          <Route path="/trainer/workshops/edit/:id" element={<EditWorkshopForm />} />
          <Route path="/trainer/workshops/flow" element={<WorkshopFlowDesigner />} />

          {/* ✅ Admin Workshop Management */}
          <Route path="/admin/workshops" element={<AdminWorkshopsPage />} />
          <Route path="/admin/workshops/create" element={<AdminEditWorkshopPage />} />
          <Route path="/admin/workshops/edit/:id" element={<AdminEditWorkshopPage />} />
          <Route
            path="/admin/sections/edit/:sectionId/:workshopId"
            element={<AdminSectionPage />}
          />

          {/* ✅ Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
