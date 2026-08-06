import React, { useState } from 'react';

const ProductDevelopmentLeadGen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    productStage: '',
    productType: '',
    features: [],
    targetMarket: '',
    timeline: '',
    budget: '',
    funding: '',
    details: ''
  });

  const [formStatus, setFormStatus] = useState({ submitted: false, loading: false });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ submitted: false, loading: true });
    
    setTimeout(() => {
      setFormStatus({ submitted: true, loading: false });
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        role: '',
        productStage: '',
        productType: '',
        features: [],
        targetMarket: '',
        timeline: '',
        budget: '',
        funding: '',
        details: ''
      });
    }, 1500);
  };

  const services = [
    {
      icon: '💡',
      title: 'Ideation & Strategy',
      description: 'Transform your vision into a viable product roadmap'
    },
    {
      icon: '🎨',
      title: 'UX/UI Design',
      description: 'User-centered design that delights and converts'
    },
    {
      icon: '⚙️',
      title: 'MVP Development',
      description: 'Launch fast with core features that matter'
    },
    {
      icon: '📈',
      title: 'Product Scaling',
      description: 'Grow from MVP to enterprise-grade solution'
    },
    {
      icon: '🔄',
      title: 'Iteration & Growth',
      description: 'Continuous improvement based on user feedback'
    },
    {
      icon: '🚀',
      title: 'Go-to-Market',
      description: 'Strategy and execution for successful launch'
    }
  ];

  const productStages = [
    { value: 'idea', label: 'Just an Idea', icon: '💭', color: 'from-yellow-400 to-orange-500' },
    { value: 'planning', label: 'Planning Phase', icon: '📋', color: 'from-blue-400 to-cyan-500' },
    { value: 'design', label: 'Design Ready', icon: '🎨', color: 'from-purple-400 to-pink-500' },
    { value: 'mvp', label: 'Building MVP', icon: '🛠️', color: 'from-green-400 to-emerald-500' },
    { value: 'scaling', label: 'Scaling Product', icon: '📈', color: 'from-red-400 to-orange-500' },
    { value: 'established', label: 'Established', icon: '🏆', color: 'from-indigo-400 to-purple-500' }
  ];

  const productTypes = [
    { value: 'b2b', label: 'B2B SaaS', description: 'Business software' },
    { value: 'b2c', label: 'B2C App', description: 'Consumer product' },
    { value: 'marketplace', label: 'Marketplace', description: 'Two-sided platform' },
    { value: 'mobile', label: 'Mobile App', description: 'iOS/Android' },
    { value: 'platform', label: 'Platform', description: 'Multi-tenant system' },
    { value: 'other', label: 'Other', description: 'Custom solution' }
  ];

  const keyFeatures = [
    { value: 'auth', label: 'User Authentication', icon: '🔐' },
    { value: 'payments', label: 'Payments', icon: '💳' },
    { value: 'analytics', label: 'Analytics', icon: '📊' },
    { value: 'api', label: 'API/Integrations', icon: '🔌' },
    { value: 'admin', label: 'Admin Dashboard', icon: '👤' },
    { value: 'notifications', label: 'Notifications', icon: '🔔' },
    { value: 'search', label: 'Search', icon: '🔍' },
    { value: 'social', label: 'Social Features', icon: '👥' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 -right-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/30 rounded-full mb-6 backdrop-blur-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                <span className="bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent text-sm font-bold tracking-widest">
                  PRODUCT DEVELOPMENT
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
                  Turn Your Idea Into
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  A Market-Ready Product
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
                From concept to launch and beyond. We partner with startups and enterprises to build 
                products that users love and investors fund. Your success is our mission.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full hover:border-orange-500/50 transition-all group">
                  <span className="text-orange-400 font-bold">3x</span>
                  <span className="text-slate-300 ml-2">Faster Time-to-Market</span>
                </div>
                <div className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full hover:border-purple-500/50 transition-all group">
                  <span className="text-purple-400 font-bold">$50M+</span>
                  <span className="text-slate-300 ml-2">Funding Raised by Clients</span>
                </div>
                <div className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full hover:border-pink-500/50 transition-all group">
                  <span className="text-pink-400 font-bold">75+</span>
                  <span className="text-slate-300 ml-2">Products Launched</span>
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-orange-500/10"
                >
                  <div className="text-5xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">{service.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>

            {/* Success Stories Banner */}
            <div className="bg-gradient-to-r from-orange-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 mb-16">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Join 100+ Successful Products Built with Us
                </h3>
                <p className="text-slate-300 mb-6">
                  From seed-stage startups to Fortune 500 companies, we've helped bring innovative products to life
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-center">
                  <div>
                    <div className="text-3xl font-black bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">4.9/5</div>
                    <div className="text-sm text-slate-400">Average Rating</div>
                  </div>
                  <div className="w-px bg-slate-700"></div>
                  <div>
                    <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">85%</div>
                    <div className="text-sm text-slate-400">Raise Funding</div>
                  </div>
                  <div className="w-px bg-slate-700"></div>
                  <div>
                    <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">2-4mo</div>
                    <div className="text-sm text-slate-400">Avg MVP Timeline</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Lead Form */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
                {formStatus.submitted ? (
                  <div className="p-12 text-center">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full animate-ping opacity-20"></div>
                      <div className="relative w-32 h-32 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-4">Your Journey Begins Now! 🚀</h3>
                    <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                      We've received your product proposal! Our product strategists will analyze your requirements 
                      and schedule a consultation call within 24 hours to discuss your vision, timeline, and next steps.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setFormStatus({ submitted: false, loading: false })}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg"
                      >
                        Submit Another Project
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 p-8 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-grid-white/10"></div>
                      <div className="relative">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                          Let's Build Your Product Together
                        </h2>
                        <p className="text-white/90 text-lg">
                          Share your vision and receive a detailed product roadmap and cost estimate
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 lg:p-12">
                      <div className="space-y-8">
                        {/* Contact Information */}
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
                            Contact Information
                          </h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                placeholder="John Doe"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Email Address *
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                placeholder="john@startup.com"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Phone Number *
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                placeholder="+1 (555) 000-0000"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Company/Startup Name
                              </label>
                              <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                placeholder="Your Startup"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Your Role *
                              </label>
                              <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                              >
                                <option value="">Select your role</option>
                                <option value="founder">Founder / Co-Founder</option>
                                <option value="ceo">CEO / Executive</option>
                                <option value="product">Product Manager</option>
                                <option value="cto">CTO / Tech Lead</option>
                                <option value="entrepreneur">Entrepreneur</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Product Stage */}
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
                            Current Product Stage
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {productStages.map((stage) => (
                              <label
                                key={stage.value}
                                className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                                  formData.productStage === stage.value
                                    ? 'border-orange-500 bg-gradient-to-br from-orange-500/20 to-pink-500/20 shadow-lg shadow-orange-500/20'
                                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="productStage"
                                  value={stage.value}
                                  checked={formData.productStage === stage.value}
                                  onChange={handleChange}
                                  required
                                  className="sr-only"
                                />
                                <div className={`text-3xl mb-2 transform group-hover:scale-110 transition-transform`}>
                                  {stage.icon}
                                </div>
                                <span className="text-sm font-semibold text-white text-center">
                                  {stage.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Product Type */}
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
                            Product Type
                          </h3>
                          <div className="grid md:grid-cols-3 gap-4">
                            {productTypes.map((type) => (
                              <label
                                key={type.value}
                                className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                  formData.productType === type.value
                                    ? 'border-orange-500 bg-orange-500/10 shadow-lg'
                                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="productType"
                                  value={type.value}
                                  checked={formData.productType === type.value}
                                  onChange={handleChange}
                                  required
                                  className="sr-only"
                                />
                                <div className="text-lg font-bold text-white mb-1">{type.label}</div>
                                <div className="text-sm text-slate-400">{type.description}</div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Key Features */}
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 text-sm">4</span>
                            Key Features Needed
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {keyFeatures.map((feature) => (
                              <button
                                key={feature.value}
                                type="button"
                                onClick={() => handleFeatureToggle(feature.value)}
                                className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all duration-200 ${
                                  formData.features.includes(feature.value)
                                    ? 'border-orange-500 bg-orange-500/10 shadow-md'
                                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                                }`}
                              >
                                <span className="text-2xl mb-2">{feature.icon}</span>
                                <span className="text-xs font-semibold text-white text-center">{feature.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Project Details */}
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 text-sm">5</span>
                            Project Details
                          </h3>
                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Target Market
                              </label>
                              <input
                                type="text"
                                name="targetMarket"
                                value={formData.targetMarket}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                placeholder="e.g., Small businesses, Millennials, B2B"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Launch Timeline *
                              </label>
                              <select
                                name="timeline"
                                value={formData.timeline}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                              >
                                <option value="">Select timeline</option>
                                <option value="asap">ASAP ( 2 months)</option>
                                <option value="quarter">This Quarter (2-3 months)</option>
                                <option value="half">Next 6 months</option>
                                <option value="year">Within a year</option>
                                <option value="flexible">Flexible</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Budget Range *
                              </label>
                              <select
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                              >
                                <option value="">Select budget</option>
                                <option value="small">$15,000 - $30,000</option>
                                <option value="medium">$30,000 - $75,000</option>
                                <option value="large">$75,000 - $150,000</option>
                                <option value="enterprise">$150,000+</option>
                                <option value="seeking">Seeking funding guidance</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Funding Status
                              </label>
                              <select
                                name="funding"
                                value={formData.funding}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                              >
                                <option value="">Select funding status</option>
                                <option value="bootstrapped">Bootstrapped</option>
                                <option value="pre-seed">Pre-seed</option>
                                <option value="seed">Seed funded</option>
                                <option value="series-a">Series A+</option>
                                <option value="seeking">Seeking funding</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Tell Us About Your Product Vision *
                            </label>
                            <textarea
                              name="details"
                              value={formData.details}
                              onChange={handleChange}
                              required
                              rows="6"
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                              placeholder="Describe your product idea... What problem does it solve? Who are your target users? What makes it unique? What's your competitive advantage? Any technical requirements or constraints?"
                            ></textarea>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={formStatus.loading}
                          className="w-full px-8 py-5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold text-xl rounded-xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                        >
                          {formStatus.loading ? (
                            <>
                              <svg className="animate-spin h-7 w-7 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Processing Your Request...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>Get Your Product Roadmap & Proposal</span>
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </>
                          )}
                        </button>

                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <div>
                              <p className="text-green-300 font-semibold mb-1">Your Idea is Protected</p>
                              <p className="text-slate-400 text-sm">
                                We sign NDAs and take confidentiality seriously. Your product vision is safe with us.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 12s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .bg-grid-white\/10 {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default ProductDevelopmentLeadGen;
