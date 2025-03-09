import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Adjust the path as necessary
import axios from "axios";
import { NextRouter } from "next/router";

export async function handleGoogleSignIn(router: NextRouter, setErrorMessage: (message: string | null) => void, setIsLoading: (loading: boolean) => void) {
  setIsLoading(true);
  setErrorMessage(null);

  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();

    // Send user data to backend
    const response = await axios.post('http://localhost:5001/api/auth/google-signin', {
      email: result.user.email,
      firebaseUid: result.user.uid,
    }, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response.data.message);
    router.push('/logged-in'); // Redirect to the logged-in page
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      setErrorMessage(error.response.data.message);
    } else {
      setErrorMessage("An unexpected error occurred.");
    }
  } finally {
    setIsLoading(false);
  }
}
