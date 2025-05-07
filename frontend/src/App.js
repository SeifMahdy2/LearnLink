import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { CssBaseline, CircularProgress, Box } from "@mui/material";
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Settings from "./components/Settings";
import MyDocuments from "./components/MyDocuments";
import DocumentUpload from "./components/DocumentUpload";
import Quiz from "./components/Quiz";
import Quizzes from "./components/Quizzes";
import NotFound from "./components/NotFound";
import LearningStyleAssessment from "./components/LearningStyleAssessment";
import Profile from './pages/Profile';
import Progress from './components/Progress';
import Discussions from './components/Discussions';
import Leaderboard from './components/Leaderboard';
import ForgotPassword from './components/ForgotPassword';
import Contact from './pages/Contact';
import ProcessingPage from './pages/ProcessingPage';

// Styles
const containerStyle = {
  display: "flex",
  flexDirection: "row",
  width: "100%",
};

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <AuthProvider>
          <Router>
            <Navbar handleDrawerToggle={handleDrawerToggle} />
            <Box component="main" sx={{ flexGrow: 1, py: 0 }}>
              <Switch>
                {/* Public Routes */}
                <Route exact path="/" component={Home} />
                <Route path="/login" component={Login} />
                <Route path="/register" render={(props) => <Login {...props} isRegister />} />
                <Route path="/forgot-password" component={ForgotPassword} />
                <Route path="/features/:featureType" component={Home} />
                <Route path="/how-it-works" component={Home} />
                <Route path="/contact" component={Contact} />
                
                {/* Protected Routes */}
                <ProtectedRoute path="/dashboard" component={Dashboard} />
                <ProtectedRoute path="/documents" component={MyDocuments} />
                <ProtectedRoute path="/process/:id" component={ProcessingPage} />
                <ProtectedRoute path="/quiz/:id" component={Quiz} />
                <ProtectedRoute path="/quizzes" component={Quizzes} />
                <ProtectedRoute path="/settings" component={Settings} />
                <ProtectedRoute path="/learning-style" component={LearningStyleAssessment} />
                <ProtectedRoute path="/profile" component={Profile} />
                <ProtectedRoute path="/progress" component={Progress} />
                <ProtectedRoute path="/discussions" component={Discussions} />
                <ProtectedRoute path="/leaderboard" component={Leaderboard} />

                {/* Catch All/404 */}
                <Route path="/404" component={NotFound} />
                <Redirect to="/404" />
              </Switch>
            </Box>
          </Router>
        </AuthProvider>
      </Box>
    </ThemeProvider>
  );
}

export default App; 