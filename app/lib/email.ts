
import { Resend } from 'resend';
import { OFFLINE } from '@/lib/shutdown';

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
    // No outbound mail while MAFS is shut down. Retention/marketing sends to a
    // dormant product are worse than useless, and this also stops Resend volume
    // from creeping past the free tier. See lib/shutdown.ts.
    if (OFFLINE) {
        console.log(`[shutdown] MAFS is offline — suppressed email to ${to} ("${subject}").`);
        return;
    }

    if (!process.env.RESEND_API_KEY) {
        console.log("No RESEND_API_KEY found. Mocking email send.");
        console.log(`To: ${to}, Subject: ${subject}, Content: ${html}`);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'MAFS <mafs@contact.mafs.ai>', // Update this with your verified domain in production
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
