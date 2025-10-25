import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { DisputesPage } from "./pages/DisputesPage";
import { LoginPage } from "./pages/LoginPage";
import { RentalsPage } from "./pages/RentalsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TracksPage } from "./pages/TracksPage";
import { UsersPage } from "./pages/UsersPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { ConvexProviderWrapper } from "./providers/ConvexProvider";

function App() {
  return (
    <ConvexProviderWrapper>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={<Navigate to="/app/dashboard" replace />}
            />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="rentals" element={<RentalsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="disputes" element={<DisputesPage />} />
              <Route path="tracks" element={<TracksPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConvexProviderWrapper>
  );
}

export default App;
