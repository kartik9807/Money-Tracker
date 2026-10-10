// import { useState } from "react";
// import { RegisterUser, LoginUser } from "../services/authService.js";
// import { toast, ToastContainer } from "react-toastify";
// import { toastConfig } from "../utils/toastConfig.jsx";
// import { useNavigate } from "react-router-dom";
// import {inputClass,labelClass,submitClass,switchBtnClass} from "../utils/styleClass.jsx";

// export default function RegLogin() {
//     const [mode, setMode] = useState("register"); // "register" | "login"
//     const formData = new FormData();
//     const [avatar, setAvatar] = useState(null)    

//     const [registerForm, setRegisterForm] = useState({
//         fullname: "",
//         username: "",
//         email: "",
//         password: "",
//     });
//     const [loginForm, setLoginForm] = useState({
//         username: "",
//         email: "",
//         password: "",
//     });
//     const isLogin = mode === "login";
//     const navigate = useNavigate();

//     const handleChange = (setter) => (e) =>
//         setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

//     const handleRegister = async (e) => {
//         e.preventDefault();
//         try {
//             console.log("register", registerForm);
//             formData.append("fullname",registerForm.fullname);
//             formData.append("username",registerForm.username);
//             formData.append("email",registerForm.email);
//             formData.append("password",registerForm.password);
//             formData.append("avatar",avatar);
//             const response = await RegisterUser(formData);
//             if (response.success) {
//                 navigate("/dashboard", { replace: true });
//             } else {
//                 toast.error(
//                     `${response.message || "Registration failed"}`,
//                     toastConfig,
//                 );
//                 setMode("register");
//                 setRegisterForm({
//                     fullname: "",
//                     username: "",
//                     email: "",
//                     password: "",
//                     avatar: null,
//                 });
//             }
//             console.log("register", registerForm);
//         } catch (error) {
//             toast.error(
//                 `${error.response?.data?.message || "Registration failed"}`,
//                 toastConfig,
//             );
//             setMode("register");
//             setRegisterForm({
//                 fullname: "",
//                 username: "",
//                 email: "",
//                 password: "",
//             });
//         }
//     };

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await LoginUser(loginForm);
//             console.log(response.success);
//             if (response && response.success) {
//                 navigate("/dashboard", { replace: true });
//             } else {
//                 toast.error(
//                     `${response.message || "Login failed"}`,
//                     toastConfig,
//                 );
//                 setMode("login");
//                 setLoginForm({ username: "", email: "", password: "" });
//             }
//             console.log("login", loginForm);
//         } catch (error) {
//             console.log(error);
//             toast.error(
//                 `${error.response?.data?.message || "Login failed"}`,
//                 toastConfig,
//             );
//             setMode("login");
//             setLoginForm({ username: "", email: "", password: "" });
//         }
//     };

//     // Off-screen panel leaves the tab order once the slide finishes
//     const panelClass = (hidden) =>
//         "flex basis-1/2 shrink-0 grow-0 items-center px-6 py-7 md:px-11 md:py-10 " +
//         (hidden
//             ? "invisible transition-[visibility] duration-0 delay-[600ms]"
//             : "visible");

//     return (
//         <>
//             <ToastContainer
//                 position="top-right"
//                 autoClose={5000}
//                 hideProgressBar={false}
//                 newestOnTop={false}
//                 closeOnClick={false}
//                 rtl={false}
//                 pauseOnFocusLoss
//                 draggable
//                 pauseOnHover
//                 theme="light"
//             />
//             <main className="grid min-h-screen place-items-center bg-[#f3f6f2] p-6 font-['Figtree',system-ui,sans-serif] text-[#14201c]">
//                 <section className="grid w-full max-w-220 overflow-hidden rounded-2xl border border-[#cfd9d3] bg-white shadow-[0_18px_40px_-24px_rgba(15,61,51,0.45)] md:min-h-130 md:grid-cols-[1fr_1.15fr]">
//                     <aside className="flex flex-col justify-end border-b-[3px] border-[#c9a227] bg-[#0f3d33] bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgba(234,242,238,0.09)_31px,rgba(234,242,238,0.09)_32px)] px-7 py-6 text-[#eaf2ee] md:border-b-0 md:border-r-[3px] md:px-9 md:py-10">
//                         <span className="text-3xl font-['Bricolage_Grotesque',sans-serif] text-[#c9a227] font-extrabold">Your</span>
//                         <h1 className="mb-2 font-['Bricolage_Grotesque',sans-serif] text-3xl font-bold tracking-tight md:text-4xl">
//                             Money Tracker
//                         </h1>
//                         <p className="text-base text-[#eaf2ee]/80">
//                             Know where every rupee goes.
//                         </p>
//                     </aside>

