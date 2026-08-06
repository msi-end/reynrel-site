import React, { useState } from 'react';

const SoftwareDevelopmentLeadGen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    softwareType: '',
    platform: [],
    timeline: '',
    budget: '',
    teamSize: '',
    details: ''
  });

  const [formStatus, setFormStatus] = useState({ submitted: false, loading: false });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platform: prev.platform.includes(platform)
        ? prev.platform.filter(p => p !== platform)
        : [...prev.platform, platform]
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
        industry: '',
        softwareType: '',
        platform: [],
        timeline: '',
        budget: '',
        teamSize: '',
        details: ''
      });
    }, 1500);
  };

  const capabilities = [
    {
      icon: '💻',
      title: 'Custom Software',
      description: 'Tailored solutions for unique business needs'
    },
    {
      icon: '☁️',
      title: 'Cloud Applications',
      description: 'Scalable cloud-native architecture'
    },
    {
      icon: '📊',
      title: 'Enterprise Systems',
      description: 'Complex business process automation'
    },
    {
      icon: '🔌',
      title: 'API Development',
      description: 'Robust integrations and microservices'
    },
    {
      icon: '🤖',
      title: 'AI/ML Integration',
      description: 'Intelligent automation and analytics'
    },
    {
      icon: '🔐',
      title: 'Security First',
      description: 'Enterprise-grade security standards'
    }
  ];

  const softwareTypes = [
    { value: 'saas', label: 'SaaS Platform', icon: '☁️' },
    { value: 'enterprise', label: 'Enterprise Software', icon: '🏢' },
    { value: 'mobile', label: 'Mobile Application', icon: '📱' },
    { value: 'desktop', label: 'Desktop Application', icon: '💻' },
    { value: 'automation', label: 'Automation Tool', icon: '⚙️' },
    { value: 'custom', label: 'Custom Solution', icon: '🛠️' }
  ];

  const platforms = [
    { value: 'web', label: 'Web', icon: '🌐' },
    { value: 'ios', label: 'iOS', icon: '🍎' },
    { value: 'android', label: 'Android', icon: '🤖' },
    { value: 'windows', label: 'Windows', icon: '🪟' },
    { value: 'mac', label: 'macOS', icon: '💻' },
    { value: 'linux', label: 'Linux', icon: '🐧' }
  ];

  const techLogos = [
    { name: 'Python', gradient: 'from-blue-400 to-yellow-400' },
    { name: 'Java', gradient: 'from-red-500 to-orange-600' },
    { name: 'C#/.NET', gradient: 'from-purple-500 to-indigo-600' },
    { name: 'Node.js', gradient: 'from-green-500 to-green-700' },
    { name: 'Go', gradient: 'from-cyan-400 to-blue-500' },
    { name: 'Rust', gradient: 'from-orange-500 to-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 px-5 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
                <span className="text-purple-400 text-sm font-bold tracking-widest">SOFTWARE DEVELOPMENT</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                  Enterprise Software
                </span>
                <br />
                <span className="text-white">That Scales</span>
              </h1>
              
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Custom software solutions engineered to solve complex business challenges. 
                From MVPs to enterprise systems, we build software that grows with your business.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="group px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full hover:border-purple-500/50 transition-all">
                  <span className="text-purple-400 font-bold">100+</span>
                  <span className="text-slate-300 ml-2">Software Projects</span>
                </div>
                <div className="group px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full hover:border-purple-500/50 transition-all">
                  <span className="text-purple-400 font-bold">15+</span>
                  <span className="text-slate-300 ml-2">Industries Served</span>
                </div>
                <div className="group px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full hover:border-purple-500/50 transition-all">
                  <span className="text-purple-400 font-bold">99.9%</span>
                  <span className="text-slate-300 ml-2">Uptime SLA</span>
                </div>
              </div>
            </div>

            {/* Capabilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {capabilities.map((capability, index) => (
                <div
                  key={index}
                  className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {capability.icon}
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">{capability.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{capability.description}</p>
                </div>
              ))}
            </div>

            {/* Tech Stack */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-white mb-8">
                Built with Industry-Leading Technologies
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {techLogos.map((tech, index) => (
                  <div
                    key={index}
                    className={`px-8 py-4 bg-gradient-to-r ${tech.gradient} rounded-xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300`}
                  >
                    {tech.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Lead Form */}
            <div className="max-w-5xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
                {formStatus.submitted ? (
                  <div className="p-12 text-center">
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                      <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Consultation Request Received!</h3>
                    <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                      Our software development experts will review your requirements and contact you within 24 hours 
                      with a comprehensive technical proposal and timeline.
                    </p>
                    <button
                      onClick={() => setFormStatus({ submitted: false, loading: false })}
                      className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-semibold"
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 p-8 text-center">
                      <h2 className="text-3xl font-bold text-white mb-3">
                        Start Your Software Development Project
                      </h2>
                      <p className="text-purple-100 text-lg">
                        Complete the form to receive a custom technical proposal and cost estimate
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 lg:p-12">
                      <div className="space-y-6">
                        {/* Personal & Company Info */}
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
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                              placeholder="John Doe"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Work Email *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                              placeholder="john@company.com"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
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
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Company Name *
                            </label>
                            <input
                              type="text"
                              name="company"
                              value={formData.company}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                              placeholder="Your Company"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Industry *
                          </label>
                          <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          >
                            <option value="">Select your industry</option>
                            <option value="fintech">FinTech / Finance</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="ecommerce">E-Commerce / Retail</option>
                            <option value="education">Education / EdTech</option>
                            <option value="logistics">Logistics / Supply Chain</option>
                            <option value="manufacturing">Manufacturing</option>
                            <option value="realestate">Real Estate</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        {/* Software Type Selection */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-3">
                            What type of software do you need? *
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {softwareTypes.map((type) => (
                              <label
                                key={type.value}
                                className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                  formData.softwareType === type.value
                                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="softwareType"
                                  value={type.value}
                                  checked={formData.softwareType === type.value}
                                  onChange={handleChange}
                                  required
                                  className="sr-only"
                                />
                                <span className="text-3xl mb-2">{type.icon}</span>
                                <span className="text-sm font-semibold text-white text-center">
                                  {type.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Platform Selection */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-3">
                            Target Platforms (Select all that apply) *
                          </label>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {platforms.map((platform) => (
                              <button
                                key={platform.value}
                                type="button"
                                onClick={() => handlePlatformToggle(platform.value)}
                                className={`flex flex-col items-center p-3 border-2 rounded-lg transition-all duration-200 ${
                                  formData.platform.includes(platform.value)
                                    ? 'border-purple-500 bg-purple-500/10 shadow-lg'
                                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                                }`}
                              >
                                <span className="text-2xl mb-1">{platform.icon}</span>
                                <span className="text-xs font-semibold text-white">{platform.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Timeline *
                            </label>
                            <select
                              name="timeline"
                              value={formData.timeline}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            >
                              <option value="">Select timeline</option>
                              <option value="urgent">Urgent ( 1 month)</option>
                              <option value="short">1-3 months</option>
                              <option value="medium">3-6 months</option>
                              <option value="long">6+ months</option>
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
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            >
                              <option value="">Select budget</option>
                              <option value="small">$25,000 - $50,000</option>
                              <option value="medium">$50,000 - $100,000</option>
                              <option value="large">$100,000 - $250,000</option>
                              <option value="enterprise">$250,000+</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Team Size Needed
                            </label>
                            <select
                              name="teamSize"
                              value={formData.teamSize}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            >
                              <option value="">Select team size</option>
                              <option value="solo">1-2 developers</option>
                              <option value="small">3-5 developers</option>
                              <option value="medium">6-10 developers</option>
                              <option value="large">10+ developers</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Project Requirements & Details *
                          </label>
                          <textarea
                            name="details"
                            value={formData.details}
                            onChange={handleChange}
                            required
                            rows="6"
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                            placeholder="Please describe your software requirements in detail... What problem are you trying to solve? What features are essential? Do you have existing systems that need integration? Any technical constraints or preferences?"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          disabled={formStatus.loading}
                          className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                        >
                          {formStatus.loading ? (
                            <>
                              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <span>Get Technical Proposal & Quote</span>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </>
                          )}
                        </button>

                        <div className="flex items-center justify-center space-x-2 mt-4">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <p className="text-center text-sm text-slate-400">
                            Enterprise-grade security. Your data is encrypted and never shared.
                          </p>
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SoftwareDevelopmentLeadGen;
