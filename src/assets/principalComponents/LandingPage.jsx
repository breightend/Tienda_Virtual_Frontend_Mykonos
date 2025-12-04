import { useLocation } from "wouter";
import * as motion from "motion/react-client";

export default function LandingPage() {
  const [location, setLocation] = useLocation();

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
    <div className="bg-base-100" style={{ marginTop: "-64px" }}>
      {/* Hero Section - Elegante y Minimalista */}
      <div className="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h1 className="text-7xl font-light tracking-widest mb-4 text-base-content">
                MYKONOS
              </h1>
              <div className="w-24 h-px bg-primary mx-auto mb-8"></div>
            </motion.div>
            
            <motion.p
              className="text-2xl font-light text-base-content/80 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              Moda Contemporánea
            </motion.p>
            
            <motion.p
              className="text-lg text-base-content/60 max-w-2xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Descubra nuestra colección exclusiva de prendas premium, 
              diseñadas para el estilo de vida moderno y sofisticado.
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

      {/* Features Section */}
      <motion.div
        className="min-h-screen bg-base-200 py-20 px-4"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ amount: 0.3 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-5xl font-light text-center mb-4 text-base-content tracking-wide"
            variants={cardVariants}
          >
            Excelencia en Cada Detalle
          </motion.h2>
          <motion.div
            className="w-16 h-px bg-primary mx-auto mb-16"
            variants={cardVariants}
          ></motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Calidad Premium",
                description: "Tejidos selectos y confección artesanal para garantizar durabilidad y elegancia.",
              },
              {
                title: "Diseño Atemporal",
                description: "Colecciones que trascienden tendencias, perfecto balance entre clásico y contemporáneo.",
              },
              {
                title: "Experiencia Única",
                description: "Servicio personalizado y atención al detalle en cada compra.",
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
                  <h3 className="card-title text-2xl font-light text-base-content mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-base-content/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Call to Action Section */}
      <motion.div
        className="min-h-screen flex items-center justify-center bg-base-100 px-4"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ amount: 0.5 }}
      >
        <motion.div
          className="text-center max-w-3xl"
          variants={cardVariants}
        >
          <h2 className="text-5xl font-light mb-6 text-base-content tracking-wide">
            Explore Nuestra Colección
          </h2>
          <div className="w-16 h-px bg-primary mx-auto mb-8"></div>
          <p className="text-xl text-base-content/70 mb-12 leading-relaxed">
            Prendas cuidadosamente seleccionadas para su guardarropa. 
            Cada pieza cuenta una historia de elegancia y distinción.
          </p>
          <motion.button
            className="btn btn-primary btn-lg px-12 text-lg font-light tracking-wider"
            onClick={goToStore}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            VISITAR TIENDA
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Brand Statement Section */}
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-300 to-base-200 px-4"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ amount: 0.5 }}
      >
        <motion.div
          className="text-center"
          variants={cardVariants}
        >
          <h1 
            className="text-base-content font-extralight tracking-[0.3em] mb-8"
            style={{
              fontSize: "clamp(3rem, 15vw, 12rem)",
            }}
          >
            MYKONOS
          </h1>
          <p className="text-base-content/60 text-xl font-light tracking-widest">
            ELEGANCIA CONTEMPORÁNEA
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
