import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import registerImage from "../../assets/register/register.png";

function Register() {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        if (formData.password !== formData.confirmPassword) {
            setErrorMsg('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('api/register', formData);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
            setSuccessMsg(response.data.message || 'Registration successful!');
            setLoading(false);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Server error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row-reverse overflow-y-auto">
            
            {/* Left side (Form, reversed visually so it's on right) */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 sm:px-12 lg:px-24 py-8">
                <div className="w-full max-w-md space-y-4">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-foreground tracking-tight">
                            Create an account
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Join us and start managing your projects.
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1" htmlFor="firstName">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            required
                                            className="appearance-none block w-full pl-10 pr-3 py-2 border border-border rounded-md bg-sidebar text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent sm:text-sm transition-shadow"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1" htmlFor="lastName">
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            required
                                            className="appearance-none block w-full pl-10 pr-3 py-2 border border-border rounded-md bg-sidebar text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent sm:text-sm transition-shadow"
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

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
                                        required
                                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-border rounded-md bg-sidebar text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent sm:text-sm transition-shadow"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1" htmlFor="confirmPassword">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-border rounded-md bg-sidebar text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-atlassian-blue focus:border-transparent sm:text-sm transition-shadow"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
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
                                    'Sign Up'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/" className="font-medium text-atlassian-blue hover:underline transition-all">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side: Image showcase (visually on left because of flex-row-reverse) */}
            <div className="hidden md:flex flex-1 bg-sidebar border-r border-border justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-atlassian-blue/10 to-green-500/10"></div>
                <div className="relative z-10 max-w-lg p-12 text-center">
                   <div className="mb-8 p-4 bg-background rounded-2xl shadow-2xl border border-border">
                       <img className="w-full h-auto object-cover rounded-xl" src={registerImage} alt="Register Preview" onError={(e) => e.target.style.display = 'none'} />
                   </div>
                   <h3 className="text-2xl font-bold text-foreground mb-4">Collaborate with your team.</h3>
                   <p className="text-muted-foreground">Join today and start building the future, one task at a time.</p>
                </div>
            </div>

        </div>
    );
}

export default Register;