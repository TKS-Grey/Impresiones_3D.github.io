const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // o SMTP de tu servidor
  auth: {
    user: 'tuemail@gmail.com',
    pass: 'tu_contraseña_o_token'
  }
});

function enviarCorreoBienvenida(destinatario) {
  const mailOptions = {
    from: 'tuemail@gmail.com',
    to: destinatario,
    subject: 'Bienvenido a nuestra página',
    text: 'Gracias por registrarte. ¡Disfruta de nuestros servicios!'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error al enviar correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
}
