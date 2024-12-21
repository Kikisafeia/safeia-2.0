import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ArrowRight, FileText, Globe, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import AnimatedText from './AnimatedText';
import CommunitySection from './CommunitySection';

const testimonials = [
  {
    quote: "SAFEIA ha sido una herramienta increíble para nuestra empresa. Nos ha permitido crear documentos de prevención de riesgos laborales personalizados en cuestión de minutos, ahorrando tiempo y recursos. Además, nos ha ayudado a garantizar el cumplimiento de nuestras políticas de seguridad.",
    author: "Rodrigo Norambuena",
    position: "APR Construccion",
    rating: 4
  },
  {
    quote: "Como pequeña empresa, no teníamos mucho tiempo ni recursos para dedicar a la creación de documentos de prevención de riesgos laborales. SAFEIA nos ha ayudado a hacer este proceso mucho más eficiente y efectivo.",
    author: "Gerente Producción",
    position: "",
    rating: 4
  },
  {
    quote: "Como auditor líder de seguridad en ISO 45001, siempre estoy buscando herramientas que puedan ayudar a mis clientes a mejorar sus sistemas de gestión de seguridad y salud en el trabajo.",
    author: "Auditor Lider ISO",
    position: "",
    rating: 4
  }
];

const services = [
  {
    icon: FileText,
    title: "Creación de Documentos",
    description: "SAFEIA utiliza inteligencia artificial para hacer que la creación de documentos de prevención de riesgos sea más rápida y precisa que nunca."
  },
  {
    icon: Globe,
    title: "Acceso basado en la nube",
    description: "Accede desde cualquier lugar y en cualquier momento. Una vez que hayas iniciado sesión, la herramienta te guiará a través de un sencillo proceso."
  },
  {
    icon: Users,
    title: "Asistentes Especializados",
    description: "Asistentes virtuales diseñados para agilizar tus procesos de prevención de riesgos, brindándote respuestas precisas y soluciones eficientes."
  }
];

const Hero = () => {
  const navigate = useNavigate();
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  return (
    <div className="relative overflow-hidden bg-safeia-bg">
      {/* Fondo con patrón de puntos */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Contenido principal */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-safeia-black">
              Innovación y Seguridad:
              <br />
              <span className="block mt-2">
                La pareja perfecta con{' '}
                <span className="text-safeia-yellow">SAFEIA</span>
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-safeia-gray"
          >
            Inteligencia Artificial para una Gestión Segura y Eficiente. Transforma tu flujo
            de trabajo de evaluación de riesgos con tecnología de IA de vanguardia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex justify-center gap-4"
          >
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-safeia-yellow hover:bg-safeia-yellow-dark transition-colors duration-200"
            >
              Comienza tu Prueba Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-safeia-black sm:text-4xl">
              Nuestros Servicios
            </h2>
            <p className="mt-4 text-lg text-safeia-gray">
              Descubre cómo SAFEIA puede ayudarte a mejorar la seguridad en tu empresa
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="relative rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-safeia-yellow mb-4">
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-safeia-black">{service.title}</h3>
                <p className="mt-4 text-base text-safeia-gray">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-safeia-black sm:text-4xl">
              Lo que dicen nuestros clientes
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-lg text-safeia-gray">{testimonial.quote}</p>
                <div className="mt-6">
                  <h3 className="font-semibold text-safeia-black">{testimonial.author}</h3>
                  {testimonial.position && (
                    <p className="text-sm text-safeia-gray">{testimonial.position}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <CommunitySection />
    </div>
  );
};

export default Hero;