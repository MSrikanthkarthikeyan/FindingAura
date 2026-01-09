import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import QuestView from './pages/QuestView';
import Habits from './pages/Habits';
import Analytics from './pages/Analytics';
import Achievements from './pages/Achievements';
import Templates from './pages/Templates';
import Pomodoro from './pages/Pomodoro';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/onboarding" element={
                            <ProtectedRoute>
                                <Onboarding />
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/quests" element={
                            <ProtectedRoute>
                                <QuestView />
                            </ProtectedRoute>
                        } />
                        <Route path="/habits" element={
                            <ProtectedRoute>
                                <Habits />
                            </ProtectedRoute>
                        } />
                        <Route path="/analytics" element={
                            <ProtectedRoute>
                                <Analytics />
                            </ProtectedRoute>
                        } />
                        <Route path="/achievements" element={
                            <ProtectedRoute>
                                <Achievements />
                            </ProtectedRoute>
                        } />
                        <Route path="/templates" element={
                            <ProtectedRoute>
                                <Templates />
                            </ProtectedRoute>
                        } />
                        <Route path="/pomodoro" element={
                            <ProtectedRoute>
                                <Pomodoro />
                            </ProtectedRoute>
                        } />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
