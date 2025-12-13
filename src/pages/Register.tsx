import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLayout } from "../context/LayoutContext";
import { t } from "../lib/translations";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading } = useAuth();
  const { language } = useLayout();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(email, password);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Link
        to="/"
        className="absolute top-6 right-6 text-muted-text hover:text-card-text p-2 rounded-full hover:bg-muted-bg transition-all"
      >
        <i data-lucide="x" className="w-8 h-8" />
      </Link>
      <div className="bg-card p-8 md:p-12 w-full max-w-[480px] shadow-2xl rounded-2xl border border-border-color text-center relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bbcRed to-orange-600" />
        <h1 className="text-2xl font-bold mb-2 text-card-text">
          {t("register_title", language)}
        </h1>
        <p className="text-sm text-muted-text mb-8">
          {t("create_new_account", language)}
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
              className="w-full p-3 rounded-lg border border-border-color bg-muted-bg text-card-text focus:border-bbcRed outline-none"
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
              className="w-full p-3 rounded-lg border border-border-color bg-muted-bg text-card-text focus:border-bbcRed outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-bbcDark dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-lg hover:shadow-lg hover:bg-opacity-90 dark:hover:bg-opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            {isLoading
              ? t("registering", language)
              : t("register_btn", language)}
          </button>
        </form>

        <div className="mt-6 text-sm text-card-text">
          {t("already_have_account", language)}{" "}
          <Link to="/login" className="text-bbcRed font-bold hover:underline">
            {t("sign_in", language)}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
