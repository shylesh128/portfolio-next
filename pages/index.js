import { useEffect, useRef } from "react";
import Head from "next/head";
import Header from "../components/Header";
import ProjectsSection from "../components/ProjectsSection";
import InterestsSection from "../components/InterestsSection";
import ExperienceSection from "../components/ExperienceSection";
import SkillsSection from "../components/SkillsSection";
import { AnimationItem } from "../components/AnimationItem";
import data from "./data.json";
import EducationStudies from "@/components/EducationStudies";
import CertificatesSection from "@/components/CertificatesSection";
import Navigation from "@/components/Navigation";
import Contact from "@/components/contact";

export default function Home() {
  const headerRef = useRef(null);
  const aboutMeRef = useRef(null);
  const projectsRef = useRef(null);
  const interestsRef = useRef(null);
  const experienceRef = useRef(null);
  const skillsRef = useRef(null);

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
        <meta property="og:title" content={data.name} />
        <meta property="og:description" content={data.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shylesh-s.vercel.app/" />
        <meta property="og:image" content="public/shylesh.jpg" />
        <meta
          name="keywords"
          content="full, stack, developer, shylesh, portfolio"
        />
      </Head>

      <Navigation />
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
          <ProjectsSection projects={data.projects} id="projects" />
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
    </>
  );
}
