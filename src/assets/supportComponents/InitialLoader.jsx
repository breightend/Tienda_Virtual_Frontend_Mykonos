import { motion } from "motion/react";

export default function InitialLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-base-100 via-base-200 to-base-300"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo fijo */}
        <div className="text-6xl font-bold tracking-widest">
          <span className="text-primary">MYKONOS</span>
        </div>

        {/* Spinner */}
        <div className="relative w-24 h-24">
          <motion.div
            className="absolute inset-0 border-4 border-primary/30 rounded-full"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Texto de carga */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-base-content/60 text-lg font-light tracking-wide"
        >
          Cargando tienda...
        </motion.p>
      </div>
    </motion.div>
  );
}
