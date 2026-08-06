import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TechnologyStack = () => {
  const [activeCategory, setActiveCategory] = useState('frontend');

  const techStack = {
    frontend: [
      { name: 'React', icon: 'Code2', description: 'Modern UI development with React 18+', color: 'from-blue-500 to-cyan-500' },
      { name: 'Next.js', icon: 'Zap', description: 'Server-side rendering & static generation', color: 'from-gray-700 to-gray-900' },
      { name: 'TypeScript', icon: 'FileCode', description: 'Type-safe JavaScript development', color: 'from-blue-600 to-blue-800' },
      { name: 'Tailwind CSS', icon: 'Palette', description: 'Utility-first CSS framework', color: 'from-cyan-500 to-blue-500' },
      { name: 'Vue.js', icon: 'Layers', description: 'Progressive JavaScript framework', color: 'from-green-500 to-emerald-600' },
      { name: 'Angular', icon: 'Box', description: 'Enterprise-grade framework', color: 'from-red-600 to-pink-600' }
    ],
    backend: [
      { name: 'Node.js', icon: 'Server', description: 'Scalable server-side JavaScript', color: 'from-green-600 to-green-800' },
      { name: 'Python', icon: 'Code', description: 'Django & Flask frameworks', color: 'from-blue-500 to-yellow-500' },
      { name: 'Java', icon: 'Coffee', description: 'Spring Boot enterprise solutions', color: 'from-orange-600 to-red-600' },
      { name: '.NET Core', icon: 'Boxes', description: 'Microsoft enterprise stack', color: 'from-purple-600 to-blue-600' },
      { name: 'PHP', icon: 'FileCode2', description: 'Laravel & Symfony frameworks', color: 'from-indigo-600 to-purple-600' },
      { name: 'Go', icon: 'Zap', description: 'High-performance microservices', color: 'from-cyan-600 to-blue-700' }
    ],
    database: [
      { name: 'PostgreSQL', icon: 'Database', description: 'Advanced relational database', color: 'from-blue-600 to-blue-800' },
      { name: 'MongoDB', icon: 'Layers', description: 'NoSQL document database', color: 'from-green-600 to-green-800' },
      { name: 'MySQL', icon: 'Database', description: 'Popular relational database', color: 'from-blue-500 to-cyan-600' },
      { name: 'Redis', icon: 'Zap', description: 'In-memory data structure store', color: 'from-red-600 to-orange-600' },
      { name: 'Elasticsearch', icon: 'Search', description: 'Distributed search engine', color: 'from-yellow-500 to-orange-500' },
      { name: 'Firebase', icon: 'Flame', description: 'Real-time cloud database', color: 'from-yellow-600 to-orange-600' }
    ],
    cloud: [
      { name: 'AWS', icon: 'Cloud', description: 'Amazon Web Services infrastructure', color: 'from-orange-500 to-yellow-600' },
      { name: 'Azure', icon: 'CloudCog', description: 'Microsoft cloud platform', color: 'from-blue-600 to-cyan-600' },
      { name: 'Google Cloud', icon: 'CloudUpload', description: 'GCP services & infrastructure', color: 'from-red-500 to-yellow-500' },
      { name: 'Docker', icon: 'Container', description: 'Containerization platform', color: 'from-blue-600 to-cyan-600' },
      { name: 'Kubernetes', icon: 'Network', description: 'Container orchestration', color: 'from-blue-700 to-purple-600' },
      { name: 'Terraform', icon: 'Settings', description: 'Infrastructure as code', color: 'from-purple-600 to-indigo-600' }
    ]
  };

  const categories = [
    { id: 'frontend', label: 'Frontend', icon: 'Layout' },
    { id: 'backend', label: 'Backend', icon: 'Server' },
    { id: 'database', label: 'Database', icon: 'Database' },
    { id: 'cloud', label: 'Cloud & DevOps', icon: 'Cloud' }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-[var(--color-muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)]/10 rounded-full mb-4">
            <Icon name="Cpu" size={20} color="var(--color-accent)" />
            <span className="text-sm font-medium text-[var(--color-accent)]">Technology Stack</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4">
            Cutting-Edge Technologies
          </h2>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            We leverage the latest and most reliable technologies to build scalable, secure, and high-performance solutions
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
          {categories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => setActiveCategory(category?.id)}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeCategory === category?.id
                  ? 'bg-[var(--color-accent)] text-white shadow-lg scale-105'
                  : 'bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)]/10'
              }`}
            >
              <Icon name={category?.icon} size={20} />
              <span className="text-sm md:text-base">{category?.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {techStack?.[activeCategory]?.map((tech, index) => (
            <div
              key={index}
              className="group bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 hover:shadow-lg"
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${tech?.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon name={tech?.icon} size={28} color="white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[var(--color-foreground)] mb-2">
                {tech?.name}
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {tech?.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologyStack;