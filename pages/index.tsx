import { useEffect, useState, Suspense, lazy } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import Navigation from '../components/Navigation';
import HeroSection from '../components/sections/HeroSection';
import SkillsSection from '../components/SkillsSection';
import ExperienceSection from '../components/ExperienceSection';
import ProjectsSection from '../components/ProjectsSection';
import EducationStudies from '@/components/EducationStudies';
import CertificatesSection from '@/components/CertificatesSection';
import InterestsSection from '@/components/InterestsSection';
import Contact from '@/components/contact';
import ContactForm from '@/components/Message';
import Loading from '@/components/Loading';
import CustomCursor from '@/components/ui/CustomCursor';

// Hooks
import { useScrollProgress } from '@/hooks/useScrollProgress';

// Data
import publicJson from '../public/data.json';
import { PortfolioData } from '../types';

// Dynamic import for 3D Scene (reduces initial bundle size)
const Scene = dynamic(() => import('../components/3d/Scene'), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { progress } = useScrollProgress();

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Wake up backend server
  async function getStatus() {
    try {
      await fetch('https://painpal.onrender.com/api/v1/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  }

  useEffect(() => {
    getStatus();
    
    const loadData = async () => {
      try {
        const resumeData = publicJson;
        setData(resumeData);
        
        // Simulate minimum loading time for effect
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', (error as Error).message);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      if (isDarkMode) {
        // Dark mode (default) - uses CSS variables from globals.css
        root.style.setProperty('--bg-primary', '#121212');
        root.style.setProperty('--bg-secondary', '#18181b');
        root.style.setProperty('--bg-elevated', '#27272a');
        root.style.setProperty('--bg-card', '#1e1e20');
        root.style.setProperty('--text-primary', '#f4f4f5');
        root.style.setProperty('--text-secondary', '#d4d4d8');
        root.style.setProperty('--text-muted', '#a1a1aa');
        root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
        root.style.setProperty('--border-hover', 'rgba(255, 255, 255, 0.15)');
        root.style.setProperty('--border-active', 'rgba(255, 255, 255, 0.25)');
      } else {
        // Light mode
        root.style.setProperty('--bg-primary', '#f8f8f8');
        root.style.setProperty('--bg-secondary', '#ffffff');
        root.style.setProperty('--bg-elevated', '#ffffff');
        root.style.setProperty('--bg-card', '#ffffff');
        root.style.setProperty('--text-primary', '#111111');
        root.style.setProperty('--text-secondary', '#555555');
        root.style.setProperty('--text-muted', '#666666');
        root.style.setProperty('--border', 'rgba(0, 0, 0, 0.08)');
        root.style.setProperty('--border-hover', 'rgba(0, 0, 0, 0.15)');
        root.style.setProperty('--border-active', 'rgba(0, 0, 0, 0.25)');
      }
    }
  }, [isDarkMode]);

  // Show loading screen
  if (isLoading || !data) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>{data.name} | Full Stack Developer</title>
        <meta name="description" content={data.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Person',
            name: 'Shylesh S',
            jobTitle: 'Full Stack Developer',
            url: 'https://shylesh-s.vercel.app/',
            sameAs: [
              'https://www.linkedin.com/in/s-shylesh/',
              'https://github.com/shylesh128',
            ],
          })}
        </script>
        
        <meta
          name="keywords"
          content="Fullstack Developer, MERN Stack, React Developer, Node.js Developer, Portfolio, Shylesh S, Web Developer, Full Stack Development"
        />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${data.name} | Full Stack Developer`} />
        <meta property="og:description" content={data.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shylesh-s.vercel.app/" />
        <meta property="og:image" content="/shylesh.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${data.name} | Full Stack Developer`} />
        <meta name="twitter:description" content={data.description} />
      </Head>

      {/* Custom cursor */}
      <CustomCursor />
      
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* 3D Background Scene - Disabled for minimal design
      <Scene scrollProgress={progress} />
      */}

      {/* Main content */}
      <div className="main-container">
        {/* Navigation */}
        <Navigation isDarkMode={isDarkMode} toggleMode={toggleMode} />

        {/* Content sections */}
        <main id="main-content" className="content-layer">
          {/* Hero Section */}
          <HeroSection
            name={data.name}
            title={data.title}
            description={data.description}
            image={data.image}
          />

          {/* Skills Section */}
          <SkillsSection skills={data.skills} />

          {/* Experience Section */}
          <ExperienceSection experiences={data.experiences} />

          {/* Projects Section */}
          <ProjectsSection projects={data.projects} />

          {/* Education Section */}
          <EducationStudies studies={data.education} />

          {/* Certificates Section */}
          <CertificatesSection certificates={data.certificates} />

          {/* Interests Section */}
          <InterestsSection interests={data.interests} />

          {/* Contact Section */}
          <Contact contact={data.contact} />

          {/* Contact Form */}
          <ContactForm />

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </>
  );
}

// Simple Footer component
const Footer = () => {
  return (
    <motion.footer
      initial={{ y: 20 }}
      whileInView={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        marginTop: '4rem',
      }}
    >
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        © {new Date().getFullYear()} Shylesh S. Built with Next.js & Three.js
      </p>
      <motion.p
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginTop: '0.5rem',
        }}
        whileHover={{ color: 'var(--text-primary)' }}
      >
        Designed & Developed with ❤️
      </motion.p>
    </motion.footer>
  );
};
