"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const isAdminMode = searchParams.get("mode") === "admin";

  // Completely separate the form rendering
  const renderAdminForm = () => (
    <>
      <h2 className="text-3xl font-bold text-center text-gray-900">
        Admin Portal
      </h2>
      <form onSubmit={handleAdminSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Admin Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Admin Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Admin Login
        </button>
      </form>
      <div className="text-center text-sm">
        <a
          href="/auth/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Employee Login
        </a>
      </div>
    </>
  );

  const renderEmployeeForm = () => (
    <>
      <h2 className="text-3xl font-bold text-center text-gray-900">
        Employee Portal
      </h2>
      <form onSubmit={handleEmployeeSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Employee ID
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. ENU-86373"
            className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Continue
        </button>
      </form>
      <div className="text-center text-sm">
        <a
          href="/auth/login?mode=admin"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Admin Login
        </a>
      </div>
    </>
  );

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (result?.error) setError(result.error);
    else router.push("/admin/dashboard");
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await signIn("user-login", {
      redirect: false,
      identifier,
    });
    if (result?.error) {
      setError(result.error);
    } else {
      const session = await fetch("/api/auth/session").then(res => res.json());
      if (session.user?.requiresPassword) {
        router.push("/auth/set-password");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        {isAdminMode ? renderAdminForm() : renderEmployeeForm()}
      </div>
    </div>
  );
}