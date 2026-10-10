// import { useCallback, useEffect, useState } from "react";
// import {
//     Camera,
//     CalendarDays,
//     Check,
//     Copy,
//     Edit3,
//     Eye,
//     EyeOff,
//     Hash,
//     Loader2,
//     Lock,
//     Mail,
//     Save,
//     ShieldCheck,
//     Undo2,
//     User,
//     X,
// } from "lucide-react";
// import { toast } from "react-toastify";

// import { useAuth } from "../hooks/useAuth.jsx";
// import { toastConfig } from "../utils/toastConfig.jsx";
// import {focusRing,primaryBtn,ghostBtn} from '../utils/styleClass.jsx'
// import { editUser } from "../services/authService.js";

// // Strength helper for the new-password meter
// const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
// const strengthColors = ["#b42318", "#b42318", "#c9a227", "#0f3d33", "#0f3d33"];

// const getStrength = (pw) => {
//     let score = 0;
//     if (pw.length >= 8) score++;
//     if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
//     if (/\d/.test(pw)) score++;
//     if (/[^A-Za-z0-9]/.test(pw)) score++;
//     return score;
// };

// // Defined outside Profile so inputs keep focus while typing
// const TextField = ({
//     id,
//     label,
//     icon: Icon,
//     prefix,
//     rightSlot,
//     error,
//     hint,
//     disabled,
//     ...inputProps
// }) => (
//     <div>
//         <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#14201c]">
//             {label}
//         </label>

//         <div className="relative">
//             {Icon && (
//                 <Icon
//                     size={18}
//                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5b6b65]"
//                 />
//             )}
//             {prefix && (
//                 <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#5b6b65]">
//                     {prefix}
//                 </span>
//             )}

//             <input
//                 id={id}
//                 disabled={disabled}
//                 aria-invalid={error ? "true" : undefined}
//                 aria-describedby={error || hint ? `${id}-note` : undefined}
//                 className={
//                     "w-full rounded-xl border py-3 pl-10 text-sm text-[#14201c] outline-none transition-all duration-200 placeholder:text-[#8a9a93] disabled:opacity-100 " +
//                     (rightSlot ? "pr-11 " : "pr-4 ") +
//                     (disabled
//                         ? "cursor-default border-[#e3eae6] bg-[#f3f6f2] "
//                         : error
//                           ? "border-[#b42318] bg-white focus:ring-4 focus:ring-[#b42318]/15 "
//                           : "border-[#cfd9d3] bg-white hover:border-[#0f3d33]/50 focus:border-[#0f3d33] focus:ring-4 focus:ring-[#c9a227]/25 ")
//                 }
//                 {...inputProps}
//             />

//             {rightSlot && (
//                 <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
//             )}
//         </div>

//         {(error || hint) && (
//             <p
//                 id={`${id}-note`}
//                 className={"mt-1.5 text-xs " + (error ? "font-medium text-[#b42318]" : "text-[#5b6b65]")}
//             >
//                 {error || hint}
//             </p>
//         )}
//     </div>
// );

// const Profile = ({user}) => {
//     console.log(user)
//     const [isEditing, setIsEditing] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const [copied, setCopied] = useState(false);
//     const [touched, setTouched] = useState({});

//     const [formData, setFormData] = useState({
//         fullname: "",
//         username: "",
//         password: "",
//     });

//     // Actual File object — this will be sent to backend
//     const [avatarFile, setAvatarFile] = useState(null);

//     // Preview shown in UI
//     const [avatarPreview, setAvatarPreview] = useState("");
//     useEffect(() => {
//         if (user) {
//             setFormData({
//                 fullname: user.fullname || "",
//                 username: user.username || "",
//                 password: "",
//             });
//             setAvatarPreview(user.avatar || "");
//             setAvatarFile(null);
//         }
//     }, [user]);

//     // Free the temporary preview URL when it is replaced or the page closes
//     useEffect(() => {
//         return () => {
//             if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
//         };
//     }, [avatarPreview]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const handleBlur = (e) => {
//         const { name } = e.target;
//         setTouched((prev) => ({ ...prev, [name]: true }));
//     };

//     const handleAvatarChange = (e) => {
//         const file = e.target.files?.[0];

//         // Reset so choosing the same file again still fires onChange
//         e.target.value = "";

//         if (!file) return;

//         if (!file.type.startsWith("image/")) {
//             toast.error("Please select a valid image", toastConfig);
//             return;
//         }

//         if (file.size > 5 * 1024 * 1024) {
//             toast.error("Avatar must be smaller than 5MB", toastConfig);
//             return;
//         }

//         // Store actual File object
//         setAvatarFile(file);

//         // Create preview for UI
//         setAvatarPreview(URL.createObjectURL(file));
//     };

//     const handleUndoAvatar = () => {
//         setAvatarFile(null);
//         setAvatarPreview(user?.avatar || "");
//     };

//     const handleEdit = () => {
//         setIsEditing(true);
//     };

//     const handleCancel = useCallback(() => {
//         setIsEditing(false);
//         setShowPassword(false);
//         setTouched({});

//         // Restore original values
//         setFormData({
//             fullname: user?.fullname || "",
//             username: user?.username || "",
//             password: "",
//         });

//         setAvatarFile(null);
//         setAvatarPreview(user?.avatar || "");
//     }, [user]);

//     // Press Esc to leave edit mode
//     useEffect(() => {
//         if (!isEditing) return;

