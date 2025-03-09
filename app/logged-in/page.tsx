"use client"

import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig"; // Adjust the path as necessary
import { useRouter } from "next/navigation";

const LoggedIn = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to the home page or login page after sign-out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">You are logged in!</h1>
      <button
        onClick={handleSignOut}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Sign Out
      </button>
    </div>
  );
};

export default LoggedIn;