import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, GraduationCap } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";

export default function StandaloneSignup() {
  const navigate = useNavigate();
  const { baseurl } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${baseurl}/standalone/signup`, formData, { withCredentials: true });

      if (!response.data.success) {
        throw new Error(response.data.message || "Signup failed");
      }

      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-bg text-foreground px-4">
      <div className="w-full max-w-md p-6 bg-admin-panel rounded-xl shadow-xl border border-admin-border">
        <div className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-2xl text-center font-bold">Student Signup</h2>
          <p className="text-center text-muted-foreground">Join as an independent learner and access premium content</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
            <input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-admin-bg border border-admin-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-admin-bg border border-admin-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-admin-bg border border-admin-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-primary text-admin-bg font-semibold hover:opacity-90 disabled:opacity-40 transition"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" /> Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-4 flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </div>
          <div>
            <Link to="/" className="text-gray-500 hover:text-gray-400">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
