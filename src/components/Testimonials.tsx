import React from 'react';
import { Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "SAFEIA transformó completamente nuestro flujo de trabajo de gestión de riesgos. Los insights impulsados por IA son invaluables.",
      author: "Sara Jiménez",
      role: "Gerente de Riesgos",
      company: "Tech Solutions España",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150"
    },
    {
      quote: "La facilidad de uso y las potentes características han hecho que nuestro proceso de cumplimiento sea mucho más eficiente.",
      author: "Miguel Castro",
      role: "Oficial de Cumplimiento",
      company: "Global Finance Corp",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150"
    }
  ];

  return (
    <section className="py-20 bg-safeia-yellow/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-safeia-black mb-4">Lo que Dicen Nuestros Usuarios</h2>
          <p className="text-xl text-gray-600">Únete a miles de profesionales satisfechos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition group">
              <Quote className="h-8 w-8 text-safeia-black group-hover:text-safeia-yellow transition-colors mb-4" />
              <p className="text-gray-700 mb-6">{testimonial.quote}</p>
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-safeia-black">{testimonial.author}</h4>
                  <p className="text-gray-600">{testimonial.role}</p>
                  <p className="text-gray-500 text-sm">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}