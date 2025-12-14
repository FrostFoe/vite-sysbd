import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLayout } from "../context/LayoutContext";
import { t } from "../lib/translations";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const { language } = useLayout();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4">
      <Link
        to="/"
        className="absolute top-4 sm:top-6 right-4 sm:right-6 text-muted-text hover:text-card-text p-2 rounded-full hover:bg-muted-bg transition-all"
      >
        <i data-lucide="x" className="w-6 sm:w-8 h-6 sm:h-8" />
      </Link>
      <div className="bg-card p-6 sm:p-8 md:p-12 w-full max-w-[480px] shadow-2xl rounded-2xl border border-border-color text-center relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bbcRed to-bbcRed-hover" />
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-card-text">
          {t("login_welcome", language)}
        </h1>
        <p className="text-xs sm:text-sm text-muted-text mb-6 sm:mb-8">
          {t("login_to_account", language)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase text-muted-text mb-1"
            >
              {t("email", language)}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 text-sm sm:text-base rounded-lg border border-border-color bg-muted-bg text-card-text focus:border-bbcRed outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase text-muted-text mb-1"
            >
              {t("password", language)}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 text-sm sm:text-base rounded-lg border border-border-color bg-muted-bg text-card-text focus:border-bbcRed outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-bbcRed text-white font-bold py-3 sm:py-3.5 text-sm sm:text-base rounded-lg hover:shadow-lg hover:bg-opacity-90 dark:hover:bg-opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            {isLoading ? t("logging_in", language) : t("sign_in_btn", language)}
          </button>
        </form>

        <div className="mt-6 text-xs sm:text-sm text-card-text">
          {t("dont_have_account", language)}{" "}
          <Link
            to="/register"
            className="text-bbcRed font-bold hover:underline"
          >
            {t("create_account", language)}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
