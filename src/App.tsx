import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/hooks/useAuth";
import { FontProvider } from "@/components/FontProvider";
import { ThemeProvider } from "@/hooks/useTheme";
import { LanguageProvider } from "@/lib/i18n";
import { ProtectedRoute, AdminRoute } from "@/components/route-guards";

import PublicLayout from "@/components/layout/PublicLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminLayout from "@/components/layout/AdminLayout";

import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Notices from "./pages/Notices";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { ComingSoon } from "@/components/ComingSoon";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import SuccessISSB from "./pages/SuccessISSB";
import LessonView from "./pages/LessonView";
import IQPracticeHome from "./pages/IQPracticeHome";
import IQPracticeExam from "./pages/IQPracticeExam";
import IncompleteStoryHome from "./pages/IncompleteStoryHome";
import PlanningTaskHome from "./pages/PlanningTaskHome";
import GroupDiscussionHome from "./pages/GroupDiscussionHome";
import IncompleteStoryDetail from "./pages/IncompleteStoryDetail";
import PPDTTest from "./pages/PPDTTest";
import PictureStoryTest from "./pages/PictureStoryTest";
import WATHome from "./pages/WATHome";
import WATTest from "./pages/WATTest";
import ISTHome from "./pages/ISTHome";
import ISTTest from "./pages/ISTTest";
import ExtemporeHome from "./pages/ExtemporeHome";
import ExtemporeTest from "./pages/ExtemporeTest";
import CourseLearn from "./pages/dashboard/CourseLearn";
import SuccessCadet from "./pages/SuccessCadet";
import DashboardHome from "./pages/dashboard/DashboardHome";
import MyCourses from "./pages/dashboard/MyCourses";
import MyOrders from "./pages/dashboard/MyOrders";
import Profile from "./pages/dashboard/Profile";
import { ScrollToTop } from "@/components/ScrollToTop";
import AdminHome from "./pages/admin/AdminHome";
import AdminCourses from "./pages/admin/Courses";
import CourseEditor from "./pages/admin/CourseEditor";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminStudents from "./pages/admin/Students";
import AdminNotices from "./pages/admin/Notices";
import PageBuilder from "./pages/admin/PageBuilder";
import ISSBAdmin from "./pages/admin/ISSBAdmin";
import SuccessAdmin from "./pages/admin/SuccessAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <ThemeProvider>
    <AuthProvider>
      <FontProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public site */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/courses/:id/lessons/:lessonId" element={<LessonView />} />
                <Route path="/courses/:id/iq-practice" element={<IQPracticeHome />} />
                <Route path="/courses/:id/iq-practice/:setId" element={<IQPracticeExam />} />
                <Route path="/courses/:id/incomplete-story" element={<IncompleteStoryHome />} />
                <Route path="/courses/:id/incomplete-story/:storyId" element={<IncompleteStoryDetail />} />
                <Route path="/courses/:id/picture-story" element={<PictureStoryTest />} />
                <Route path="/courses/:id/ppdt" element={<PPDTTest />} />
                <Route path="/courses/:id/wat" element={<WATHome />} />
                <Route path="/courses/:id/wat/:setId" element={<WATTest />} />
                <Route path="/courses/:id/ist" element={<ISTHome />} />
                <Route path="/courses/:id/ist/:setId" element={<ISTTest />} />
                <Route path="/courses/:id/extempore" element={<ExtemporeHome />} />
                <Route path="/courses/:id/extempore/:setId" element={<ExtemporeTest />} />
                <Route path="/courses/:id/planning-task" element={<PlanningTaskHome />} />
                <Route path="/courses/:id/group-discussion" element={<GroupDiscussionHome />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/notices" element={<Notices />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/refund" element={<Refund />} />
                <Route path="/success/issb" element={<SuccessISSB />} />
                <Route path="/success/cadet" element={<SuccessCadet />} />
              </Route>


              {/* Auth (no chrome) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Student dashboard */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/dashboard/courses" element={<MyCourses />} />
                <Route path="/dashboard/courses/:id" element={<CourseLearn />} />
                <Route path="/dashboard/orders" element={<MyOrders />} />
                <Route path="/dashboard/profile" element={<Profile />} />
              </Route>

              {/* Admin */}
              <Route
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route path="/admin" element={<AdminHome />} />
                <Route path="/admin/courses" element={<AdminCourses />} />
                <Route path="/admin/courses/new" element={<CourseEditor />} />
                <Route path="/admin/courses/:id/edit" element={<CourseEditor />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/students" element={<AdminStudents />} />
                <Route path="/admin/notices" element={<AdminNotices />} />
                <Route path="/admin/pages" element={<ComingSoon />} />
                <Route path="/admin/page-builder" element={<PageBuilder />} />
                <Route path="/admin/issb" element={<ISSBAdmin />} />
                <Route path="/admin/success" element={<SuccessAdmin />} />
                <Route path="/admin/settings" element={<div />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FontProvider>
    </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
