
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.log("No RESEND_API_KEY found. Mocking email send.");
        console.log(`To: ${to}, Subject: ${subject}, Content: ${html}`);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'MAFS <onboarding@resend.dev>', // Update this with your verified domain in production
            to,
            subject,
            html,
        });

        if (error) {
            console.error('Error sending email:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