//         const onKeyDown = (e) => {
//             if (e.key === "Escape" && !isSaving) handleCancel();
//         };

//         window.addEventListener("keydown", onKeyDown);
//         return () => window.removeEventListener("keydown", onKeyDown);
//     }, [isEditing, isSaving, handleCancel]);

//     const handleCopyId = async () => {
//         try {
//             await navigator.clipboard.writeText(user._id);
//             setCopied(true);
//             setTimeout(() => setCopied(false), 1600);
//         } catch {
//             toast.error("Could not copy the ID", toastConfig);
//         }
//     };

//     // Validation
//     const errors = {};
//     if (!formData.fullname.trim()) errors.fullname = "Full name is required";
//     if (!formData.username.trim()) errors.username = "Username is required";
//     else if (formData.username.trim().length < 3) errors.username = "Use at least 3 characters";
//     else if (/\s/.test(formData.username)) errors.username = "Spaces are not allowed";
//     if (formData.password && formData.password.length < 6)
//         errors.password = "Use at least 6 characters";

//     const showError = (name) => (touched[name] ? errors[name] : undefined);

//     const hasChanges =
//         !!user &&
//         (formData.fullname !== (user.fullname || "") ||
//             formData.username !== (user.username || "") ||
//             formData.password.trim() !== "" ||
//             avatarFile !== null);

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (Object.keys(errors).length > 0) {
//             setTouched({ fullname: true, username: true, password: true });
//             toast.error("Please fix the highlighted fields", toastConfig);
//             return;
//         }

//         try {
//             setIsSaving(true);

//             const data = new FormData();

//             data.append("fullname", formData.fullname);
//             data.append("username", formData.username);

//             // Only send password if user actually entered one
//             if (formData.password.trim()) {
//                 data.append("password", formData.password);
//             }

//             // Only send avatar if a new image was selected
//             if (avatarFile) {
//                 data.append("avatar", avatarFile);
//             }

//             try {
//               const response = await editUser(data)
//               if(response.success){
//                 toast.success("Profile updated successfully", toastConfig);
//               }
//             } catch (error) {
//               toast.error(
//                 error.response?.data?.message || "Failed to update profile",
//                 toastConfig
//               );
//             }

//             console.log("FormData prepared");

//             for (const [key, value] of data.entries()) {
//                 console.log(key, value);
//             }

//             toast.success("Profile data ready to update", toastConfig);
//             setIsEditing(false);
//             setShowPassword(false);
//             setTouched({});
//         } catch (error) {
//             console.error("Profile update error:", error);

//             toast.error(
//                 error.response?.data?.message || "Failed to update profile",
//                 toastConfig
//             );
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     if (!user) {
//         return null;
//     }

//     const strength = getStrength(formData.password);
//     const memberSince = user.createdAt
//         ? new Date(user.createdAt).toLocaleDateString("en-IN", {
//               day: "numeric",
//               month: "long",
//               year: "numeric",
//           })
//         : null;

//     return (
//         <div className="min-h-[calc(100vh-120px)] font-['Figtree',system-ui,sans-serif] text-[#14201c]">
//             <style>{`@keyframes pf-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>

//             {/* Header */}
//             <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div className="flex items-center gap-3">
//                     <span className="h-10 w-1.5 rounded-full bg-[#0f3d33]" aria-hidden="true" />
//                     <div>
//                         <h1 className="font-['Unbounded',sans-serif] text-2xl font-semibold tracking-tight">
//                             Profile
//                         </h1>

//                         <p className="mt-1 text-sm text-[#5b6b65]">
//                             {isEditing
//                                 ? "Editing your details. Press Esc to cancel."
//                                 : "Manage your account information and preferences."}
//                         </p>
//                     </div>
//                 </div>

//                 {!isEditing ? (
//                     <button type="button" onClick={handleEdit} className={primaryBtn}>
//                         <Edit3 size={16} />
//                         Edit Profile
//                     </button>
//                 ) : (
//                     <div className="flex items-center gap-3">
//                         {hasChanges && !isSaving && (
//                             <span className="hidden items-center gap-2 text-xs font-medium text-[#5b6b65] sm:flex">
//                                 <span className="h-2 w-2 rounded-full bg-[#c9a227]" />
//                                 Unsaved changes
//                             </span>
//                         )}

//                         <button
//                             type="button"
//                             onClick={handleCancel}
//                             disabled={isSaving}
//                             className={ghostBtn}
//                         >
//                             <X size={16} />
//                             Cancel
//                         </button>

//                         <button
//                             type="submit"
//                             form="profile-form"
//                             disabled={isSaving || !hasChanges}
//                             className={primaryBtn}
//                         >
//                             {isSaving ? (
//                                 <Loader2 size={16} className="animate-spin" />
//                             ) : (
//                                 <Save size={16} />
//                             )}
//                             {isSaving ? "Saving..." : "Save Changes"}
//                         </button>
//                     </div>
//                 )}
//             </div>

//             {/* Main Card */}
//             <div
//                 className="overflow-hidden rounded-2xl border border-[#cfd9d3] bg-white shadow-[0_18px_40px_-28px_rgba(15,61,51,0.5)] motion-reduce:animate-none animate-[pf-rise_0.5s_ease-out_both]"
//             >
//                 {/* Cover, ruled like a ledger page */}
//                 <div className="relative h-36 overflow-hidden bg-[#0f3d33] bg-[image:repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgba(255,255,255,0.08)_31px,rgba(255,255,255,0.08)_32px)]">
//                     <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-[#c9a227]/25" />
//                     <div className="absolute -right-2 top-16 h-24 w-24 rounded-full bg-[#c9a227]/40" />
//                     <div className="absolute bottom-0 left-0 h-1 w-full bg-[#c9a227]" />
//                 </div>

//                 {/* Profile section */}
//                 <div className="px-6 pb-8 sm:px-8">
//                     {/* Identity row */}
//                     <div className="-mt-16 mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
//                         {/* Avatar */}
//                         <div className="relative w-fit">
//                             <label
//                                 htmlFor="avatar"
//                                 className={
//                                     "group relative block h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-[#eaf2ee] shadow-lg transition-all duration-300 focus-within:ring-4 focus-within:ring-[#c9a227]/60 " +
//                                     (isEditing ? "cursor-pointer hover:ring-4 hover:ring-[#c9a227]/50" : "")
//                                 }
//                             >
//                                 {avatarPreview ? (
//                                     <img
//                                         src={avatarPreview}
//                                         alt="Profile avatar"
//                                         className="h-full w-full object-cover"
//                                     />
//                                 ) : (
//                                     <span className="flex h-full w-full items-center justify-center font-['Unbounded',sans-serif] text-4xl font-semibold text-[#0f3d33]">
//                                         {user.fullname?.charAt(0)?.toUpperCase() || "U"}
//                                     </span>
//                                 )}

//                                 {isEditing && (
//                                     <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#0f3d33]/60 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
//                                         <Camera size={20} />
//                                         Change
//                                     </span>
//                                 )}

//                                 <input
//                                     id="avatar"
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={handleAvatarChange}
//                                     disabled={!isEditing}
//                                     className="sr-only"
//                                 />
//                             </label>

//                             {isEditing && (
//                                 <span
//                                     className="pointer-events-none absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#c9a227] text-[#0f3d33] shadow-md"
//                                     aria-hidden="true"
//                                 >
//                                     <Camera size={15} />
//                                 </span>
//                             )}
//                         </div>

//                         {/* Name block */}
//                         <div className="sm:flex-1 sm:pb-2">
//                             <h2 className="font-['Unbounded',sans-serif] text-xl font-semibold tracking-tight">
//                                 {user.fullname || "Your name"}
//                             </h2>

//                             <div className="mt-1.5 flex flex-wrap items-center gap-3">
//                                 <span className="text-sm text-[#5b6b65]">@{user.username}</span>

//                                 <span className="flex items-center gap-2 rounded-full bg-[#eaf2ee] px-3 py-1 text-xs font-semibold text-[#0f3d33]">
//                                     <span className="relative flex h-2 w-2">
//                                         <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0f3d33] opacity-50 motion-reduce:animate-none" />
//                                         <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0f3d33]" />
//                                     </span>
//                                     Active
//                                 </span>

//                                 {isEditing && avatarFile && (
//                                     <button
//                                         type="button"
//                                         onClick={handleUndoAvatar}
//                                         className={
//                                             "flex cursor-pointer items-center gap-1.5 rounded-full border border-[#cfd9d3] px-3 py-1 text-xs font-semibold text-[#5b6b65] transition-colors hover:border-[#0f3d33] hover:text-[#0f3d33] " +
//                                             focusRing
//                                         }
//                                     >
//                                         <Undo2 size={13} />
//                                         Undo new photo
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Form */}
//                     <form id="profile-form" onSubmit={handleSubmit} noValidate>
//                         <div className="grid gap-6 md:grid-cols-2">
//                             {/* Full Name */}
//                             <TextField
//                                 id="fullname"
//                                 name="fullname"
//                                 label="Full Name"
//                                 icon={User}
//                                 type="text"
//                                 autoComplete="name"
//                                 value={formData.fullname}
//                                 onChange={handleChange}
//                                 onBlur={handleBlur}
//                                 disabled={!isEditing}
//                                 error={isEditing ? showError("fullname") : undefined}
//                             />

//                             {/* Username */}
//                             <TextField
//                                 id="username"
//                                 name="username"
//                                 label="Username"
//                                 prefix="@"
//                                 type="text"
//                                 autoComplete="username"
//                                 value={formData.username}
//                                 onChange={handleChange}
//                                 onBlur={handleBlur}
//                                 disabled={!isEditing}
//                                 error={isEditing ? showError("username") : undefined}
//                             />

//                             {/* Email */}
//                             <TextField
//                                 id="email"
//                                 label="Email"
//                                 icon={Mail}
//                                 type="email"
//                                 value={user.email || ""}
//                                 readOnly
//                                 disabled
//                                 rightSlot={<Lock size={15} className="text-[#8a9a93]" />}
//                                 hint="Email cannot be changed."
//                             />

//                             {/* Password */}
//                             {isEditing && (
//                                 <div className="motion-reduce:animate-none animate-[pf-rise_0.4s_ease-out_both]">
//                                     <TextField
//                                         id="password"
//                                         name="password"
//                                         label="New Password"
//                                         icon={Lock}
//                                         type={showPassword ? "text" : "password"}
//                                         autoComplete="new-password"
//                                         value={formData.password}
//                                         onChange={handleChange}
//                                         onBlur={handleBlur}
//                                         placeholder="Leave blank to keep current password"
//                                         error={showError("password")}
//                                         rightSlot={
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setShowPassword((s) => !s)}
//                                                 aria-label={showPassword ? "Hide password" : "Show password"}
//                                                 className={
//                                                     "grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#5b6b65] transition-colors hover:bg-[#eaf2ee] hover:text-[#0f3d33] " +
//                                                     focusRing
//                                                 }
//                                             >
//                                                 {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
//                                             </button>
//                                         }
//                                     />

