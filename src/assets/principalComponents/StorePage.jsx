import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export default function StorePage() {
  const [selectedCard, setSelectedCard] = useState(null);

  const cards = [
    {
      id: 1,
      image:
        "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
      title: "Blazer Ejecutivo",
      price: "€245.00",
      description:
        "Blazer de corte clásico confeccionado en lana premium. Diseño atemporal perfecto para ocasiones formales y profesionales.",
    },
    {
      id: 2,
      image:
        "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
      title: "Camisa Oxford",
      price: "€89.00",
      description:
        "Camisa de algodón egipcio con corte regular. Tejido transpirable de alta calidad ideal para uso diario o formal.",
    },
    {
      id: 3,
      image:
        "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
      title: "Pantalón Sastre",
      price: "€135.00",
      description:
        "Pantalón de vestir con pinzas y corte elegante. Confeccionado en mezcla de lana para mayor comodidad y durabilidad.",
    },
    {
      id: 4,
      image:
        "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
      title: "Vestido Cóctel",
      price: "€198.00",
      description:
        "Vestido midi de corte impecable en tejido premium. Diseño sofisticado perfecto para eventos especiales.",
    },
  ];

  return (
    <div className="bg-base-100 min-h-screen py-12 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-light tracking-widest mb-4 text-base-content">
            COLECCIÓN
          </h1>
          <div className="w-16 h-px bg-primary mx-auto mb-6"></div>
          <p className="text-base-content/70 text-lg font-light">
            Primavera / Verano 2025
          </p>
        </motion.div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}

            onClick={() => setSelectedCard(card)}
            className="card bg-base-200 shadow-lg hover:shadow-xl cursor-pointer group"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8 }}
          >
            <figure className="relative overflow-hidden aspect-[3/4]">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </figure>
            <div className="card-body p-6">
              <h2 className="card-title text-xl font-light text-base-content tracking-wide">
                {card.title}
              </h2>
              <p className="text-primary font-light text-lg mb-2">
                {card.price}
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary btn-sm font-light tracking-wide">
                  VER DETALLES
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedCard && (
          <>
            {/* Backdrop con blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedCard(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
              style={{ backdropFilter: "blur(10px)" }}
            />

            {/* Card expandida */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-8"
              onClick={() => setSelectedCard(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="card bg-base-100 w-full max-w-3xl shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <figure className="h-96">
                  <img
                    src={selectedCard.image}
                    alt={selectedCard.title}
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="card-body p-8">
                  <h2 className="text-3xl font-light text-base-content tracking-wide mb-2">
                    {selectedCard.title}
                  </h2>
                  <p className="text-2xl text-primary font-light mb-6">
                    {selectedCard.price}
                  </p>
                  <div className="w-12 h-px bg-primary/30 mb-6"></div>
                  <p className="text-lg text-base-content/80 leading-relaxed mb-8">
                    {selectedCard.description}
                  </p>
                  <div className="card-actions justify-between items-center mt-8">
                    <button
                      className="btn btn-ghost font-light tracking-wide"
                      onClick={() => setSelectedCard(null)}
                    >
                      CERRAR
                    </button>
                    <button className="btn btn-primary btn-lg font-light tracking-wide px-8">
                      AGREGAR AL CARRITO
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
