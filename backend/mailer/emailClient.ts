import { transporter } from './nodemailer.config';
import { mailtrapClient, sender } from './mailtrap.config';

const isProd = process.env.NODE_ENV === 'production';

export const emailClient = {
  send: async (options: any) => {
    if (isProd) {
      return mailtrapClient.send({
        from: sender,
        to: options.to.map((to: any) => ({ email: to.address || to.email })),
        subject: options.subject,
        html: options.html,
      });
    } else {
      return transporter.sendMail(options);
    }
  },
};
