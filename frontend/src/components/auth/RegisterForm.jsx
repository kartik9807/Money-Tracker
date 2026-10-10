import { useState } from "react";
import { toast } from "react-toastify";
import { toastConfig } from "../../utils/toastConfig.jsx";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../../hooks/useAuth.jsx";
import {
    inputClass,
    labelClass,
    submitClass,
    switchBtnClass,
} from "../../utils/styleClass.jsx";

const RegisterForm = ({ onSwitchToLogin,setMode}) => {
    const navigate = useNavigate();
    const {Register} = useAuth();
    const [avatar, setAvatar] = useState(null);

    const [registerForm, setRegisterForm] = useState({
        fullname: "",
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setRegisterForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            formData.append("fullname", registerForm.fullname);
            formData.append("username", registerForm.username);
            formData.append("email", registerForm.email);
            formData.append("password", registerForm.password);

            if (avatar) {
                formData.append("avatar", avatar);
            }

            const response = await Register(formData);
            console.log("register response",response)
            if (response.success) {
                navigate("/dashboard", { replace: true });
            } else {
                toast.error(
                    response.message || "Registration failed",
                    toastConfig
                );

                setRegisterForm({
                    fullname: "",
                    username: "",
                    email: "",
                    password: "",
                });

                setAvatar(null);
            }
        } catch (error) {
            // console.log("Registration error:", error);
            // console.log("error",error.response?.data?.message)
            // console.log("error",error.message)
            if(error.response?.data?.message && error.response?.data?.message.includes("user already existed please login")){
                    setMode("login");
            }
            toast.error(
                error.response?.data?.message || "Registration failed",
                toastConfig
            );

            setRegisterForm({
                fullname: "",
                username: "",
                email: "",
                password: "",
            });

            setAvatar(null);
        }
    };

    return (
        <form
            className="flex w-full flex-col"
            onSubmit={handleRegister}
            encType="multipart/form-data"
        >
            <h2 className="mb-5 font-['Bricolage_Grotesque',sans-serif] text-2xl font-semibold tracking-tight">
                Create your account
            </h2>

            <label
                htmlFor="reg-name"
                className={labelClass}
            >
                FullName
            </label>

            <input
                id="reg-name"
                name="fullname"
                type="text"
                autoComplete="name"
                value={registerForm.fullname}
                onChange={handleChange}
                className={inputClass}
                required
            />

            <label
                htmlFor="reg-username"
                className={labelClass}
            >
                Username
            </label>

            <input
                id="reg-username"
                name="username"
                type="text"
                autoComplete="username"
                value={registerForm.username}
                onChange={handleChange}
                className={inputClass}
                required
            />

            <label
                htmlFor="reg-email"
                className={labelClass}
            >
                Email
            </label>

            <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                value={registerForm.email}
                onChange={handleChange}
                className={inputClass}
                required
            />

            <label
                htmlFor="reg-password"
                className={labelClass}
            >
                Password
            </label>

            <input
                id="reg-password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={registerForm.password}
                onChange={handleChange}
                className={inputClass}
                required
            />

            <label
                htmlFor="reg-avatar"
                className={labelClass}
            >
                Avatar
            </label>

            <input
                id="reg-avatar"
                name="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
                className={inputClass}
            />

            <button
                type="submit"
                className={submitClass}
            >
                Create account
            </button>

            <p className="mt-4 text-sm text-[#5b6b65]">
                Already have an account?{" "}
                <button
                    type="button"
                    className={switchBtnClass}
                    onClick={onSwitchToLogin}
                >
                    Log in
                </button>
            </p>
        </form>
    );
};

export default RegisterForm;