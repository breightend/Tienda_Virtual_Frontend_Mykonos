import { useLocation } from "wouter";
import * as motion from "motion/react-client";
import InteractiveBackground from "./InteractiveBackground";
import { useState, useRef, useEffect } from "react";

export default function LandingPage() {
  const [location, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState(0);
  
  // Referencias a las secciones
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const ctaRef = useRef(null);
  const featuresRef = useRef(null);
  const sucursalesRef = useRef(null);
  const brandRef = useRef(null);

  const sections = [
    { name: "Inicio", ref: heroRef },
    { name: "Colección", ref: ctaRef },
    { name: "Excelencia", ref: featuresRef },
    { name: "Sucursales", ref: sucursalesRef },
    { name: "Mykonos", ref: brandRef },
  ];

  // Detectar sección activa automáticamente
  useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sections.findIndex(
            (section) => section.ref.current === entry.target
          );
          if (index !== -1) {
            setActiveSection(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((section) => {
      if (section.ref.current) {
        observer.observe(section.ref.current);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section.ref.current) {
          observer.unobserve(section.ref.current);
        }
      });
    };
  }, []);

  const scrollToSection = (index) => {
    const section = sections[index].ref.current;
    const container = containerRef.current;
    
    if (section && container) {
      const sectionTop = section.offsetTop;
      container.scrollTo({
        top: sectionTop,
        behavior: "smooth"
      });
    }
  };

  const goToStore = () => {
    setLocation("/store");
  };

  const cardVariants = {
    offscreen: {
      y: 100,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      {/* Navegador de Secciones */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4">
        {sections.map((section, index) => (
          <div
            key={index}
            className="relative group"
          >
            {/* Cuadradito */}
            <motion.button
              onClick={() => scrollToSection(index)}
              className={`w-3 h-3 rounded-sm transition-all duration-300 ${
                activeSection === index
                  ? "bg-primary w-4"
                  : "bg-base-content/30 hover:bg-primary/60"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
            
            {/* Tooltip con nombre de sección */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
              <div className="bg-base-300 text-base-content px-4 py-2 rounded-lg shadow-lg whitespace-nowrap font-light tracking-wide">
                {section.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div 
        ref={containerRef}
        className="bg-base-100" 
        style={{ 
          marginTop: "-64px",
          scrollSnapType: "y mandatory",
          overflowY: "scroll",
          height: "100vh"
        }}
      >
      {/* Hero Section - Elegante y Minimalista */}
      <div ref={heroRef} className="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300 relative overflow-hidden" style={{ scrollSnapAlign: "start" }}>
        {/* Fondo Interactivo con Flechitas */}
        <InteractiveBackground />
        <div className="hero-content text-center px-4">
          <div className="max-w-4xl w-full">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-widest mb-4 text-base-content">
                MYKONOS
              </h1>
              <div className="w-24 h-px bg-primary mx-auto mb-8"></div>
            </motion.div>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl font-light text-base-content/80 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              Moda Contemporánea
            </motion.p>

            <motion.p
              className="text-sm sm:text-base md:text-lg text-base-content/60 max-w-2xl mx-auto mb-12 leading-relaxed px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Descubra nuestra colección exclusiva de prendas premium, diseñadas
              para el estilo de vida moderno y sofisticado.
            </motion.p>

            <motion.div
              className="text-base-content/40 text-sm font-light animate-bounce"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ↓
            </motion.div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <motion.div
        ref={ctaRef}
        className="min-h-screen flex items-center justify-center bg-base-100 px-4"
        style={{ scrollSnapAlign: "start" }}
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ amount: 0.5 }}
      >
        <motion.div className="text-center max-w-3xl w-full" variants={cardVariants}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 text-base-content tracking-wide px-4">
            Explore Nuestra Colección
          </h2>
          <div className="w-16 h-px bg-primary mx-auto mb-8"></div>
          <p className="text-base sm:text-lg md:text-xl text-base-content/70 mb-12 leading-relaxed px-4">
            Prendas cuidadosamente seleccionadas para su guardarropa. Cada pieza
            cuenta una historia de elegancia y distinción.
          </p>
          <motion.button
            className="btn btn-primary btn-md sm:btn-lg px-8 sm:px-12 text-base sm:text-lg font-light tracking-wider"
            onClick={goToStore}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            VISITAR TIENDA
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        ref={featuresRef}
        className="min-h-screen bg-base-200 py-12 sm:py-16 md:py-20 px-4"
        style={{ scrollSnapAlign: "start" }}
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ amount: 0.3 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-light text-center mb-4 text-base-content tracking-wide px-4"
            variants={cardVariants}
          >
            Excelencia en Cada Detalle
          </motion.h2>
          <motion.div
            className="w-16 h-px bg-primary mx-auto mb-8 sm:mb-12 md:mb-16"
            variants={cardVariants}
          ></motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            {[
              {
                title: "Calidad Premium",
                description:
                  "Tejidos selectos y confección artesanal para garantizar durabilidad y elegancia.",
              },
              {
                title: "Diseño Atemporal",
                description:
                  "Colecciones que trascienden tendencias, perfecto balance entre clásico y contemporáneo.",
              },
              {
                title: "Experiencia Única",
                description:
                  "Servicio personalizado y atención al detalle en cada compra.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
                variants={cardVariants}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="card-body items-center text-center">
                  <h3 className="card-title text-xl sm:text-2xl font-light text-base-content mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-base-content/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Informacion Sucursales*/}
      <div ref={sucursalesRef} className="bg-base-100 py-12 sm:py-16 md:py-20 px-4 min-h-screen" style={{ scrollSnapAlign: "start" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-widest mb-4 text-base-content px-4">
              NUESTRAS SUCURSALES
            </h2>
            <div className="w-16 h-px bg-primary mx-auto mb-6"></div>
            <p className="text-base-content/70 text-base sm:text-lg font-light px-4">
              Visite nuestras boutiques
            </p>
          </motion.div>

          {/* Sucursal 1 */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ amount: 0.5, once: false }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12 sm:mb-20 md:mb-32"
          >
            <div className="card lg:card-side bg-base-100 shadow-xl">
              <figure className="lg:w-1/2 h-64 sm:h-80 lg:h-auto">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
                  alt="Sucursal Centro"
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body lg:w-1/2 justify-center">
                <h3 className="card-title text-2xl sm:text-3xl font-light tracking-wide text-base-content">
                  MYKONOS PARANÁ
                </h3>
                <div className="w-12 h-px bg-primary/50 my-4"></div>
                <p className="text-base-content/80 text-sm sm:text-base md:text-lg leading-relaxed mb-4">
                  Nuestra boutique insignia ubicada en el corazón de la ciudad.
                  Un espacio elegante donde la moda contemporánea cobra vida.
                </p>
                <div className="space-y-2 text-sm sm:text-base text-base-content/70">
                  <p className="flex items-center gap-2">
                    <span className="font-light">📍</span>
                    <span>Peatonal San Martin 695, Paraná, Entre Ríos</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-light">📞</span>
                    <span>+54 9 343 509 1341</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <div className="flex">
                      <span className="font-light">🕐</span>
                      <span>Lunes a Sábado 8:30 a 12:30 16:30 a 20:30hs</span>
                    </div>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sucursal 2 */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ amount: 0.5, once: false }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12 sm:mb-16 md:mb-20"
          >
            <div className="card lg:card-side bg-base-100 shadow-xl">
              <div className="card-body lg:w-1/2 justify-center lg:order-1">
                <h3 className="card-title text-2xl sm:text-3xl font-light tracking-wide text-base-content">
                  MYKONOS CONCORDIA
                </h3>
                <div className="w-12 h-px bg-primary/50 my-4"></div>
                <p className="text-base-content/80 text-sm sm:text-base md:text-lg leading-relaxed mb-4">
                  Nuestra sucursal a pasos de la peatonal Concordia. Un espacio
                  diseñado para ofrecer una experiencia de compra exclusiva y
                  personalizada.
                </p>
                <div className="space-y-2 text-sm sm:text-base text-base-content/70">
                  <p className="flex items-center gap-2">
                    <span className="font-light">📍</span>
                    <span>A. del Valle 26, Concordia, Entre Ríos</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-light">📞</span>
                    <span>+54 9 345 5201 623</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-light">🕐</span>
                    <span>Lunes a Sábado 8:30 a 12:30 16:30 a 20:30hs</span>
                  </p>
                </div>
              </div>
              <figure className="lg:w-1/2 lg:order-2 h-64 sm:h-80 lg:h-auto">
                <img
                  src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&q=80"
                  alt="Sucursal Plaza"
                  className="w-full h-full object-cover"
                />
              </figure>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Brand Statement Section */}
      <motion.div
        ref={brandRef}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-300 to-base-200 px-4"
        style={{ scrollSnapAlign: "start" }}
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ amount: 0.5 }}
      >
        <motion.div className="text-center" variants={cardVariants}>
          <h1
            className="text-base-content font-extralight tracking-[0.3em] mb-8"
            style={{
              fontSize: "clamp(3rem, 15vw, 12rem)",
            }}
          >
            MYKONOS
          </h1>
          <p className="text-base-content/60 text-sm sm:text-base md:text-xl font-light tracking-widest px-4">
            ELEGANCIA CONTEMPORÁNEA
          </p>
        </motion.div>
      </motion.div>
    </div>
    </>
  );
}
