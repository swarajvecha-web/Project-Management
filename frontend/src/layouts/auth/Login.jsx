import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import loginImage from "../../assets/register/login.png";

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const response = await axios.post('api/login', formData);
            localStorage.setItem('tm_token', response.data.token);
            navigate('/admin/dashboard');
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Server error. Please try again.');
            setFormData({ email: '', password: '' });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            
            {/* Left side: Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 sm:px-12 lg:px-24">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-foreground tracking-tight">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Sign in to continue to your workspace.
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md text-sm flex items-start gap-2">
                            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-md text-sm flex items-start gap-2">
                            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1" htmlFor="email">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-border rounded-md bg-sidebar text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent sm:text-sm transition-shadow"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-border rounded-md bg-sidebar text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent sm:text-sm transition-shadow"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-atlassian-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-atlassian-blue transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5 text-white" />
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-atlassian-blue hover:underline transition-all">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side: Image showcase */}
            <div className="hidden md:flex flex-1 bg-sidebar border-l border-border justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-atlassian-blue/10 to-purple-500/10"></div>
                <div className="relative z-10 max-w-lg p-12 text-center">
                   <div className="mb-8 p-4 bg-background rounded-2xl shadow-2xl border border-border">
                       <img className="w-full h-auto object-cover rounded-xl" src={loginImage} alt="Dashboard Preview" onError={(e) => e.target.style.display = 'none'} />
                   </div>
                   <h3 className="text-2xl font-bold text-foreground mb-4">Manage tasks efficiently.</h3>
                   <p className="text-muted-foreground">Plan, track, and manage your agile and software development projects with Jira-like precision.</p>
                </div>
            </div>

        </div>
    );
}

export default Login;