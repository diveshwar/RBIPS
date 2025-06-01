"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, testDatabaseConnection } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isConnected, setIsConnected] = useState(null);
  const router = useRouter();

  // Test connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await testDatabaseConnection();
        setIsConnected(connected);
        if (!connected) {
          setMessage({
            text: "Unable to connect to the server. Please check your internet connection and try again.",
            type: "error"
          });
        }
      } catch (err) {
        console.error('Connection check failed:', err);
        setIsConnected(false);
        setMessage({
          text: "Connection check failed. Please refresh the page and try again.",
          type: "error"
        });
      }
    };

    checkConnection();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (!role) {
      setMessage({ text: "Please select a role", type: "error" });
      setLoading(false);
      return;
    }

    try {
      // Verify connection before proceeding
      if (!isConnected) {
        const connected = await testDatabaseConnection();
        if (!connected) {
          throw new Error(
            "Unable to connect to the server. Please check:\n" +
            "1. Your internet connection\n" +
            "2. Your Supabase project is running\n" +
            "3. Your environment variables are correct"
          );
        }
        setIsConnected(true);
      }

      console.log('Starting signup process...');
      
      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: role
          }
        }
      });

      console.log('Signup response:', { 
        success: !!data?.user,
        error: error?.message,
        userId: data?.user?.id,
        status: error?.status
      });

      if (error) {
        console.error('Signup error:', {
          message: error.message,
          code: error.code,
          status: error.status,
          details: error.details
        });

        let errorMessage = error.message;
        if (error.message.includes('fetch')) {
          errorMessage = "Network error: Unable to connect to the server. Please check your internet connection and try again.";
        } else if (error.status === 400) {
          errorMessage = "Invalid signup request. Please check your email and password.";
        } else if (error.status === 429) {
          errorMessage = "Too many attempts. Please try again later.";
        }

        setMessage({ text: errorMessage, type: "error" });
        setLoading(false);
        return;
      }

      if (data?.user) {
        console.log('User created successfully:', data.user.id);
        const userId = data.user.id;

        // Insert user role into profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: userId,
              email,
              role,
            },
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          setMessage({ text: "Error saving profile: " + profileError.message, type: "error" });
          setLoading(false);
          return;
        }

        console.log('Profile created successfully');
        // **Force Logout after Signup**
        await supabase.auth.signOut();

        setMessage({ text: "Signup successful! Please check your email for verification.", type: "success" });

        setTimeout(() => {
          router.push(`/auth/login?role=${role}`);
        }, 2000);
      } else {
        console.error('No user data returned from signup');
        setMessage({ text: "Signup failed: No user data returned", type: "error" });
      }
    } catch (err) {
      console.error('Unexpected error during signup:', {
        message: err.message,
        stack: err.stack
      });
      setMessage({ 
        text: err.message || "An unexpected error occurred. Please try again later.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white px-6">
      <motion.div
        className="bg-white text-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold text-center text-blue-600">Sign Up</h2>
        <p className="text-center text-gray-600 mt-2">Create an account to get started</p>

        {/* Display Success or Error Messages */}
        {message.text && (
          <motion.p
            className={`mt-4 text-center px-4 py-2 rounded-lg ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {message.text}
          </motion.p>
        )}

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="candidate">Candidate</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?  
          <button
            onClick={() => router.push("/auth/login")}
            className="text-blue-600 font-semibold hover:underline ml-1"
          >
            Log in
          </button>
        </p>
      </motion.div>
    </div>
  );
}