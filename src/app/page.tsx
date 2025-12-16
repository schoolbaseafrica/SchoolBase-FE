import HomeAboutSection from "./_components/home-about-us"
import HomeDemo from "./_components/home-demo"
import HomeFaq from "./_components/home-faq"
import HomeForWho from "./_components/home-for-who"
import HomeHero from "./_components/home-hero"
import HomeHowItWorks from "./_components/home-how-it-works"
import HomeTestimonial from "./_components/home-testimonial"
import HomeWhyUs from "./_components/home-why-us"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HomeHero />
      <HomeAboutSection />
      <HomeHowItWorks />
      <HomeWhyUs />
      <HomeForWho />
      <HomeTestimonial />
      <HomeFaq />
      <HomeDemo />
      <Footer />
    </div>
  )
}
