import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Cloud, Lock } from 'lucide-react';
import AnimatedText from './AnimatedText';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  const handleStartTrial = () => {
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-safeia-yellow/10 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" aria-hidden="true"></div>
      
      {/* Animated background elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-safeia-yellow rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
        <div className="text-center relative z-10">
          <AnimatedText
            text={["Innovación y Seguridad:", "La pareja perfecta con SAFEIA"]}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-safeia-black mb-6 leading-tight tracking-wide"
            delay={0.5}
          />
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            Inteligencia Artificial para una Gestión Segura y Eficiente. Transforma tu flujo de trabajo de evaluación de riesgos con tecnología de IA de vanguardia.
          </motion.p>

          <motion.button 
            onClick={handleStartTrial}
            className="bg-safeia-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-lg font-semibold hover:bg-safeia-yellow hover:text-safeia-black transition duration-300 group focus:outline-none focus:ring-2 focus:ring-safeia-yellow relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <span className="relative z-10">
              Comienza tu Prueba Gratuita
              <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition" aria-hidden="true" />
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-safeia-yellow/0 via-safeia-yellow/30 to-safeia-yellow/0"
              animate={{
                x: ['100%', '-100%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'linear',
              }}
            />
          </motion.button>
        </div>

        <motion.div 
          className="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          {[
            {
              Icon: Shield,
              title: "Seguridad Avanzada",
              description: "Seguridad empresarial con detección de amenazas impulsada por IA."
            },
            {
              Icon: Cloud,
              title: "Acceso en la Nube",
              description: "Accede a tus herramientas de prevención desde cualquier lugar."
            },
            {
              Icon: Lock,
              title: "Cumplimiento Normativo",
              description: "Mantén el cumplimiento con las regulaciones del sector."
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg hover:shadow-xl transition group focus-within:ring-2 focus-within:ring-safeia-yellow"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 + index * 0.2 }}
            >
              <feature.Icon 
                className="h-12 w-12 text-safeia-black group-hover:text-safeia-yellow transition-colors mb-4" 
                aria-hidden="true"
              />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}