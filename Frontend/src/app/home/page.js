"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Canvas } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { auth } from "../../../lib/firebase"; // Adjust path as needed
import { signOut } from "firebase/auth";
import * as THREE from "three";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Custom particle system using Three.js and react-three-fiber
function ParticleCloud() {
  const ref = useRef();
 
  // Generate random positions for particles
  const count = 3000;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 10;
    positions[i3 + 1] = (Math.random() - 0.5) * 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 10;
  }

  useEffect(() => {
    if (ref.current) {
      // Animate the particles
      gsap.to(ref.current.rotation, {
        y: Math.PI * 2,
        duration: 120,
        repeat: -1,
        ease: "none"
      });
    }
  }, []);

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8a2be2"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

// Particle background component
const ParticleBackground = () => {
  return (
    <Canvas camera={{ position: [0, 0, 1] }}>
      <ambientLight intensity={0.5} />
      <ParticleCloud />
    </Canvas>
  );
};

// Floating letters component that only renders on client side
const FloatingLetters = () => {
  const [letters, setLetters] = useState([]);
  const kannadaLetters = ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಋ", "ಎ", "ಏ", "ಐ"];
  
  useEffect(() => {
    // Generate positions only on client side
    const letterPositions = kannadaLetters.map((letter) => ({
      letter,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`
    }));
    
    setLetters(letterPositions);
  }, []);
  
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {letters.map((item, index) => (
        <div 
          key={index} 
          className="floating-letter absolute text-4xl opacity-20 text-white"
          style={{
            top: item.top,
            left: item.left
          }}
        >
          {item.letter}
        </div>
      ))}
    </div>
  );
};

export default function HomePage() {
  const router = useRouter();
  const mainRef = useRef(null);
  const titleRef = useRef(null);
  const subTitleRef = useRef(null);
  const buttonsRef = useRef([]);
  const sectionsRef = useRef([]);
  const timelineRef = useRef(null);
  const letterAnimationsRef = useRef(null);
  const footerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  // const auth = getAuth();

  // Set client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Split text animation helper
  // const splitTextIntoSpans = (text) => {
  //   return text.split('').map((char, i) => (
  //     <span key={i} className="inline-block">
  //       {char === ' ' ? '\u00A0' : char}
  //     </span>
  //   ));
  // };

  // Initial loading animation
  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => setIsLoaded(true)
    });

    // Preloader animation
    tl.to(".preloader", {
      duration: 1,
      y: "-100%",
      ease: "power4.inOut",
      delay: 0.5
    });

    // Hero section animations
    tl.fromTo(
      titleRef.current.children,
      { opacity: 0, y: 50, rotation: 15 },
      { opacity: 1, y: 0, rotation: 0, duration: 1.2, stagger: 0.05, ease: "back.out" }
    );

    tl.fromTo(
      subTitleRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    );

    // Button animations with bounce effect
    tl.fromTo(
      buttonsRef.current,
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.7, 
        stagger: 0.2, 
        ease: "elastic.out(1, 0.3)",
        onComplete: () => {
          // Add hover animations after initial animation
          buttonsRef.current.forEach(btn => {
            gsap.to(btn, {
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              duration: 0.3,
              paused: true,
              ease: "power1.out"
            });
          });
        }
      },
      "-=0.3"
    );

    // Create floating animation for title
    gsap.to(titleRef.current, {
      y: "+=15",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    return () => {
      tl.kill();
    };
  }, []);

  // Scroll-based animations
  useEffect(() => {
    if (!isLoaded) return;

    // Create timeline for scrolling sections
    timelineRef.current = gsap.timeline({
      scrollTrigger: {
        trigger: mainRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1
      }
    });

    // Parallax effect for hero section
    timelineRef.current.to(".hero-content", {
      y: 200,
      ease: "none"
    }, 0);

    // Section animations with different effects
    sectionsRef.current.forEach((section, index) => {
      // Different animation for each section
      const direction = index % 2 === 0 ? -1 : 1;
      
      // Backgrounds with gradient animations
      gsap.to(section.querySelector(".bg-gradient"), {
        backgroundPosition: "100% 100%",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 2
        }
      });
      
      // Text animations
      gsap.fromTo(
        section.querySelector("h2").children,
        { 
          opacity: 0, 
          y: 50 * direction,
          rotationX: 45
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          stagger: 0.05,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
      
      // Image/graphics animations
      if (section.querySelector(".feature-graphic")) {
        gsap.fromTo(
          section.querySelector(".feature-graphic"),
          { 
            opacity: 0, 
            scale: 0.8,
            rotation: -5 * direction
          },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 1.2,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    });

    // Animated letters background
    letterAnimationsRef.current = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.5
    });

    document.querySelectorAll('.floating-letter').forEach((letter, i) => {
      const delay = i * 0.2;
      letterAnimationsRef.current.to(letter, {
        y: "random(-100, 100)",
        x: "random(-100, 100)",
        rotation: "random(-45, 45)",
        opacity: gsap.utils.random(0.3, 0.8),
        scale: gsap.utils.random(0.8, 1.5),
        duration: 10,
        ease: "sine.inOut"
      }, delay);
    });

    // Footer animation
    gsap.fromTo(
      footerRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top bottom",
          toggleActions: "play none none none"
        }
      }
    );

    return () => {
      // Clean up all scroll triggers
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      if (timelineRef.current) timelineRef.current.kill();
      if (letterAnimationsRef.current) letterAnimationsRef.current.kill();
    };
  }, [isLoaded]);

  // Button hover animations
  const handleMouseEnter = (index) => {
    gsap.to(buttonsRef.current[index], {
      scale: 1.1,
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
      duration: 0.3,
      ease: "power1.out"
    });
  };

  const handleMouseLeave = (index) => {
    gsap.to(buttonsRef.current[index], {
      scale: 1,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
      duration: 0.3,
      ease: "power1.in"
    });
  };

  const LogoutButton = () => {
    const handleLogout = async () => {
      try {
        await signOut(auth);
        router.push("/");
      } catch (error) {
        console.error("Logout failed", error);
      }
    };

    return (
      <button
        onClick={handleLogout}
        className="cursor-pointer absolute top-4 right-6 px-4 py-2 text-white bg-purple-700 bg-opacity-80 rounded-lg shadow-lg hover:bg-purple-800 hover:scale-105"
      >
        Logout
      </button>
    );
  };


  return (
    <div ref={mainRef} className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-black via-purple-900 to-black text-white">
      <div className="preloader fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-4xl font-bold text-white">ಕನ್ನಡ</div>
      </div>

      {isClient && (
        <div className="fixed inset-0 z-0">
          <ParticleBackground />
        </div>
      )}
      
      {isClient && <FloatingLetters />}

      <section className="h-screen flex flex-col items-center justify-center text-center relative z-10">
        <LogoutButton />
        <div className="hero-content">
          <h1 ref={titleRef} className="text-7xl font-extrabold drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            {("📚 Kannada Learning Hub")}
          </h1>

          <p ref={subTitleRef} className="text-2xl mt-4 text-purple-200">
            Fun & Interactive Games to Learn Kannada Alphabets!
          </p>
          <div className="mt-12 flex flex-wrap gap-6 justify-center">
            {[
              { path: "/learn", label: "✍️ Learn to Write", color: "bg-gradient-to-r from-blue-600 to-blue-400" },
              { path: "/match", label: "🔊 Matching Game", color: "bg-gradient-to-r from-green-600 to-green-400" },
              { path: "/memory", label: "🎮 Memory Game", color: "bg-gradient-to-r from-red-600 to-red-400" },
            ].map((item, index) => (
              <button
                key={item.path}
                ref={(el) => (buttonsRef.current[index] = el)}
                onClick={() => router.push(item.path)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                className={`px-8 py-4 ${item.color} text-white text-xl rounded-xl shadow-lg transform transition-all cursor-pointer`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <p className="text-sm mb-2 text-purple-300">Scroll to explore</p>
          <div className="w-6 h-10 border-2 border-purple-300 rounded-full flex justify-center">
            <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce mt-2"></div>
          </div>
        </div>
      </section>

      {/* Scroll Sections with Advanced GSAP Animations */}
      {[
        { 
          text: "✏️ Learn to Write Kannada Letters!", 
          bg: "from-indigo-900 via-purple-800 to-indigo-900",
          description: "Master Kannada script with our interactive writing exercises designed for beginners.",
          icon: "✏️"
        },
        { 
          text: "🔊 Match Kannada Letters with Pronunciation!", 
          bg: "from-blue-900 via-blue-800 to-blue-900",
          description: "Improve your listening skills and pronunciation with our audio matching game.",
          icon: "🔊"
        },
        { 
          text: "🎮 Improve Memory with Letter Matching!", 
          bg: "from-green-900 via-green-800 to-green-900",
          description: "Challenge your memory while learning Kannada characters in our fun memory game.",
          icon: "🎮"
        },
      ].map((item, index) => (
        <section
          key={index}
          ref={(el) => (sectionsRef.current[index] = el)}
          className="min-h-screen flex items-center justify-center text-white text-center p-10 relative overflow-hidden"
        >
          {/* Animated gradient background */}
          <div 
            className={`bg-gradient absolute inset-0 bg-gradient-to-br ${item.bg} bg-size-200 z-0`}
            style={{ backgroundSize: "200% 200%", backgroundPosition: "0% 0%" }}
          />
          
          <div className="relative z-10 max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            <div className={`text-left ${index % 2 !== 0 ? "md:order-2" : ""}`}>
              <h2 className="text-5xl font-bold mb-6">
                {item.text}
              </h2>
              <p className="text-xl opacity-90 mb-8">{item.description}</p>
              <button 
                className="px-6 py-3 bg-white text-purple-900 rounded-lg font-bold transform hover:scale-105 transition-all"
                onClick={() => router.push(index === 0 ? "/learn" : index === 1 ? "/match" : "/memory")}
              >
                Get Started
              </button>
            </div>
            
            <div className={`feature-graphic flex justify-center ${index % 2 !== 0 ? "md:order-1" : ""}`}>
              <div className="w-64 h-64 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-8xl">{item.icon}</span>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Call to Action Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-black text-center p-10 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
            Start Your Kannada Journey Today!
          </h2>
          <p className="text-2xl text-purple-200 mb-12 max-w-2xl mx-auto">
            Join thousands of learners mastering Kannada through our interactive games and exercises. Perfect for beginners of all ages!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: "🚀", title: "Learn Fast", description: "Master the basics in just minutes a day with our proven learning method" },
              { icon: "🎯", title: "Stay Motivated", description: "Gamified approach keeps you engaged and excited to learn more" },
              { icon: "🏆", title: "Track Progress", description: "See your improvement over time with detailed progress tracking" }
            ].map((feature, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-purple-200">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <button 
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl rounded-xl shadow-lg transform hover:scale-105 transition-all"
            onClick={() => {
              // Smooth scroll to top
              gsap.to(window, {duration: 1.5, scrollTo: 0, ease: "power3.inOut"});
            }}
          >
            Get Started Now
          </button>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-24 h-24 bg-white/5 rounded-full"
              // style={{
              //   top: `${Math.random() * 100}%`,
              //   left: `${Math.random() * 100}%`,
              //   transform: `scale(${Math.random() * 3 + 0.5})`,
              //   animationDuration: `${Math.random() * 20 + 10}s`,
              //   animationDelay: `${Math.random() * 5}s`
              // }}
            />
          ))}
        </div>
      </section>

      {/* Testimonials section */}
      {/* <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-purple-900 text-center p-10 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-12">What Our Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: "Rahul M.", quote: "I never thought learning Kannada could be so fun! The writing exercises are perfect for beginners.", avatar: "👨‍💼" },
              { name: "Priya S.", quote: "The audio matching game helped me finally understand the pronunciation differences between similar letters.", avatar: "👩‍🎓" },
              { name: "Arjun K.", quote: "My kids love the memory game - they're learning Kannada without even realizing it!", avatar: "👨‍👧‍👦" },
              { name: "Meera R.", quote: "As someone who grew up speaking Kannada but never learned to read it, this app has been a game-changer.", avatar: "👩‍🏫" }
            ].map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-left transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold">{testimonial.name}</h3>
                  </div>
                </div>
                <p className="text-purple-200">{testimonial.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer ref={footerRef} className="p-10 bg-black text-white text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-6xl mb-6">ಕನ್ನಡ</div>
          <p className="text-xl mb-8">© 2025 Kannada Learning Hub | Made with ❤️</p>
          
          <div className="flex justify-center space-x-6 mb-8">
            {["About", "Contact", "Privacy", "Terms"].map((item, i) => (
              <a key={i} href="#" className="text-purple-300 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
          
          <div className="text-sm text-purple-400">
            Learn Kannada anywhere, anytime. Perfect for beginners and language enthusiasts.
          </div>
        </div>
      </footer>
    </div>
  );
}