//                                     {formData.password && (
//                                         <div className="mt-2.5" aria-live="polite">
//                                             <div className="flex gap-1.5">
//                                                 {[0, 1, 2, 3].map((i) => (
//                                                     <span
//                                                         key={i}
//                                                         className="h-1.5 flex-1 rounded-full bg-[#e3eae6] transition-colors duration-300"
//                                                         style={
//                                                             i < strength
//                                                                 ? { backgroundColor: strengthColors[strength] }
//                                                                 : undefined
//                                                         }
//                                                     />
//                                                 ))}
//                                             </div>
//                                             <p
//                                                 className="mt-1.5 text-xs font-semibold"
//                                                 style={{ color: strengthColors[strength] }}
//                                             >
//                                                 {strengthLabels[strength]}
//                                             </p>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     </form>

//                     {/* Account information */}
//                     <div className="mt-10 border-t border-[#e3eae6] pt-6">
//                         <h2 className="mb-4 font-['Unbounded',sans-serif] text-sm font-semibold">
//                             Account Information
//                         </h2>

//                         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                             {/* User ID with copy */}
//                             <div className="group rounded-xl border border-transparent bg-[#f3f6f2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cfd9d3] hover:bg-white hover:shadow-[0_12px_24px_-16px_rgba(15,61,51,0.5)]">
//                                 <div className="flex items-center justify-between gap-2">
//                                     <p className="flex items-center gap-2 text-xs font-medium text-[#5b6b65]">
//                                         <Hash size={14} />
//                                         User ID
//                                     </p>

