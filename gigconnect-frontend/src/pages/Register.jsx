import { useState } from "react";

const Register = () => {
  const [role, setRole] = useState("freelancer");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8 space-y-6">
        
        <h2 className="text-3xl font-bold text-center text-textDark">
          Create your <span className="text-primary">GigConnect</span> account
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

        {/* FORM */}
        <form className="space-y-4">

          {/* Name */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="w-1/2 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-1/2 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Email */}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
          />

          {/* Phone */}
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
          />

          {/* Profile Image */}
          <input
            type="file"
            className="w-full px-4 py-3 border rounded-xl bg-white"
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
          />

          {/* ================= CLIENT FIELDS ================= */}
          {role === "client" && (
            <>
              <input
                type="text"
                placeholder="Company Name"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
              />

              <textarea
                placeholder="Company Description"
                rows="3"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
              />

              <input
                type="url"
                placeholder="Company Website URL"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
              />
            </>
          )}

          {/* ================= FREELANCER FIELDS ================= */}
          {role === "freelancer" && (
            <>
              <input
                type="text"
                placeholder="Skills (e.g. React, Java, SQL)"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
              />

              <select
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
              >
                <option value="">Experience Level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>

              <input
                type="url"
                placeholder="Portfolio URL"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
              />

              <textarea
                placeholder="Tell us about yourself"
                rows="3"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
              />
            </>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition"
          >
            Register as {role}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Register;
