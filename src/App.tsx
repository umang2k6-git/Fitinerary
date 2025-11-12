import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GuestItineraryProvider } from './contexts/GuestItineraryContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import InspireMe from './pages/InspireMe';
import Generate from './pages/Generate';
import ItineraryDetail from './pages/ItineraryDetail';
import GuestItineraryDetail from './pages/GuestItineraryDetail';
import MyItineraries from './pages/MyItineraries';
import QuickItinerary from './pages/QuickItinerary';
import Discovery from './pages/Discovery';
import PersonalizedDestinations from './pages/PersonalizedDestinations';
import Blog from './pages/Blog';

function App() {
  return (
    <AuthProvider>
      <GuestItineraryProvider>
        <Router>
          <div className="min-h-screen">
            <Navigation />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/quick-itinerary" element={<QuickItinerary />} />
              <Route path="/inspire-me" element={<InspireMe />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/guest-itinerary/:id" element={<GuestItineraryDetail />} />
              <Route
                path="/discovery"
                element={
                  <ProtectedRoute>
                    <Discovery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/personalized-destinations"
                element={
                  <ProtectedRoute>
                    <PersonalizedDestinations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/itinerary/:id"
                element={
                  <ProtectedRoute>
                    <ItineraryDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-itineraries"
                element={
                  <ProtectedRoute>
                    <MyItineraries />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </GuestItineraryProvider>
    </AuthProvider>
  );
}

export default App;