//                                     <button
//                                         type="button"
//                                         onClick={handleCopyId}
//                                         aria-label="Copy user ID"
//                                         className={
//                                             "grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-[#5b6b65] transition-colors hover:bg-[#eaf2ee] hover:text-[#0f3d33] " +
//                                             focusRing
//                                         }
//                                     >
//                                         {copied ? (
//                                             <Check size={14} className="text-[#0f3d33]" />
//                                         ) : (
//                                             <Copy size={14} />
//                                         )}
//                                     </button>
//                                 </div>

//                                 <p className="mt-2 truncate text-sm font-semibold">{user._id}</p>
//                                 <p className="mt-1 h-4 text-xs font-medium text-[#0f3d33]" aria-live="polite">
//                                     {copied ? "Copied to clipboard" : ""}
//                                 </p>
//                             </div>

//                             {/* Status */}
//                             <div className="rounded-xl border border-transparent bg-[#f3f6f2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cfd9d3] hover:bg-white hover:shadow-[0_12px_24px_-16px_rgba(15,61,51,0.5)]">
//                                 <p className="flex items-center gap-2 text-xs font-medium text-[#5b6b65]">
//                                     <ShieldCheck size={14} />
//                                     Account Status
//                                 </p>
//                                 <p className="mt-2 text-sm font-semibold text-[#0f3d33]">Active</p>
//                                 <p className="mt-1 h-4 text-xs text-[#5b6b65]">Your account is in good standing</p>
//                             </div>

//                             {/* Member since (only if the API returns createdAt) */}
//                             {memberSince && (
//                                 <div className="rounded-xl border border-transparent bg-[#f3f6f2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cfd9d3] hover:bg-white hover:shadow-[0_12px_24px_-16px_rgba(15,61,51,0.5)]">
//                                     <p className="flex items-center gap-2 text-xs font-medium text-[#5b6b65]">
//                                         <CalendarDays size={14} />
//                                         Member Since
//                                     </p>
//                                     <p className="mt-2 text-sm font-semibold">{memberSince}</p>
//                                     <p className="mt-1 h-4" />
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Profile;
import { useCallback, useEffect, useState } from "react";

import {
    Camera,
    CalendarDays,
    Check,
    Copy,
    Edit3,
    Eye,
    EyeOff,
    Hash,
    Loader2,
    Lock,
    Mail,
    Save,
    ShieldCheck,
    Undo2,
    User,
    X,
} from "lucide-react";

import { toast } from "react-toastify";

import { useAuth } from "../hooks/useAuth.jsx";
import { toastConfig } from "../utils/toastConfig.jsx";

import { focusRing, primaryBtn, ghostBtn } from "../utils/styleClass.jsx";

import { editUser, changePassword } from "../services/authService.js";

// ---------------------------------------------------------
// Password strength helper
// ---------------------------------------------------------

const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

const strengthColors = ["#b42318", "#b42318", "#c9a227", "#0f3d33", "#0f3d33"];

const getStrength = (pw) => {
    let score = 0;

    if (pw.length >= 8) score++;

    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) {
        score++;
    }

    if (/\d/.test(pw)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(pw)) {
        score++;
    }

    return score;
};

// ---------------------------------------------------------
// Reusable TextField
// ---------------------------------------------------------

