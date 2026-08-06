import React, { useState } from 'react';

const WebDevelopmentLeadGen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    websiteType: '',
    timeline: '',
    budget: '',
    details: ''
  });

  const [formStatus, setFormStatus] = useState({ submitted: false, loading: false });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        websiteType: '',
        timeline: '',
        budget: '',
        details: ''
      });
    }, 1500);
  };

  const features = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Optimized for speed and performance'
    },
    {
      icon: '📱',
      title: 'Responsive Design',
      description: 'Perfect on all devices and screens'
    },
    {
      icon: '🎨',
      title: 'Custom Design',
      description: 'Tailored to your brand identity'
    },
    {
      icon: '🔒',
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security standards'
    },
    {
      icon: '🚀',
      title: 'SEO Optimized',
      description: 'Built to rank on search engines'
    },
    {
      icon: '🛠️',
      title: 'Easy Maintenance',
      description: 'Simple content management systems'
    }
  ];

  const websiteTypes = [
    { value: 'corporate', label: 'Corporate Website', icon: '🏢' },
    { value: 'ecommerce', label: 'E-Commerce Store', icon: '🛒' },
    { value: 'portfolio', label: 'Portfolio Site', icon: '💼' },
    { value: 'blog', label: 'Blog/Magazine', icon: '📝' },
    { value: 'landing', label: 'Landing Page', icon: '🎯' },
    { value: 'custom', label: 'Custom Solution', icon: '⚙️' }
  ];

  const techStack = [
    { name: 'React', color: 'from-cyan-400 to-blue-500' },
    { name: 'Next.js', color: 'from-slate-700 to-slate-900' },
    { name: 'Vue.js', color: 'from-green-400 to-emerald-600' },
    { name: 'Node.js', color: 'from-green-500 to-green-700' },
    { name: 'TypeScript', color: 'from-blue-500 to-blue-700' },
    { name: 'Tailwind', color: 'from-cyan-500 to-blue-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <span className="text-orange-400 text-sm font-semibold tracking-wider">WEB DEVELOPMENT SERVICES</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
                  Build Your Dream
                </span>
                <br />
                <span className="text-white">Website Today</span>
              </h1>
              
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Transform your digital presence with cutting-edge web solutions. 
                From responsive designs to powerful web applications, we bring your vision to life.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full">
                  <span className="text-orange-400 font-bold">50+</span>
                  <span className="text-slate-300 ml-2">Projects Delivered</span>
                </div>
                <div className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full">
                  <span className="text-orange-400 font-bold">98%</span>
                  <span className="text-slate-300 ml-2">Client Satisfaction</span>
                </div>
                <div className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full">
                  <span className="text-orange-400 font-bold">24/7</span>
                  <span className="text-slate-300 ml-2">Support Available</span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-orange-500/30 transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Tech Stack */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-white mb-8">
                Powered by Modern Technologies
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {techStack.map((tech, index) => (
                  <div
                    key={index}
                    className={`px-6 py-3 bg-gradient-to-r ${tech.color} rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
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
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Request Received!</h3>
                    <p className="text-slate-300 text-lg mb-8">
                      Thank you for your interest! Our web development team will contact you within 24 hours 
                      with a detailed proposal tailored to your needs.
                    </p>
                    <button
                      onClick={() => setFormStatus({ submitted: false, loading: false })}
                      className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-8 text-center">
                      <h2 className="text-3xl font-bold text-white mb-3">
                        Get Your Free Website Consultation
                      </h2>
                      <p className="text-orange-100 text-lg">
                        Fill out the form below and receive a custom proposal within 24 hours
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 lg:p-12">
                      <div className="space-y-6">
                        {/* Personal Info */}
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
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Company Name
                            </label>
                            <input
                              type="text"
                              name="company"
                              value={formData.company}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                              placeholder="Your Company"
                            />
                          </div>
                        </div>

                        {/* Website Type Selection */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-3">
                            What type of website do you need? *
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {websiteTypes.map((type) => (
                              <label
                                key={type.value}
                                className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                  formData.websiteType === type.value
                                    ? 'border-orange-500 bg-orange-500/10'
                                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="websiteType"
                                  value={type.value}
                                  checked={formData.websiteType === type.value}
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

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Project Timeline *
                            </label>
                            <select
                              name="timeline"
                              value={formData.timeline}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                            >
                              <option value="">Select timeline</option>
                              <option value="urgent">ASAP (1-2 weeks)</option>
                              <option value="short">1-2 months</option>
                              <option value="medium">2-4 months</option>
                              <option value="flexible">Flexible timeline</option>
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
                              <option value="small">$5,000 - $10,000</option>
                              <option value="medium">$10,000 - $25,000</option>
                              <option value="large">$25,000 - $50,000</option>
                              <option value="enterprise">$50,000+</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Project Details *
                          </label>
                          <textarea
                            name="details"
                            value={formData.details}
                            onChange={handleChange}
                            required
                            rows="6"
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                            placeholder="Tell us about your website project... What features do you need? Do you have any design preferences? Any specific functionality requirements?"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          disabled={formStatus.loading}
                          className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                        >
                          {formStatus.loading ? (
                            <>
                              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <span>Get Your Free Consultation</span>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </>
                          )}
                        </button>

                        <p className="text-center text-sm text-slate-400 mt-4">
                          🔒 Your information is secure and will never be shared with third parties
                        </p>
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
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700;800&display=swap');
        
        * {
          font-family: 'Urbanist', sans-serif;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(15px);
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default WebDevelopmentLeadGen;
