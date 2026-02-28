import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/login",
        new URLSearchParams({
          username: email,
          password: password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem("token", response.data.access_token);

      navigate("/dashboard");

    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#020617] text-white overflow-hidden">

      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-3xl"></div>

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <form
        onSubmit={handleLogin}
        className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-3xl shadow-2xl w-[400px]"
      >
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          ResearchPilot
        </h1>

        <p className="text-center text-gray-400 mb-10">
          AI Research Intelligence Platform
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-5 py-4 mb-5 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-5 py-4 mb-8 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          required
        />

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl shadow-xl hover:scale-105 transition-all duration-300"
        >
          Login
        </button>
      </form>

    </div>
  );
}

export default Login;