const TextField = ({
    id,
    label,
    icon: Icon,
    prefix,
    rightSlot,
    error,
    hint,
    disabled,
    ...inputProps
}) => (
    <div>
        <label
            htmlFor={id}
            className="mb-2 block text-sm font-medium text-[#14201c]"
        >
            {label}
        </label>

        <div className="relative">
            {Icon && (
                <Icon
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5b6b65]"
                />
            )}

            {prefix && (
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#5b6b65]">
                    {prefix}
                </span>
            )}

            <input
                id={id}
                disabled={disabled}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error || hint ? `${id}-note` : undefined}
                className={
                    "w-full rounded-xl border py-3 pl-10 text-sm text-[#14201c] outline-none transition-all duration-200 placeholder:text-[#8a9a93] disabled:opacity-100 " +
                    (rightSlot ? "pr-11 " : "pr-4 ") +
                    (disabled
                        ? "cursor-default border-[#e3eae6] bg-[#f3f6f2] "
                        : error
                          ? "border-[#b42318] bg-white focus:ring-4 focus:ring-[#b42318]/15 "
                          : "border-[#cfd9d3] bg-white hover:border-[#0f3d33]/50 focus:border-[#0f3d33] focus:ring-4 focus:ring-[#c9a227]/25 ")
                }
                {...inputProps}
            />

            {rightSlot && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {rightSlot}
                </div>
            )}
        </div>

        {(error || hint) && (
            <p
                id={`${id}-note`}
                className={
                    "mt-1.5 text-xs " +
                    (error ? "font-medium text-[#b42318]" : "text-[#5b6b65]")
                }
            >
                {error || hint}
            </p>
        )}
    </div>
);

// ---------------------------------------------------------
// Profile
// ---------------------------------------------------------

