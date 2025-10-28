import CTA from "@/components/home/cta"
import Hero from "@/components/home/Hero"
import Footer from "@/components/home/footer"
import Header from "@/components/home/header"
import Contact from "@/components/home/contact"
import Features from "@/components/home/features"
import HowItWorks from "@/components/home/how-it-works"
// import Testimonial from "@/components/home/testimonial"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#DAD7CD]">
            <Header />
            <Hero />
            <Features />
            <HowItWorks />
            {/* <Testimonial /> */}
            <Contact />
            <CTA />
            <Footer />
        </div>
    )
}
