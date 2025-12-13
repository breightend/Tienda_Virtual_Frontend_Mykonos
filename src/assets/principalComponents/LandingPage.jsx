import { useLocation } from "wouter";
import * as motion from "motion/react-client";
import InteractiveBackground from "./InteractiveBackground";
import { useState, useRef, useEffect } from "react";

// Import images
import percheroConcordia from "../images/percheroConcordia.jpg";
import fabricTextures from "../images/fabric_textures.png";
import clothingDetails from "../images/clothing_details.png";
import entreRios from "../images/entre_rios.jpg";
import generalConcordia from "../images/generalConcordia.jpg";

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
          scrollSnapType: "y proximity",
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
        className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
        style={{ scrollSnapAlign: "start" }}
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ amount: 0.5 }}
      >
        {/* Fondo con gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-base-200 via-base-100 to-base-200"></div>
        
        <motion.div 
          className="text-center max-w-4xl w-full relative z-10" 
          variants={cardVariants}
        >
          {/* Título principal */}
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-6 text-base-content tracking-wide px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Explore Nuestra Colección
          </motion.h2>
          
          {/* Línea decorativa */}
          <motion.div 
            className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ duration: 1, delay: 0.3 }}
          ></motion.div>
          
          {/* Descripción */}
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-base-content/80 mb-4 leading-relaxed px-4 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Prendas cuidadosamente seleccionadas para su guardarropa.
          </motion.p>
          
          <motion.p 
            className="text-base sm:text-lg text-base-content/60 mb-12 px-4 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Cada pieza cuenta una historia de elegancia y distinción.
          </motion.p>
          
          {/* Botón mejorado con efectos */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.button
              className="btn btn-primary btn-lg px-12 sm:px-16 text-lg sm:text-xl font-light tracking-widest relative overflow-hidden group shadow-2xl"
              onClick={goToStore}
              whileHover={{ scale: 1.08, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Efecto de brillo al hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              
              <span className="relative flex items-center gap-3">
                VISITAR TIENDA
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
          
          {/* Texto adicional sutil */}
          <motion.p
            className="text-sm text-base-content/40 mt-8 font-light"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            Descubre las últimas tendencias
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Features Section - Optimizada para rendimiento */}
      <div
        ref={featuresRef}
        className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 py-12 sm:py-16 md:py-20 px-4"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-4 text-base-content tracking-wide px-4">
              Nuestra Esencia
            </h2>
            <div className="w-16 h-px bg-primary mx-auto mb-6"></div>
            <p className="text-base-content/70 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Desde Entre Ríos para el mundo, cada prenda cuenta una historia de calidad y dedicación
            </p>
          </div>

          {/* Sección de Productos con Imagen Grande */}
          <div className="mb-12 sm:mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 text-base-content">
                  Colección Cuidadosamente Seleccionada
                </h3>
                <div className="w-12 h-px bg-primary/50 mb-6"></div>
                <p className="text-base-content/80 text-base sm:text-lg leading-relaxed mb-6">
                  Cada prenda en nuestra colección es elegida con criterio experto, 
                  combinando las últimas tendencias con la atemporalidad que caracteriza 
                  al buen vestir.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-base-content/70">Variedad de estilos para cada ocasión</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-base-content/70">Talles pensados para todos</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-base-content/70">Renovación constante de stock</span>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={percheroConcordia}
                    alt="Perchero de Concordia"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Telas */}
          <div className="mb-12 sm:mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={fabricTextures}
                    alt="Texturas y Colores de Telas Premium"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 text-base-content">
                  Materiales de Primera Calidad
                </h3>
                <div className="w-12 h-px bg-primary/50 mb-6"></div>
                <p className="text-base-content/80 text-base sm:text-lg leading-relaxed mb-6">
                  Trabajamos exclusivamente con telas premium que garantizan 
                  comodidad, durabilidad y un aspecto impecable lavado tras lavado.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-base-content/70">Algodón peinado de alta densidad</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-base-content/70">Telas con certificación de calidad</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-base-content/70">Colores que perduran en el tiempo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Detalles */}
          <div className="mb-12 sm:mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 text-base-content">
                  Atención a Cada Detalle
                </h3>
                <div className="w-12 h-px bg-primary/50 mb-6"></div>
                <p className="text-base-content/80 text-base sm:text-lg leading-relaxed mb-6">
                  La excelencia está en los pequeños detalles: costuras reforzadas, 
                  terminaciones prolijas y un control de calidad riguroso en cada prenda.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-base-content/70">Costuras dobles en puntos críticos</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-base-content/70">Etiquetas suaves y discretas</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-base-content/70">Inspección individual antes de la venta</span>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={clothingDetails}
                    alt="Detalles de Confección Premium"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección Entre Ríos - Banner especial */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative h-64 sm:h-80 md:h-96">
              <img
                src={entreRios}
                alt="Entre Ríos, Argentina"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-base-300/95 via-base-300/80 to-transparent"></div>
              
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-2xl px-6 sm:px-12">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-light mb-4 text-base-content">
                    Orgullosamente Entrerrianos
                  </h3>
                  <div className="w-12 h-px bg-primary mb-4"></div>
                  <p className="text-base-content/90 text-sm sm:text-base md:text-lg leading-relaxed">
                    Desde el corazón de Entre Ríos, llevamos moda de calidad a toda la región. 
                    Con presencia en Paraná y Concordia, somos parte de la identidad entrerriana, 
                    combinando la calidez de nuestra tierra con el profesionalismo y la excelencia 
                    que nos caracteriza.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                    <span>Peatonal San Martin695, Paraná, Entre Ríos</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-light">📞</span>
                    <span>+54 9 343 509 1341</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      <span className="font-light">🕐</span>
                      <span>Lunes a Sábado 8:30 a 12:30 16:30 a 20:30hs</span>
                    </div>
                  </div>
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
                  src={generalConcordia}
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
