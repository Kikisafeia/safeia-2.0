import React from 'react';

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>
        
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          <section>
            <p className="text-gray-600 mb-6">
              En safeia.online, entendemos la importancia de su privacidad y nos comprometemos a proteger sus datos personales. 
              Por favor, lea esta política de privacidad cuidadosamente para comprender cómo manejamos su información personal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Recopilada</h2>
            <p className="text-gray-600 mb-4">
              Recopilamos información personal de diferentes maneras, incluyendo cuando se registra en nuestro sitio web, 
              utiliza nuestros servicios y se comunica con nosotros. La información que podemos recopilar incluye:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600">
              <li>Su nombre</li>
              <li>Dirección de correo electrónico</li>
              <li>País de origen</li>
              <li>Otra información relevante</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Además, utilizamos cookies y tecnologías similares para recopilar información sobre su uso de nuestro sitio web 
              y servicios. Esta información puede incluir:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600">
              <li>La dirección IP de su dispositivo</li>
              <li>El tipo de dispositivo que está utilizando</li>
              <li>Su navegador web</li>
              <li>Su ubicación geográfica</li>
              <li>Otra información de análisis web</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Uso de Información</h2>
            <p className="text-gray-600 mb-4">
              Utilizamos la información personal que recopilamos para:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600">
              <li>Proporcionarle nuestros servicios</li>
              <li>Mejorar la calidad de nuestro sitio web y servicios</li>
              <li>Responder a sus preguntas</li>
              <li>Comunicarnos con usted sobre su cuenta</li>
            </ul>
            <p className="text-gray-600 mt-4">
              También podemos utilizar su información personal para fines de marketing, incluyendo el envío de correos 
              electrónicos promocionales y boletines informativos. Si no desea recibir comunicaciones de marketing de 
              nuestra parte, puede optar por no recibirlas en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Divulgación de Información</h2>
            <p className="text-gray-600">
              No vendemos ni compartimos su información personal con terceros, excepto cuando sea necesario para proporcionar 
              nuestros servicios o cumplir con las leyes y regulaciones aplicables. También podemos compartir su información 
              personal con nuestros proveedores de servicios externos para ayudarnos a proporcionar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Seguridad de la Información</h2>
            <p className="text-gray-600">
              Nos esforzamos por mantener su información personal segura y utilizamos medidas de seguridad razonables para 
              protegerla contra el acceso no autorizado, el uso, la modificación y la divulgación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cambios a esta Política</h2>
            <p className="text-gray-600">
              Podemos actualizar esta política de privacidad en cualquier momento. Le recomendamos que revise esta política 
              de privacidad periódicamente para estar al tanto de cualquier cambio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preguntas y Comentarios</h2>
            <p className="text-gray-600">
              Si tiene alguna pregunta o comentario sobre esta política de privacidad, puede ponerse en contacto con nosotros 
              a través de nuestro sitio web o enviando un correo electrónico a nuestro equipo de atención al cliente.
            </p>
          </section>

          <section className="mt-8">
            <p className="text-gray-600 text-center italic">
              Gracias por confiar en safeia.online
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
