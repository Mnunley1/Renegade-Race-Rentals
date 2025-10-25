import { useUser } from '@clerk/clerk-react';
import { AppLoader } from '@renegade/ui';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import BillingPage from './pages/BillingPage';
import BookingPage from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import ChatPage from './pages/ChatPage';
import CreateDriverProfilePage from './pages/CreateDriverProfilePage';
import CreateTeamPage from './pages/CreateTeamPage';
import DriverDetailPage from './pages/DriverDetailPage';
import ExplorePage from './pages/ExplorePage';
import FavoritesPage from './pages/FavoritesPage';
import HelpCenterPage from './pages/HelpCenterPage';
import HomePage from './pages/HomePage';
import ListVehiclePage from './pages/ListVehiclePage';
import MatchPage from './pages/MatchPage';
import MessagesPage from './pages/MessagesPage';
import NotFoundPage from './pages/NotFoundPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import ProfilePage from './pages/ProfilePage';
import RentalHistoryPage from './pages/RentalHistoryPage';
import ReviewPage from './pages/ReviewPage';
import SettingsPage from './pages/SettingsPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TeamDetailPage from './pages/TeamDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import VehicleDetailPage from './pages/VehicleDetailPage';

function App() {
  const { isLoaded } = useUser();
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/sign-in' || location.pathname === '/sign-up';

  // Show loader until Clerk is fully initialized
  if (!isLoaded) {
    return <AppLoader />;
  }

  if (isAuthPage) {
    return (
      <Routes>
        <Route path='/sign-in' element={<SignInPage />} />
        <Route path='/sign-up' element={<SignUpPage />} />
      </Routes>
    );
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <main className='flex-1'>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/search' element={<ExplorePage />} />
          <Route path='/favorites' element={<FavoritesPage />} />
          <Route path='/motorsports' element={<MatchPage />} />
          <Route path='/motorsports/create-team' element={<CreateTeamPage />} />
          <Route
            path='/motorsports/create-driver'
            element={<CreateDriverProfilePage />}
          />
          <Route
            path='/motorsports/driver/:driverId'
            element={<DriverDetailPage />}
          />
          <Route
            path='/motorsports/team/:teamId'
            element={<TeamDetailPage />}
          />
          <Route path='/messages' element={<MessagesPage />} />
          <Route path='/chat/:conversationId' element={<ChatPage />} />
          <Route path='/chat' element={<ChatPage />} />
          <Route path='/list-vehicle' element={<ListVehiclePage />} />
          <Route path='/dashboard' element={<OwnerDashboardPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/rental-history' element={<RentalHistoryPage />} />
          <Route path='/review/:completionId' element={<ReviewPage />} />
          <Route path='/help-center' element={<HelpCenterPage />} />
          <Route path='/billing' element={<BillingPage />} />
          <Route path='/settings' element={<SettingsPage />} />
          <Route path='/booking-success' element={<BookingSuccessPage />} />
          <Route
            path='/vehicles/:id'
            element={
              <AppErrorBoundary>
                <VehicleDetailPage />
              </AppErrorBoundary>
            }
          />
          <Route path='/vehicles/:id/book' element={<BookingPage />} />
          <Route path='/users/:userId' element={<UserProfilePage />} />
          <Route path='/sign-in' element={<SignInPage />} />
          <Route path='/sign-up' element={<SignUpPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
