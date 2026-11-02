import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/home/index";
import About from "./pages/about";
import Services from "./pages/services";
import ServiceDetail from "./components/services/serviceDetail";
import Contact from "./pages/contact";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./components/dashboard";
import AdminDashboard from "./components/admin/adminDashboard";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "./components/scrollToTop/index";

const getStoredUserId = () => localStorage.getItem("userId");
const isAdminLoggedIn = () => localStorage.getItem("isAdmin") === "true";

const PrivateRoute = ({ children }) => {
  const userId = getStoredUserId();
  const isAdmin = isAdminLoggedIn();

  if (!userId || isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const isAdmin = isAdminLoggedIn();

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
