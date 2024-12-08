import React from 'react';

export default function Terminos() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos y Condiciones</h1>
        
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          <section>
            <p className="text-gray-600">
              Bienvenido a safeia.online. Al utilizar nuestros servicios, usted acepta estar sujeto a los siguientes términos y condiciones. 
              Lea atentamente los siguientes términos antes de utilizar nuestros servicios.
            </p>
          </section>

          <section>
            <p className="text-gray-600">
              Safeia.online es un generador de texto por IA que le permite crear contenido de manera rápida y eficiente. 
              No garantizamos la exactitud o la calidad del contenido generado por nuestra plataforma, y no nos hacemos 
              responsables de cualquier daño o pérdida que pueda resultar del uso de nuestro servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Uso del servicio</h2>
            <p className="text-gray-600">
              Usted se compromete a utilizar nuestros servicios de manera responsable y legal. No utilizará nuestro 
              servicio para fines ilegales o inapropiados, incluyendo la creación de contenido que viole los derechos 
              de autor, la difamación, el acoso o la incitación a la violencia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Propiedad intelectual</h2>
            <p className="text-gray-600">
              Todo el contenido generado por safeia.online es propiedad de sus respectivos propietarios y está protegido 
              por derechos de autor y otras leyes de propiedad intelectual. No está permitido utilizar nuestro servicio 
              para crear contenido que infrinja los derechos de autor de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tarifas y pagos</h2>
            <p className="text-gray-600">
              El uso de safeia.online es gratuito, pero nos reservamos el derecho de cambiar nuestras tarifas y precios 
              en cualquier momento. Si ofrecemos servicios pagados, nos comprometemos a proporcionar información clara y 
              precisa sobre los precios y los términos de pago.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitación de responsabilidad</h2>
            <p className="text-gray-600">
              En ningún caso safeia.online será responsable de cualquier daño directo, indirecto, incidental, especial 
              o consecuente que resulte del uso de nuestros servicios o de la imposibilidad de utilizarlos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Modificaciones de los términos y condiciones</h2>
            <p className="text-gray-600">
              Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento y sin previo aviso. 
              Es su responsabilidad revisar periódicamente estos términos y condiciones para conocer cualquier cambio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ley aplicable y jurisdicción</h2>
            <p className="text-gray-600">
              Estos términos y condiciones se regirán e interpretarán de acuerdo con las leyes del país donde se encuentra 
              safeia.online. Cualquier controversia o reclamo relacionado con estos términos y condiciones se resolverá 
              exclusivamente en los tribunales competentes de ese país.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contacto</h2>
            <p className="text-gray-600">
              Si tiene alguna pregunta o comentario sobre estos términos y condiciones, no dude en ponerse en contacto con 
              nosotros a través de nuestro sitio web o enviando un correo electrónico a nuestro equipo de atención al cliente.
            </p>
          </section>

          <section>
            <p className="text-gray-600 text-center font-medium">
              Gracias por utilizar safeia.online
            </p>
          </section>
        </div>

        <p className="text-sm text-gray-500 mt-8 text-center">
          Última actualización: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
