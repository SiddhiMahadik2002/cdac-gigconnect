import { useState } from "react";

const Login = () => {
  const [role, setRole] = useState("freelancer");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6">
        
        <h2 className="text-3xl font-bold text-center text-textDark">
          Login to <span className="text-primary">GigConnect</span>
        </h2>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setRole("freelancer")}
            className={`w-1/2 py-2 rounded-xl text-sm font-medium ${
              role === "freelancer"
                ? "bg-primary text-white"
                : "text-gray-600"
            }`}
          >
            Freelancer
          </button>

          <button
            onClick={() => setRole("client")}
            className={`w-1/2 py-2 rounded-xl text-sm font-medium ${
              role === "client"
                ? "bg-primary text-white"
                : "text-gray-600"
            }`}
          >
            Client
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition"
          >
            Login as {role}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <span className="text-primary cursor-pointer">Register</span>
        </p>

      </div>
    </div>
  );
};

export default Login;
