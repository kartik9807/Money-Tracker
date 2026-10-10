import { useState } from "react";
import {useAuth} from "../../hooks/useAuth.jsx";
import { toast } from "react-toastify";
import { toastConfig } from "../../utils/toastConfig.jsx";
import { useNavigate } from "react-router-dom";

import {
    inputClass,
    labelClass,
    submitClass,
    switchBtnClass,
} from "../../utils/styleClass.jsx";

const LoginForm = ({ onSwitchToRegister ,setMode}) => {
    const navigate = useNavigate();
    const {Login} = useAuth();
    const [loginForm, setLoginForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setLoginForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await Login(loginForm);

            console.log(response.success);

            if (response.success) {
                console.log("navigating to dashboard");
                navigate("/dashboard", { replace: true });
            } else {
                toast.error(
                    response.message || "Login failed",
                    toastConfig
                );

                setLoginForm({
                    username: "",
                    email: "",
                    password: "",
                });
            }
        } catch (error) {
            console.log("Login error:", error);
            if(error.response?.data?.message && error.response?.data?.message.includes("user not found, please register first")){
                    console.log("running");
                    setMode("register");
                }
            toast.error(
                error.response?.data?.message || "Login failed",
                toastConfig
            );

            setLoginForm({
                username: "",
                email: "",
                password: "",
            });
        }
    };

    return (
        <form
            className="flex w-full flex-col"
            onSubmit={handleLogin}
        >
            <h2 className="mb-5 font-['Bricolage_Grotesque',sans-serif] text-2xl font-semibold tracking-tight">
                Welcome back
            </h2>

            <label
                htmlFor="log-username"
                className={labelClass}
            >
                Username
            </label>

            <input
                id="log-username"
                name="username"
                type="text"
                autoComplete="username"
                value={loginForm.username}
                onChange={handleChange}
                className={inputClass}
                required
            />

            <label
                htmlFor="log-email"
                className={labelClass}
            >
                Email
            </label>

            <input
                id="log-email"
                name="email"
                type="email"
                autoComplete="email"
                value={loginForm.email}
                onChange={handleChange}
                className={inputClass}
                required
            />

            <label
                htmlFor="log-password"
                className={labelClass}
            >
                Password
            </label>

            <input
                id="log-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={loginForm.password}
                onChange={handleChange}
                className={inputClass}
                required
            />

            <button
                type="submit"
                className={submitClass}
            >
                Log in
            </button>

            <p className="mt-4 text-sm text-[#5b6b65]">
                New here?{" "}
                <button
                    type="button"
                    className={switchBtnClass}
                    onClick={onSwitchToRegister}
                >
                    Create an account
                </button>
            </p>
        </form>
    );
};

export default LoginForm;