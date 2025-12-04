import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import ProjectsSection from "../components/ProjectsSection";
import InterestsSection from "../components/InterestsSection";
import ExperienceSection from "../components/ExperienceSection";
import SkillsSection from "../components/SkillsSection";
import { AnimationItem } from "../components/AnimationItem";
import EducationStudies from "@/components/EducationStudies";
import CertificatesSection from "@/components/CertificatesSection";
import Navigation from "@/components/Navigation";
import Contact from "@/components/contact";
import Loading from "@/components/Loading";
import publicJson from "../public/data.json";
import { Button } from "@mui/material";
import ContactForm from "@/components/Message";

import { PortfolioData } from "../types";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const aboutMeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const interestsRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<PortfolioData | null>(null);

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  async function getStatus() {
    try {
      const response = await fetch(
        "https://painpal.onrender.com/api/v1/status",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  }

  useEffect(() => {
    getStatus();
    const fetchData = async () => {
      try {
        // const resumeData = await fetchResumeData();
        const resumeData = publicJson;
        setData(resumeData);
      } catch (error) {
        console.error("Error fetching resume data:", (error as Error).message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (document) {
      const root = document.documentElement;
      if (isDarkMode) {
        // Dark mode variables
        root.style.setProperty("--main-font", "Arial, sans-serif");
        root.style.setProperty("--background-color", "#212121");
        root.style.setProperty("--text-color", "#ffffff");
        root.style.setProperty("--shadow-color", "rgba(0, 0, 0, 0.5");
        root.style.setProperty("--border-color", "#d4d4d4");
        root.style.setProperty("--link-color", "#87ceeb");
        root.style.setProperty("--text-active-color", "#000000");
        root.style.setProperty("--sub-text-color", "#bdbdbd");
        root.style.setProperty("--secondary-text-color", "#bdbdbd");
        root.style.setProperty("--scrollbar-color", "#757575");
        root.style.setProperty("--scrollbar-thumb-color", "#757575");
      } else {
        // Light mode variables
        root.style.setProperty("--background-color", "#f5f5f5");
        root.style.setProperty("--text-color", "#212121");
        root.style.setProperty("--shadow-color", "rgba(0, 0, 0, 0.7");
        root.style.setProperty("--border-color", "#e0e0e0");
        root.style.setProperty("--link-color", "#2f628a");
        root.style.setProperty("--text-active-color", "#ffffff");
        root.style.setProperty("--sub-text-color", "#757575");
        root.style.setProperty("--secondary-text-color", "#757575");
        root.style.setProperty("--scrollbar-color", "#bdbdbd");
        root.style.setProperty("--scrollbar-thumb-color", "#757575");
        // Add more light mode variables as needed
      }
    }
  }, [isDarkMode]);

  useEffect(() => {
    const refs = [
      headerRef,
      aboutMeRef,
      projectsRef,
      interestsRef,
      experienceRef,
      skillsRef,
    ];
    const onScroll = () => {
      refs.forEach((ref) => {
        if (ref.current) {
          const elementTop = ref.current.getBoundingClientRect().top;
          const isShown = elementTop < window.innerHeight - 100;
          if (isShown) {
            ref.current.classList.add("visible");
          }
        }
      });
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Render loading or error state if data is not yet available
  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>{data.name}</title>
        <meta name="description" content={data.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Person",
            name: "Shylesh S",
            jobTitle: "Full Stack Developer",
            url: "https://shylesh-s.vercel.app/",
            sameAs: [
              "https://www.linkedin.com/in/s-shylesh/",
              "https://github.com/shylesh128",
            ],
          })}
        </script>
        <meta
          name="keywords"
          content="Fullstack Developer portfolio website,Freelance Fullstack Developer portfolio,Web Developer portfolio examples,Online portfolio for Fullstack Developers,Best Fullstack Developer portfolios,Creative portfolio website for Developers,Fullstack Developer showcase website,Portfolio design for Freelance Developers,Web Developer portfolio inspiration,Fullstack Developer portfolio for hire,Shylesh S portfolio website,Fullstack Developer portfolio design ideas,Portfolio website development for Freelancers,Best practices for building a Fullstack Developer portfolio,How to create a Freelance Fullstack Developer portfolio,Fullstack Developer portfolio tips and tricks,Portfolio website templates for Fullstack Developers,How to showcase your skills as a Fullstack Developer,Building a portfolio website for Web Developers,Online portfolio tools for Freelance Developers, MERN stack development services, Expert MERN stack developer for hire, Full-stack JavaScript developer, React developer for hire, Node.js developer for hire, MERN stack web application development, Custom MERN stack development, Full-stack development services, MERN stack e-commerce development, Affordable MERN stack development, Shylesh S, Shylesh S, MERN stack website development, MERN stack mobile app development, MERN stack front-end development, MERN stack back-end development, MERN stack UI/UX design, MERN stack API development, MERN stack LMS development, MERN stack plugin development, MERN stack integration services, MERN stack support and maintenance"
        ></meta>
        <meta property="og:title" content={data.name} />
        <meta property="og:description" content={data.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shylesh-s.vercel.app/" />
        <meta property="og:image" content="public/shylesh.jpg" />
      </Head>

      <Navigation isDarkMode={isDarkMode} toggleMode={toggleMode} />

      {/* Header Section */}
      <AnimationItem>
        <div id="Header">
          <Header data={data} />
        </div>
      </AnimationItem>

      {/* Skills Section */}
      <AnimationItem>
        <div id="skills">
          <SkillsSection skills={data.skills} />
        </div>
      </AnimationItem>
      {/* Experience Section */}
      <AnimationItem>
        <div id="experiences">
          <ExperienceSection experiences={data.experiences} />
        </div>
      </AnimationItem>

      {/* Projects Section */}
      <AnimationItem>
        <div id="projects">
          <ProjectsSection projects={data.projects} />
        </div>
      </AnimationItem>

      {/* Education Section */}
      <AnimationItem>
        <div id="studies">
          <EducationStudies studies={data.education} />
        </div>
      </AnimationItem>

      {/* certificate section */}

      <div id="certificates">
        <CertificatesSection certificates={data.certificates} />
      </div>

      {/* Interests Section */}
      <AnimationItem>
        <div id="interests">
          <InterestsSection interests={data.interests} />
        </div>
      </AnimationItem>

      <AnimationItem>
        <div id="contact">
          <Contact contact={data.contact} />
        </div>
      </AnimationItem>

      <AnimationItem>
        <div id="message">
          <ContactForm />
        </div>
      </AnimationItem>
    </>
  );
}
