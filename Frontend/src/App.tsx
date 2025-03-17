import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { UserCircle2, Users, ShieldCheck } from 'lucide-react';
import Register from './components/Register';
import Login from './components/Login';
import Admin from './components/Admin';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Users className="h-8 w-8 text-indigo-600" />
                  <span className="ml-2 text-xl font-bold text-gray-800">AttendanceAI</span>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <NavLink to="/register" icon={<UserCircle2 className="h-5 w-5" />} text="Register" />
                  <NavLink to="/login" icon={<Users className="h-5 w-5" />} text="Login" />
                  <NavLink to="/admin" icon={<ShieldCheck className="h-5 w-5" />} text="Admin" />
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/" element={<Register />} />
          </Routes>
        </main>

        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

const NavLink = ({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) => (
  <Link
    to={to}
    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors duration-200"
  >
    {icon}
    <span className="ml-2">{text}</span>
  </Link>
);

export default App;