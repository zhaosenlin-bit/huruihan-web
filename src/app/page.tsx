import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Methods from "@/components/Methods";
import Projects from "@/components/Projects";
import Showcase from "@/components/Showcase";
import Learning from "@/components/Learning";
import Path from "@/components/Path";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-14">
        <Hero />
        <About />
        <Skills />
        <Methods />
        <Projects />
        <Showcase />
        <Learning />
        <Path />
        <Contact />
      </main>
      <Footer />
    </>
  );
}