import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Account.css"; // Import CSS

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName || "User",
          email: currentUser.email || "No email provided",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Please log in to view your account.</p>;
  }

  return (
    <div className="account-container">
      <h2>Hi, {user.displayName}!</h2>

      <div className="account-sections">
        {/* Navigate to Orders Page */}
        <div className="account-box" onClick={() => navigate("/orders")}>
          <h3>Your Orders</h3>
          <p>Track, return, or buy things again</p>
        </div>

       
        <div className="account-box" onClick={() => navigate("/security-settings")}>
  <h3>Login & Security</h3>
  <p>Edit login, name, and mobile number</p>
</div>

        <div className="account-box">
          <h3>Your Addresses</h3>
          <p>Edit addresses for orders and gifts</p>
        </div>

        {/* Navigate to Contact Page */}
        <div className="account-box" onClick={() => navigate("/contact")}>
          <h3>Contact Us</h3>
          <p>Get help or send us a message</p>
        </div>
      </div>
    </div>
  );
};

export default Account;
