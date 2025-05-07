import React, { useState, useContext } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Quiz from "./components/Quiz";
import Quizzes from "./components/Quizzes";
import DocumentUpload from "./components/DocumentUpload";
import Login from "./components/Login";
import MyDocuments from "./components/MyDocuments";
import ProcessingPage from "./pages/ProcessingPage";

// Styles
import "./styles/styles.css";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
  [x: string]: any;
}

const App: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Protected route component
  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
    const { currentUser } = useContext(AuthContext);
    
    return (
      <Route
        {...rest}
        render={(props) =>
          currentUser ? (
            <div style={{ display: 'flex' }}>
              <Sidebar 
                open={drawerOpen} 
                onClose={handleDrawerToggle} 
              />
              <div style={{ flexGrow: 1 }}>
                <Component {...props} />
              </div>
            </div>
          ) : (
            <Redirect to="/login" />
          )
        }
      />
    );
  };

  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar handleDrawerToggle={handleDrawerToggle} />
          <Switch>
            {/* Public Routes */}
            <Route exact path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/register" render={(props) => <Login {...props} isRegister />} />
            <Route path="/features/:featureType" component={Home} />
            <Route path="/how-it-works" component={Home} />
            
            {/* Protected Routes */}
            <ProtectedRoute 
              path="/dashboard" 
              component={Dashboard} 
              drawerOpen={drawerOpen} 
              handleDrawerToggle={handleDrawerToggle} 
            />
            <ProtectedRoute 
              path="/settings" 
              component={Dashboard} 
              drawerOpen={drawerOpen} 
              handleDrawerToggle={handleDrawerToggle} 
            />
            <ProtectedRoute 
              path="/documents" 
              exact
              component={MyDocuments} 
              drawerOpen={drawerOpen} 
              handleDrawerToggle={handleDrawerToggle} 
            />
            <ProtectedRoute 
              path="/process/:id" 
              component={ProcessingPage} 
              drawerOpen={drawerOpen} 
              handleDrawerToggle={handleDrawerToggle} 
            />
            <ProtectedRoute 
              path="/learning-style" 
              component={Dashboard} 
              drawerOpen={drawerOpen} 
              handleDrawerToggle={handleDrawerToggle} 
            />
            <ProtectedRoute 
              path="/quizzes" 
              exact 
              component={Quizzes}
              drawerOpen={drawerOpen} 
              handleDrawerToggle={handleDrawerToggle} 
            />
            <ProtectedRoute 
              path="/quizzes/:id" 
              component={Quiz} 
              drawerOpen={drawerOpen} 
              handleDrawerToggle={handleDrawerToggle} 
            />
            <ProtectedRoute 
              path="/progress" 
              component={Dashboard} 
              drawerOpen={drawerOpen} 
              handleDrawerToggle={handleDrawerToggle} 
            />
            <Route path="/404" component={Home} />
            <Redirect to="/404" />
          </Switch>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
