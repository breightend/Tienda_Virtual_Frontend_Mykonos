import { motion } from "motion/react";
import { useState } from "react";
import emailjs from '@emailjs/browser';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    try {
      // Send email using EmailJS
      // TODO: Configure EmailJS credentials in .env
      // For now, this will use the credentials from Register.jsx if configured
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: 'mykonosboutique733@gmail.com',
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone || 'No proporcionado',
          message: formData.message,
          reply_to: formData.email
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      
      setSending(false);
      setSent(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: "", email: "", phone: "", message: "" });
        setSent(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setSending(false);
      alert('Error al enviar el mensaje. Por favor, intenta contactarnos por WhatsApp.');
    }
  };

  const contactZones = [
    {
      id: 1,
      title: "TIENDA PARANÁ",
      whatsapp: "+54 9 343 509 1341",
      instagram: "@mykonosboutiqueparana",
      instagramUrl: "https://instagram.com/mykonosboutiqueparana",
      address: "Peatonal San Martin 695, Paraná",
      hours: "Lun - Sáb: 8:30-12:30 y 16:30-20:30"
    },
    {
      id: 2,
      title: "TIENDA CONCORDIA",
      whatsapp: "+54 9 345 520 1623",
      instagram: "@mykonosconcordia",
      instagramUrl: "https://instagram.com/mykonosconcordia",
      address: "A del Valle 26, Concordia",
      hours: "Lun - Dom: 8:30-12:30 y 16:30-20:30"
    }
  ];

  return (
    <div className="bg-base-100 min-h-screen py-16 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-light tracking-widest mb-4 text-base-content">
            CONTACTO
          </h1>
          <div className="w-16 h-px bg-primary mx-auto mb-6"></div>
          <p className="text-base-content/70 text-lg font-light max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Visítanos en nuestras tiendas o contáctanos por los medios que prefieras.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Contact Zones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {contactZones.map((zone, index) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="card bg-base-200 shadow-xl"
            >
              <div className="card-body p-8">
                <h2 className="text-2xl font-light tracking-widest text-primary mb-6">
                  {zone.title}
                </h2>

                {/* Address */}
                <div className="flex items-start gap-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-light text-base-content">{zone.address}</p>
                    <p className="text-sm text-base-content/60 font-light mt-1">{zone.hours}</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center gap-4 mb-4">
                  <svg className="h-6 w-6 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <a 
                    href={`https://wa.me/${zone.whatsapp.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-light text-base-content hover:text-primary transition-colors"
                  >
                    {zone.whatsapp}
                  </a>
                </div>

                {/* Instagram */}
                <div className="flex items-center gap-4 mb-6">
                  <svg className="h-6 w-6 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <a 
                    href={zone.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-light text-base-content hover:text-primary transition-colors"
                  >
                    {zone.instagram}
                  </a>
                </div>

                {/* Action Button */}
                <a
                  href={`https://wa.me/${zone.whatsapp.replace(/\s/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-block font-light tracking-wide"
                >
                  CONTACTAR POR WHATSAPP
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl mb-16"
        >
          <div className="card-body p-8 text-center">
            <h3 className="text-2xl font-light tracking-widest text-base-content mb-6">
              SÍGUENOS EN FACEBOOK
            </h3>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=100063723841544"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-circle btn-lg bg-[#1877F2] hover:bg-[#1877F2]/80 border-none"
              >
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
            <p className="text-base-content/60 font-light mt-4">
              @Mykonos Paraná - Concordia
            </p>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card bg-base-200 shadow-xl max-w-3xl mx-auto"
        >
          <div className="card-body p-8">
            <h2 className="text-3xl font-light tracking-widest text-center text-base-content mb-2">
              ENVÍANOS UN MENSAJE
            </h2>
            <div className="w-16 h-px bg-primary mx-auto mb-8"></div>

            {sent ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="alert alert-success"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-light">¡Mensaje enviado exitosamente! Te responderemos pronto.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-light tracking-wide">NOMBRE</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      className="input input-bordered font-light"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-light tracking-wide">EMAIL</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      className="input input-bordered font-light"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-light tracking-wide">TELÉFONO (OPCIONAL)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+54 9 11 1234-5678"
                    className="input input-bordered font-light"
                  />
                </div>

                {/* Message */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-light tracking-wide">MENSAJE</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Escribe tu mensaje aquí..."
                    className="textarea textarea-bordered h-32 font-light"
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block font-light tracking-wide"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      ENVIANDO...
                    </>
                  ) : (
                    "ENVIAR MENSAJE"
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Map Section (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-base-content/60 font-light text-sm">
            © 2025 Mykonos. Todos los derechos reservados.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
