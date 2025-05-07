import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import Layout from "./Layout";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { currentUser } = useContext(AuthContext);
  
  return (
    <Route
      {...rest}
      render={(props) => {
        if (!currentUser) {
          // User is not authenticated, redirect to login
          return <Redirect to={{ 
            pathname: "/login", 
            state: { from: props.location } 
          }} />;
        }
        
        // User is authenticated, render component within Layout
        return (
          <Layout drawerOpen={rest.drawerOpen} handleDrawerToggle={rest.handleDrawerToggle}>
            <Component {...props} />
          </Layout>
        );
      }}
    />
  );
};

export default ProtectedRoute;
