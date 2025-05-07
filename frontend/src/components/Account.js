import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import "../styles/account.css";

const avatarList = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
  "/avatars/avatar5.png",
  "/avatars/avatar6.png",
  "/avatars/avatar7.png",
  "/avatars/avatar8.png",
  "/avatars/avatar9.png",
  "/avatars/avatar10.png",
  "/avatars/avatar11.png",
];

function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  const handleAvatarSelect = async (avatar) => {
    setSelectedAvatar(avatar);

    // Update Firebase Authentication Profile
    await updateProfile(auth.currentUser, { photoURL: avatar });

    // Update UI instantly
    setUser({ ...user, photoURL: avatar });
  };

  return (
    <div className="container auth-page">
      <div className="card">
        <h1>Account Details</h1>
        <img src={user?.photoURL || "/avatars/avatar1.png"} alt="User" className="profile-pic" />
        <p><strong>Name:</strong> {user?.displayName || "N/A"}</p>
        <p><strong>Email:</strong> {user?.email}</p>

        {/* Avatar Selection */}
        <h3>Choose an Avatar:</h3>
        <div className="avatar-list">
          {avatarList.map((avatar, index) => (
            <img
              key={index}
              src={avatar}
              alt={`Avatar ${index + 1}`}
              className={`avatar-option ${selectedAvatar === avatar ? "selected" : ""}`}
              onClick={() => handleAvatarSelect(avatar)}
            />
          ))}
        </div>

        <button onClick={() => navigate("/home")}>Back to Home</button>
      </div>
    </div>
  );
}

export default Account;
