import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import axios from "axios";
import { Loader2 } from "lucide-react";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } catch (err) {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col relative bg-[var(--bg-main)]">
      <Navbar user={user} setUser={setUser} />
      <main className="flex-grow w-full">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login setUser={setUser} />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Register setUser={setUser} />}
          />
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;