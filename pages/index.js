import { useEffect, useRef } from "react";
import Head from "next/head";
import Header from "../components/Header";
import AboutMe from "../components/AboutMe";
import ProjectsSection from "../components/ProjectsSection";
import InterestsSection from "../components/InterestsSection";
import ExperienceSection from "../components/ExperienceSection";
import SkillsSection from "../components/SkillsSection";
import { AnimationItem } from "../components/AnimationItem";
import data from "./data.json";
import EducationStudies from "@/components/EducationStudies";
import CertificatesSection from "@/components/CertificatesSection";
import Navigation from "@/components/Navigation";

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
        <title>My Portfolio</title>
        <meta name="description" content="Creative and Enjoyable Portfolio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
    </>
  );
}
