import { Resend } from "resend";
import { createLogger } from "@/lib/logger";

const log = createLogger("email");

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  react,
  from = "AqarVision <noreply@aqarvision.com>",
}: SendEmailParams) {
  try {
    const { data, error } = await getResend().emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
    });

    if (error) {
      log.error({ error, to, subject }, "Failed to send email");
      throw new Error(`Email error: ${error.message}`);
    }

    log.info({ id: data?.id, to, subject }, "Email sent");
    return data;
  } catch (err) {
    log.error({ err, to, subject }, "Email send exception");
    throw err;
  }
}
