'use client';

import Link from 'next/link';
import { Button } from '@dashin/ui';
import {
  ArrowRight,
  BarChart3,
  Target,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Brain,
  Search,
  Database,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const [, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Search,
      title: 'AI-Powered Lead Discovery',
      description: 'Automatically find and qualify leads using advanced AI algorithms that learn from your ideal customer profile.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Database,
      title: 'Smart Data Enrichment',
      description: 'Enrich lead data in real-time with verified contact information, company details, and engagement history.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Brain,
      title: 'Predictive Analytics',
      description: 'Leverage ML models to predict lead conversion probability and optimize your outreach strategy.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Target,
      title: 'Campaign Automation',
      description: 'Create, manage, and optimize multi-channel campaigns with intelligent automation and A/B testing.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track campaign performance, lead quality, and ROI with beautiful, actionable dashboards.',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, GDPR compliance, and role-based access control to keep your data safe.',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  const stats = [
    { value: '500K+', label: 'Leads Generated' },
    { value: '95%', label: 'Data Accuracy' },
    { value: '10x', label: 'ROI Increase' },
    { value: '24/7', label: 'AI Working' },
  ];

  const testimonials = [
    {
      quote: "Dashin transformed our lead generation process. We're now closing 3x more deals with half the effort.",
      author: 'Sarah Chen',
      role: 'VP of Sales',
      company: 'TechCorp',
    },
    {
      quote: 'The AI-powered insights helped us identify our best prospects before our competitors even knew they existed.',
      author: 'Michael Rodriguez',
      role: 'Growth Director',
      company: 'StartupXYZ',
    },
    {
      quote: 'Finally, a research platform that actually understands our business. The ROI speaks for itself.',
      author: 'Emily Watson',
      role: 'CEO',
      company: 'Innovate Labs',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashin
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                How it Works
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                Testimonials
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Lead Research Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Turn Research Into
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Revenue
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Dashin uses advanced AI to discover, qualify, and convert high-quality leads at scale.
              Stop guessing, start growing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 border-2 hover:bg-gray-50"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See How It Works
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white p-2">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-8 aspect-video flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">Dashboard Preview Coming Soon</p>
                  <div className="flex justify-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-purple-600 animate-pulse delay-75" style={{ animationDelay: '0.15s' }} />
                    <div className="w-3 h-3 rounded-full bg-pink-600 animate-pulse delay-150" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to supercharge your lead generation and close more deals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative p-8 rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 bg-white cursor-pointer"
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div
                    className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${feature.gradient}`}
                  />
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center text-sm font-medium text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and see results in days
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Define Your Ideal Customer',
                description: 'Tell our AI about your perfect customer profile and target criteria.',
              },
              {
                step: '02',
                title: 'AI Discovers & Qualifies',
                description: 'Our AI scours the web to find and qualify leads that match your criteria.',
              },
              {
                step: '03',
                title: 'Close More Deals',
                description: 'Focus on high-quality, ready-to-convert leads and watch your revenue grow.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 -z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Loved by Teams
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers have to say about Dashin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300 bg-white"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Lead Generation?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of teams already using Dashin to discover and convert high-quality leads.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="secondary"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8"
              >
                Sign In
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Dashin</span>
              </div>
              <p className="text-sm">AI-powered lead research platform for modern teams.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2026 Dashin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
