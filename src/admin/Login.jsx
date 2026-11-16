import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import Seo from "../components/Seo.jsx";
import { Spinner } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { status, login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (status === "admin") return <Navigate to={location.state?.from || "/admin"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Seo title="Admin sign in" noindex />
      <form onSubmit={submit} className="glass w-full max-w-sm space-y-4 p-8">
        <h1 className="font-display text-2xl font-bold">Admin sign in</h1>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="a-email">Email</label>
          <input id="a-email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="a-pass">Password</label>
          <input id="a-pass" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </div>
        {(error || authError) && <p className="text-sm text-rose-400" role="alert">{error || authError}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? <Spinner /> : <LogIn className="h-4 w-4" />} Sign in</button>
      </form>
    </div>
  );
}