const Profile = () => {
    const { user } = useAuth();

    // -----------------------------------------------------
    // Profile edit state
    // -----------------------------------------------------

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        fullname: "",
        username: "",
    });

    // -----------------------------------------------------
    // Avatar state
    // -----------------------------------------------------

    // Actual File object sent to backend
    const [avatarFile, setAvatarFile] = useState(null);

    // URL used only for preview
    const [avatarPreview, setAvatarPreview] = useState("");

    // -----------------------------------------------------
    // Password state
    // -----------------------------------------------------

    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [isChangingPasswordLoading, setIsChangingPasswordLoading] =
        useState(false);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const [showNewPassword, setShowNewPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // -----------------------------------------------------
    // Other UI state
    // -----------------------------------------------------

    const [copied, setCopied] = useState(false);
    const [touched, setTouched] = useState({});

    // -----------------------------------------------------
    // Initialize profile data from AuthContext
    // -----------------------------------------------------

    useEffect(() => {
        if (user) {
            setFormData({
                fullname: user.fullname || "",
                username: user.username || "",
            });

            setAvatarPreview(user.avatar || "");
            setAvatarFile(null);
        }
    }, [user]);

    // -----------------------------------------------------
    // Clean up temporary avatar URLs
    // -----------------------------------------------------

    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    // -----------------------------------------------------
    // Handle normal profile fields
    // -----------------------------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;

        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }));
    };

    // -----------------------------------------------------
    // Avatar change
    // -----------------------------------------------------

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];

        // Allow selecting same file again
        e.target.value = "";

        if (!file) return;

        // File type validation
        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image", toastConfig);

            return;
        }

        // File size validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Avatar must be smaller than 5MB", toastConfig);

            return;
        }

        // Store actual File object
        setAvatarFile(file);

        // Create temporary preview
        const previewUrl = URL.createObjectURL(file);

        setAvatarPreview(previewUrl);
    };

    // -----------------------------------------------------
    // Undo avatar
    // -----------------------------------------------------

    const handleUndoAvatar = () => {
        setAvatarFile(null);

        setAvatarPreview(user?.avatar || "");
    };

    // -----------------------------------------------------
    // Enter profile edit mode
    // -----------------------------------------------------

    const handleEdit = () => {
        setIsEditing(true);
    };

    // -----------------------------------------------------
    // Cancel profile editing
    // -----------------------------------------------------

    const handleCancel = useCallback(() => {
        setIsEditing(false);

        setTouched({});

        setFormData({
            fullname: user?.fullname || "",
            username: user?.username || "",
        });

        setAvatarFile(null);

        setAvatarPreview(user?.avatar || "");
    }, [user]);

    // -----------------------------------------------------
    // Escape key
    // -----------------------------------------------------

    useEffect(() => {
        if (!isEditing) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape" && !isSaving) {
                handleCancel();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isEditing, isSaving, handleCancel]);

    // -----------------------------------------------------
    // Copy user ID
    // -----------------------------------------------------

    const handleCopyId = async () => {
        try {
            await navigator.clipboard.writeText(user._id);

            setCopied(true);

            setTimeout(() => setCopied(false), 1600);
        } catch {
            toast.error("Could not copy the ID", toastConfig);
        }
    };

    // -----------------------------------------------------
    // Profile validation
    // -----------------------------------------------------

    const errors = {};

    if (!formData.fullname.trim()) {
        errors.fullname = "Full name is required";
    }

    if (!formData.username.trim()) {
        errors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
        errors.username = "Use at least 3 characters";
    } else if (/\s/.test(formData.username)) {
        errors.username = "Spaces are not allowed";
    }

    const showError = (name) => (touched[name] ? errors[name] : undefined);

    // -----------------------------------------------------
    // Check whether profile has changes
    // -----------------------------------------------------

    const hasChanges =
        !!user &&
        (formData.fullname !== (user.fullname || "") ||
            formData.username !== (user.username || "") ||
            avatarFile !== null);

    // -----------------------------------------------------
    // Update profile
    // -----------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (Object.keys(errors).length > 0) {
            setTouched({
                fullname: true,
                username: true,
            });

            toast.error("Please fix the highlighted fields", toastConfig);

            return;
        }

        if (!hasChanges) {
            return;
        }

        try {
            setIsSaving(true);

            const data = new FormData();

            // Normal profile fields
            data.append("fullname", formData.fullname.trim());

            data.append("username", formData.username.trim());

            // Avatar only when changed
            if (avatarFile) {
                data.append("avatar", avatarFile);
            }

            const response = await editUser(data);

            if (response.success) {
                toast.success("Profile updated successfully", toastConfig);

                setIsEditing(false);

                setTouched({});

                setAvatarFile(null);

                /*
                 * Ideally your AuthContext should update
                 * user here using the updated user returned
                 * by the backend.
                 */
            }
        } catch (error) {
            console.error("Profile update error:", error);

            toast.error(
                error.response?.data?.message || "Failed to update profile",
                toastConfig,
            );
        } finally {
            setIsSaving(false);
        }
    };

    // -----------------------------------------------------
    // Password field handler
    // -----------------------------------------------------

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // -----------------------------------------------------
    // Change password
    // -----------------------------------------------------

    const handleChangePassword = async (e) => {
        e.preventDefault();

        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        // Required fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill all password fields", toastConfig);
            return;
        }

        // Password length
        if (newPassword.length < 6) {
            toast.error(
                "New password must contain at least 6 characters",
                toastConfig,
            );
            return;
        }

        // Password confirmation
        if (newPassword !== confirmPassword) {
            toast.error(
                "New password and confirm password do not match",
                toastConfig,
            );

            return;
        }

        // Prevent same password
        if (currentPassword === newPassword) {
            toast.error(
                "New password must be different from current password",
                toastConfig,
            );
            return;
        }

        try {
            setIsChangingPasswordLoading(true);

            const response = await changePassword({
                currentPassword,
                newPassword,
            });

            if (response.success) {
                toast.success("Password changed successfully", toastConfig);

                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });

                setIsChangingPassword(false);

                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            }
        } catch (error) {
            console.error("Password change error:", error);

            toast.error(
                error.response?.data?.message || "Failed to change password",
                toastConfig,
            );
        } finally {
            setIsChangingPasswordLoading(false);
        }
    };

    // -----------------------------------------------------
    // Cancel password change
    // -----------------------------------------------------

    const handleCancelPasswordChange = () => {
        setIsChangingPassword(false);

        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    // -----------------------------------------------------
    // No user
    // -----------------------------------------------------

    if (!user) {
        return null;
    }

    // -----------------------------------------------------
    // Password strength
    // -----------------------------------------------------

    const strength = getStrength(passwordForm.newPassword);

    // -----------------------------------------------------
    // Member since
    // -----------------------------------------------------

    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : null;

    // -----------------------------------------------------
    // UI
    // -----------------------------------------------------

    return (
        <div className="min-h-[calc(100vh-120px)] font-['Figtree',system-ui,sans-serif] text-[#14201c]">
            <style>
                {`
                    @keyframes pf-rise {
                        from {
                            opacity: 0;
                            transform: translateY(10px);
                        }

                        to {
                            opacity: 1;
                            transform: none;
                        }
                    }
                `}
            </style>

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span
                        className="h-10 w-1.5 rounded-full bg-[#0f3d33]"
                        aria-hidden="true"
                    />

                    <div>
                        <h1 className="font-['Unbounded',sans-serif] text-2xl font-semibold tracking-tight">
                            Profile
                        </h1>

                        <p className="mt-1 text-sm text-[#5b6b65]">
                            {isEditing
                                ? "Editing your details. Press Esc to cancel."
                                : "Manage your account information and preferences."}
                        </p>
                    </div>
                </div>

                {/* Profile buttons */}

                {!isEditing ? (
                    <button
                        type="button"
                        onClick={handleEdit}
                        className={primaryBtn}
                    >
                        <Edit3 size={16} />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        {hasChanges && !isSaving && (
                            <span className="hidden items-center gap-2 text-xs font-medium text-[#5b6b65] sm:flex">
                                <span className="h-2 w-2 rounded-full bg-[#c9a227]" />
                                Unsaved changes
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSaving}
                            className={ghostBtn}
                        >
                            <X size={16} />
                            Cancel
                        </button>

                        <button
                            type="submit"
                            form="profile-form"
                            disabled={isSaving || !hasChanges}
                            className={primaryBtn}
                        >
                            {isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}

                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>

            {/* =====================================================
                MAIN CARD
            ====================================================== */}

            <div
                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[#cfd9d3]
                    bg-white
                    shadow-[0_18px_40px_-28px_rgba(15,61,51,0.5)]
                    motion-reduce:animate-none
                    animate-[pf-rise_0.5s_ease-out_both]
                "
            >
                {/* =================================================
                    COVER
                ================================================== */}

                <div className="relative h-36 overflow-hidden bg-[#0f3d33] bg-[image:repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgba(255,255,255,0.08)_31px,rgba(255,255,255,0.08)_32px)]">
                    <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-[#c9a227]/25" />

                    <div className="absolute -right-2 top-16 h-24 w-24 rounded-full bg-[#c9a227]/40" />

                    <div className="absolute bottom-0 left-0 h-1 w-full bg-[#c9a227]" />
                </div>

                {/* =================================================
                    PROFILE CONTENT
                ================================================== */}

                <div className="px-6 pb-8 sm:px-8">
                    {/* =================================================
                        IDENTITY ROW
                    ================================================== */}

                    <div className="-mt-16 mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                        {/* Avatar */}

                        <div className="relative w-fit">
                            <label
                                htmlFor="avatar"
                                className={
                                    "group relative block h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-[#eaf2ee] shadow-lg transition-all duration-300 focus-within:ring-4 focus-within:ring-[#c9a227]/60 " +
                                    (isEditing
                                        ? "cursor-pointer hover:ring-4 hover:ring-[#c9a227]/50"
                                        : "")
                                }
                            >
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Profile avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center font-['Unbounded',sans-serif] text-4xl font-semibold text-[#0f3d33]">
                                        {user.fullname
                                            ?.charAt(0)
                                            ?.toUpperCase() || "U"}
                                    </span>
                                )}

                                {/* Avatar hover overlay */}

                                {isEditing && (
                                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#0f3d33]/60 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                                        <Camera size={20} />
                                        Change
                                    </span>
                                )}

                                <input
                                    id="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    disabled={!isEditing}
                                    className="sr-only"
                                />
                            </label>

                            {/* Camera badge */}

                            {isEditing && (
                                <span
                                    className="pointer-events-none absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#c9a227] text-[#0f3d33] shadow-md"
                                    aria-hidden="true"
                                >
                                    <Camera size={15} />
                                </span>
                            )}
                        </div>

                        {/* Name */}

                        <div className="sm:flex-1 sm:pb-2">
                            <h2 className="font-['Unbounded',sans-serif] text-xl font-semibold tracking-tight">
                                {user.fullname || "Your name"}
                            </h2>

                            <div className="mt-1.5 flex flex-wrap items-center gap-3">
                                <span className="text-sm text-[#5b6b65]">
                                    @{user.username}
                                </span>

                                <span className="flex items-center gap-2 rounded-full bg-[#eaf2ee] px-3 py-1 text-xs font-semibold text-[#0f3d33]">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0f3d33] opacity-50 motion-reduce:animate-none" />

                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0f3d33]" />
                                    </span>
                                    Active
                                </span>

                                {/* Undo avatar */}

                                {isEditing && avatarFile && (
                                    <button
                                        type="button"
                                        onClick={handleUndoAvatar}
                                        className={
                                            "flex cursor-pointer items-center gap-1.5 rounded-full border border-[#cfd9d3] px-3 py-1 text-xs font-semibold text-[#5b6b65] transition-colors hover:border-[#0f3d33] hover:text-[#0f3d33] " +
                                            focusRing
                                        }
                                    >
                                        <Undo2 size={13} />
                                        Undo new photo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        PROFILE FORM
                    ================================================== */}

                    <form id="profile-form" onSubmit={handleSubmit} noValidate>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Full Name */}

                            <TextField
                                id="fullname"
                                name="fullname"
                                label="Full Name"
                                icon={User}
                                type="text"
                                autoComplete="name"
                                value={formData.fullname}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!isEditing}
                                error={
                                    isEditing
                                        ? showError("fullname")
                                        : undefined
                                }
                            />

                            {/* Username */}

                            <TextField
                                id="username"
                                name="username"
                                label="Username"
                                prefix="@"
                                type="text"
                                autoComplete="username"
                                value={formData.username}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!isEditing}
                                error={
                                    isEditing
                                        ? showError("username")
                                        : undefined
                                }
                            />

                            {/* Email */}

                            <TextField
                                id="email"
                                label="Email"
                                icon={Mail}
                                type="email"
                                value={user.email || ""}
                                readOnly
                                disabled
                                rightSlot={
                                    <Lock
                                        size={15}
                                        className="text-[#8a9a93]"
                                    />
                                }
                                hint="Email cannot be changed."
                            />
                        </div>
                    </form>

                    {/* =================================================
                        CHANGE PASSWORD
                    ================================================== */}

                    <div className="mt-10 border-t border-[#e3eae6] pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-['Unbounded',sans-serif] text-sm font-semibold">
                                    Password
                                </h2>

                                <p className="mt-1 text-xs text-[#5b6b65]">
                                    Update your password to keep your account
                                    secure.
                                </p>
                            </div>

                            {!isChangingPassword && (
                                <button
                                    type="button"
                                    onClick={() => setIsChangingPassword(true)}
                                    className={ghostBtn}
                                >
                                    <Lock size={16} />
                                    Change Password
                                </button>
                            )}
                        </div>

                        {/* Password form */}

                        {isChangingPassword && (
                            <form
                                onSubmit={handleChangePassword}
                                className="mt-6 space-y-5 rounded-xl border border-[#cfd9d3] bg-[#f8faf8] p-5"
                            >
                                {/* Current Password */}

                                <TextField
                                    id="currentPassword"
                                    name="currentPassword"
                                    label="Current Password"
                                    icon={Lock}
                                    type={
                                        showCurrentPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="current-password"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                    rightSlot={
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowCurrentPassword(
                                                    (prev) => !prev,
                                                )
                                            }
                                            aria-label={
                                                showCurrentPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            className={
                                                "grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#5b6b65] hover:bg-[#eaf2ee] hover:text-[#0f3d33] " +
                                                focusRing
                                            }
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff size={17} />
                                            ) : (
                                                <Eye size={17} />
                                            )}
                                        </button>
                                    }
                                />

                                {/* New Password */}

                                <TextField
                                    id="newPassword"
                                    name="newPassword"
                                    label="New Password"
                                    icon={Lock}
                                    type={showNewPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    rightSlot={
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowNewPassword(
                                                    (prev) => !prev,
                                                )
                                            }
                                            aria-label={
                                                showNewPassword
                                                    ? "Hide new password"
                                                    : "Show new password"
                                            }
                                            className={
                                                "grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#5b6b65] hover:bg-[#eaf2ee] hover:text-[#0f3d33] " +
                                                focusRing
                                            }
                                        >
                                            {showNewPassword ? (
                                                <EyeOff size={17} />
                                            ) : (
                                                <Eye size={17} />
                                            )}
                                        </button>
                                    }
                                />

                                {/* Password strength */}

                                {passwordForm.newPassword && (
                                    <div
                                        className="mt-[-8px]"
                                        aria-live="polite"
                                    >
                                        <div className="flex gap-1.5">
                                            {[0, 1, 2, 3].map((i) => (
                                                <span
                                                    key={i}
                                                    className="h-1.5 flex-1 rounded-full bg-[#e3eae6] transition-colors duration-300"
                                                    style={
                                                        i < strength
                                                            ? {
                                                                  backgroundColor:
                                                                      strengthColors[
                                                                          strength
                                                                      ],
                                                              }
                                                            : undefined
                                                    }
                                                />
                                            ))}
                                        </div>

                                        <p
                                            className="mt-1.5 text-xs font-semibold"
                                            style={{
                                                color: strengthColors[strength],
                                            }}
                                        >
                                            {strengthLabels[strength]}
                                        </p>
                                    </div>
                                )}

                                {/* Confirm Password */}

                                <TextField
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    label="Confirm New Password"
                                    icon={Lock}
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="new-password"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    rightSlot={
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (prev) => !prev,
                                                )
                                            }
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide confirm password"
                                                    : "Show confirm password"
                                            }
                                            className={
                                                "grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#5b6b65] hover:bg-[#eaf2ee] hover:text-[#0f3d33] " +
                                                focusRing
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={17} />
                                            ) : (
                                                <Eye size={17} />
                                            )}
                                        </button>
                                    }
                                />

                                {/* Password buttons */}

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCancelPasswordChange}
                                        disabled={isChangingPasswordLoading}
                                        className={ghostBtn}
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isChangingPasswordLoading}
                                        className={primaryBtn}
                                    >
                                        {isChangingPasswordLoading ? (
                                            <>
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                                Changing...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck size={16} />
                                                Change Password
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* =================================================
                        ACCOUNT INFORMATION
                    ================================================== */}

                    <div className="mt-10 border-t border-[#e3eae6] pt-6">
                        <h2 className="mb-4 font-['Unbounded',sans-serif] text-sm font-semibold">
                            Account Information
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {/* User ID */}

                            <div className="group rounded-xl border border-transparent bg-[#f3f6f2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cfd9d3] hover:bg-white hover:shadow-[0_12px_24px_-16px_rgba(15,61,51,0.5)]">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="flex items-center gap-2 text-xs font-medium text-[#5b6b65]">
                                        <Hash size={14} />
                                        User ID
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleCopyId}
                                        aria-label="Copy user ID"
                                        className={
                                            "grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-[#5b6b65] transition-colors hover:bg-[#eaf2ee] hover:text-[#0f3d33] " +
                                            focusRing
                                        }
                                    >
                                        {copied ? (
                                            <Check
                                                size={14}
                                                className="text-[#0f3d33]"
                                            />
                                        ) : (
                                            <Copy size={14} />
                                        )}
                                    </button>
                                </div>

                                <p className="mt-2 truncate text-sm font-semibold">
                                    {user._id}
                                </p>

                                <p
                                    className="mt-1 h-4 text-xs font-medium text-[#0f3d33]"
                                    aria-live="polite"
                                >
                                    {copied ? "Copied to clipboard" : ""}
                                </p>
                            </div>

                            {/* Account Status */}

                            <div className="rounded-xl border border-transparent bg-[#f3f6f2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cfd9d3] hover:bg-white hover:shadow-[0_12px_24px_-16px_rgba(15,61,51,0.5)]">
                                <p className="flex items-center gap-2 text-xs font-medium text-[#5b6b65]">
                                    <ShieldCheck size={14} />
                                    Account Status
                                </p>

                                <p className="mt-2 text-sm font-semibold text-[#0f3d33]">
                                    Active
                                </p>

                                <p className="mt-1 h-4 text-xs text-[#5b6b65]">
                                    Your account is in good standing
                                </p>
                            </div>

                            {/* Member Since */}

                            {memberSince && (
                                <div className="rounded-xl border border-transparent bg-[#f3f6f2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cfd9d3] hover:bg-white hover:shadow-[0_12px_24px_-16px_rgba(15,61,51,0.5)]">
                                    <p className="flex items-center gap-2 text-xs font-medium text-[#5b6b65]">
                                        <CalendarDays size={14} />
                                        Member Since
                                    </p>

                                    <p className="mt-2 text-sm font-semibold">
                                        {memberSince}
                                    </p>

                                    <p className="mt-1 h-4" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
