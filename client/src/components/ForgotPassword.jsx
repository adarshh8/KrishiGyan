// src/components/ForgotPassword.jsx - UPDATED with logo only (no video)
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import api from '../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Reset Password
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Request OTP
    const requestOTP = async () => {
        if (!formData.email) {
            setError("Please enter your email");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");
        
        try {
            const response = await api.post('/password-reset/request', { email: formData.email });
            const data = response.data;
            
            if (data.success || response.status === 200) {
                setStep(2);
                setSuccess("OTP sent to your email!");
            } else {
                setError(data.message || "Failed to send OTP");
            }
        } catch (err) {
            setError("Failed to connect to server");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const verifyOTP = async () => {
        if (!formData.otp || formData.otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");
        
        try {
            const response = await api.post('/password-reset/verify', {
                email: formData.email,
                otp: formData.otp
            });
            const data = response.data;
            
            if (data.success) {
                setStep(3);
                setSuccess("OTP verified! Now set your new password");
            } else {
                setError(data.message || "Invalid OTP");
            }
        } catch (err) {
            setError("Failed to verify OTP");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Reset Password
    const resetPassword = async () => {
        if (!formData.newPassword) {
            setError("Please enter new password");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (formData.newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");
        
        try {
            const response = await api.post('/password-reset/reset', {
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.newPassword
            });
            const data = response.data;
            
            if (data.success) {
                setSuccess("Password reset successful! Redirecting to login...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError(data.message || "Failed to reset password");
            }
        } catch (err) {
            setError("Failed to reset password");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-primary-green/10">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate("/login")}
                        className="flex items-center text-gray-600 hover:text-primary-green mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Login
                    </button>

                    {/* Logo - Same as Login */}
                    <div className="text-center mb-8">
                        <div className="auth-logo-image mb-4">
                            <img
                                src="/src/assets/agri_logo.jpg"
                                alt="KRISHIGNAN Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-primary-green mb-2">
                            KRISHIGNAN
                        </h1>
                        <p className="text-natural-brown font-medium">FARMING WISDOM</p>
                        <p className="text-gray-600 mt-4">Password Recovery</p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="bg-red-50/90 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center backdrop-blur-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50/90 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-center backdrop-blur-sm">
                            {success}
                        </div>
                    )}

                    {/* Step 1: Request OTP */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <p className="text-gray-600 text-center">
                                Enter your email to receive a password reset OTP
                            </p>
                            
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200 bg-white/90 focus:bg-white backdrop-blur-sm"
                                />
                            </div>

                            <button
                                onClick={requestOTP}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary-green to-primary-light text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                            >
                                {loading ? "Sending OTP..." : "Send OTP"}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <p className="text-gray-600 text-center">
                                Enter the 6-digit OTP sent to <span className="font-semibold">{formData.email}</span>
                            </p>
                            
                            <div className="mb-2">
                                <input
                                    type="text"
                                    name="otp"
                                    placeholder="Enter 6-digit OTP"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    maxLength="6"
                                    className="w-full text-center text-2xl tracking-widest py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200 bg-white/90 focus:bg-white backdrop-blur-sm"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={verifyOTP}
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-primary-green to-primary-light text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                                >
                                    {loading ? "Verifying..." : "Verify OTP"}
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 text-center mt-4">
                                Didn't receive OTP?{" "}
                                <button
                                    onClick={requestOTP}
                                    className="text-primary-green hover:underline"
                                >
                                    Resend OTP
                                </button>
                            </p>
                        </div>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <p className="text-gray-600 text-center">
                                Set your new password
                            </p>
                            
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        placeholder="New Password"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200 bg-white/90 focus:bg-white backdrop-blur-sm"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                        )}
                                    </button>
                                </div>
                                
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm New Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200 bg-white/90 focus:bg-white backdrop-blur-sm"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={resetPassword}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary-green to-primary-light text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center mt-6 pt-6 border-t border-gray-200/50">
                        <p className="text-gray-600">
                            Remember your password?{" "}
                            <Link to="/login" className="text-primary-green font-semibold hover:underline">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;