//                     {/* Sliding area */}
//                     <div className="overflow-hidden">
//                         <div
//                             className={
//                                 "flex h-full w-[200%] transition-transform duration-600 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none " +
//                                 (isLogin ? "-translate-x-1/2" : "translate-x-0")
//                             }
//                         >
//                             <div
//                                 className={panelClass(isLogin)}
//                                 aria-hidden={isLogin}
//                             >
//                                 <form
//                                     className="flex w-full flex-col"
//                                     onSubmit={handleRegister}
//                                     encType="multipart/form-data"
//                                 >
//                                     <h2 className="mb-5 font-['Bricolage_Grotesque',sans-serif] text-2xl font-semibold tracking-tight">
//                                         Create your account
//                                     </h2>

//                                     <label
//                                         htmlFor="reg-name"
//                                         className={labelClass}
//                                     >
//                                         FullName
//                                     </label>
//                                     <input
//                                         id="reg-name"
//                                         name="fullname"
//                                         type="text"
//                                         autoComplete="fullname"
//                                         value={registerForm.fullname}
//                                         onChange={handleChange(setRegisterForm)}
//                                         className={inputClass}
//                                         required
//                                     />

//                                     <label
//                                         htmlFor="reg-username"
//                                         className={labelClass}
//                                     >
//                                         Username
//                                     </label>
//                                     <input
//                                         id="reg-username"
//                                         name="username"
//                                         type="text"
//                                         autoComplete="username"
//                                         value={registerForm.username}
//                                         onChange={handleChange(setRegisterForm)}
//                                         className={inputClass}
//                                         required
//                                     />

//                                     <label
//                                         htmlFor="reg-email"
//                                         className={labelClass}
//                                     >
//                                         Email
//                                     </label>
//                                     <input
//                                         id="reg-email"
//                                         name="email"
//                                         type="email"
//                                         autoComplete="email"
//                                         value={registerForm.email}
//                                         onChange={handleChange(setRegisterForm)}
//                                         className={inputClass}
//                                         required
//                                     />

//                                     <label
//                                         htmlFor="reg-password"
//                                         className={labelClass}
//                                     >
//                                         Password
//                                     </label>
//                                     <input
//                                         id="reg-password"
//                                         name="password"
//                                         type="password"
//                                         autoComplete="new-password"
//                                         minLength={6}
//                                         value={registerForm.password}
//                                         onChange={handleChange(setRegisterForm)}
//                                         className={inputClass}
//                                         required
//                                     />

//                                     <label
//                                         htmlFor="reg-avatar"
//                                         className={labelClass}
//                                     >
//                                         Avatar
//                                     </label>
//                                     <input
//                                         id="reg-avatar"
//                                         name="avatar"
//                                         type="file"
//                                         accept="image/*"
//                                         onChange={(e)=>setAvatar(e.target.files[0])}
//                                         className={inputClass}
//                                     />
//                                     <button
//                                         type="submit"
//                                         className={submitClass}
//                                     >
//                                         Create account
//                                     </button>

//                                     <p className="mt-4 text-sm text-[#5b6b65]">
//                                         Already have an account?{" "}
//                                         <button
//                                             type="button"
//                                             className={switchBtnClass}
//                                             onClick={() => setMode("login")}
//                                         >
//                                             Log in
//                                         </button>
//                                     </p>
//                                 </form>
//                             </div>

//                             {/* Login (slides in from the right) */}
//                             <div
//                                 className={panelClass(!isLogin)}
//                                 aria-hidden={!isLogin}
//                             >
//                                 <form
//                                     className="flex w-full flex-col"
//                                     onSubmit={handleLogin}
//                                 >
//                                     <h2 className="mb-5 font-['Bricolage_Grotesque',sans-serif] text-2xl font-semibold tracking-tight">
//                                         Welcome back
//                                     </h2>

