"use client";

import React from 'react';
import Link from 'next/link';
import { Bus, MapPin, Clock, ArrowRight, Zap, Bell, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-1/4 w-1/2 h-full bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-300 text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-4 h-4 fill-blue-300" />
            <span>Next-Gen Bus Tracking Solution</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Never Miss Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">College Bus</span> Again.
          </h1>

          <p className="text-xl text-blue-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Real-time tracking, AI-powered ETA predictions, and instant alerts for your daily commute. The smartest way to travel to campus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 hover:shadow-xl shadow-blue-500/20 flex items-center gap-2 group"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-lg transition-all backdrop-blur-md">
              Learn More
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Powerful Features for Students</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Everything you need to stay on top of your daily transit, all in one intuitive interface.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<MapPin className="w-6 h-6 text-blue-600" />}
            title="Live GPS Tracking"
            description="See exactly where your bus is at any moment with real-time GPS updates."
          />
          <FeatureCard
            icon={<Clock className="w-6 h-6 text-indigo-600" />}
            title="AI ETA Prediction"
            description="Advanced algorithms predict arrival times based on traffic and weather."
          />
          <FeatureCard
            icon={<Bell className="w-6 h-6 text-emerald-600" />}
            title="Instant Alerts"
            description="Get notified when the bus is 5 minutes away or if there's a delay."
          />
          <FeatureCard
            icon={<Users className="w-6 h-6 text-purple-600" />}
            title="Driver Contact"
            description="Direct communication with drivers for emergency updates and lost items."
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-900 relative overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatCard value="50+" label="Active Buses" />
          <StatCard value="5k+" label="Daily Students" />
          <StatCard value="99.9%" label="ETA Accuracy" />
          <StatCard value="24/7" label="Support" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-6 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to simplify your commute?</h2>
            <p className="text-blue-100 mb-10 text-lg max-w-xl mx-auto">Join thousands of students who never wait at the bus stop longer than they have to.</p>
            <Link
              href="/dashboard"
              className="px-10 py-5 bg-white text-blue-900 rounded-2xl font-black text-xl hover:bg-blue-50 transition-colors shadow-2xl"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Bus className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">Smart Bus Tracker</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 Smart College Transit. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white border border-slate-100 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 border border-slate-50 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-4xl font-black text-white">{value}</div>
      <div className="text-blue-200 text-sm uppercase tracking-widest font-bold">{label}</div>
    </div>
  );
}