//                                     <label
//                                         htmlFor="log-username"
//                                         className={labelClass}
//                                     >
//                                         Username
//                                     </label>
//                                     <input
//                                         id="log-username"
//                                         name="username"
//                                         type="text"
//                                         autoComplete="username"
//                                         value={loginForm.username}
//                                         onChange={handleChange(setLoginForm)}
//                                         className={inputClass}
//                                         required
//                                     />

//                                     <label
//                                         htmlFor="log-email"
//                                         className={labelClass}
//                                     >
//                                         Email
//                                     </label>
//                                     <input
//                                         id="log-email"
//                                         name="email"
//                                         type="email"
//                                         autoComplete="email"
//                                         value={loginForm.email}
//                                         onChange={handleChange(setLoginForm)}
//                                         className={inputClass}
//                                         required
//                                     />

//                                     <label
//                                         htmlFor="log-password"
//                                         className={labelClass}
//                                     >
//                                         Password
//                                     </label>
//                                     <input
//                                         id="log-password"
//                                         name="password"
//                                         type="password"
//                                         autoComplete="current-password"
//                                         value={loginForm.password}
//                                         onChange={handleChange(setLoginForm)}
//                                         className={inputClass}
//                                         required
//                                     />

//                                     <button
//                                         type="submit"
//                                         className={submitClass}
//                                     >
//                                         Log in
//                                     </button>

//                                     <p className="mt-4 text-sm text-[#5b6b65]">
//                                         New here?{" "}
//                                         <button
//                                             type="button"
//                                             className={switchBtnClass}
//                                             onClick={() => setMode("register")}
//                                         >
//                                             Create an account
//                                         </button>
//                                     </p>
//                                 </form>
//                             </div>
//                         </div>
//                     </div>
//                 </section>
//             </main>
//         </>
//     );
// }
import { useState } from "react";
import { ToastContainer } from "react-toastify";

import LoginForm from "../components/auth/LoginForm.jsx";
import RegisterForm from "../components/auth/RegisterForm.jsx";
import AuthBackground from "../components/auth/AuthBackground.jsx";

export default function RegLogin() {
    const [mode, setMode] = useState("register");

    const isLogin = mode === "login";

    const panelClass = (hidden) =>
        "flex basis-1/2 shrink-0 grow-0 items-center px-6 py-7 md:px-11 md:py-10 " +
        (hidden
            ? "invisible transition-[visibility] duration-0 delay-[600ms]"
            : "visible");

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <main className="relative grid min-h-screen place-items-center  p-6 font-['Figtree',system-ui,sans-serif] text-[#14201c]">

                <AuthBackground />

                <section className="grid w-full max-w-220 overflow-hidden rounded-2xl border border-[#cfd9d3] bg-white shadow-[0_18px_40px_-24px_rgba(15,61,51,0.45)] md:min-h-130 md:grid-cols-[1fr_1.15fr]">

                    <aside className="flex flex-col justify-end border-b-[3px] border-[#c9a227] bg-[#0f3d33] bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgba(234,242,238,0.09)_31px,rgba(234,242,238,0.09)_32px)] px-7 py-6 text-[#eaf2ee] md:border-b-0 md:border-r-[3px] md:px-9 md:py-10">

                        <span className="font-['Bricolage_Grotesque',sans-serif] text-3xl font-extrabold text-[#c9a227]">
                            Your
                        </span>

                        <h1 className="mb-2 font-['Bricolage_Grotesque',sans-serif] text-3xl font-bold tracking-tight md:text-4xl">
                            Expense Tracker
                        </h1>

                        <p className="text-base text-[#eaf2ee]/80">
                            Know where every rupee goes.
                        </p>

                    </aside>

                    <div className="overflow-hidden">
                        <div className={
                                "flex h-full w-[200%] transition-transform duration-600 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none " +
                                (isLogin
                                    ? "-translate-x-1/2"
                                    : "translate-x-0")
                            }
                        >
                            <div
                                className={panelClass(isLogin)}
                                aria-hidden={isLogin}
                            >
                                <RegisterForm
                                    onSwitchToLogin={() =>
                                        setMode("login")
                                    }
                                    setMode={setMode}
                                />
                            </div>

                            <div
                                className={panelClass(!isLogin)}
                                aria-hidden={!isLogin}
                            >
                                <LoginForm
                                    onSwitchToRegister={() =>
                                        setMode("register")
                                    }
                                    setMode={setMode}
                                />
                            </div>

                        </div>

                    </div>

                </section>

            </main>
        </>
    );
}