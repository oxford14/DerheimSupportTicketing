import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM ?? "Derheim Support <onboarding@resend.dev>";

export async function sendTicketCreated(
  to: string,
  ticket: { id: string; title: string }
): Promise<void> {
  if (!resend) {
    console.log("[Resend] Skipped sendTicketCreated (no RESEND_API_KEY)");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: [to],
      subject: `Ticket submitted: ${ticket.title}`,
      html: `<p>Your support ticket has been submitted.</p><p><strong>${ticket.title}</strong></p><p>Ticket ID: ${ticket.id}</p>`,
    });
  } catch (e) {
    console.error("[Resend] sendTicketCreated failed:", e);
  }
}

export async function sendTicketAssigned(
  to: string,
  ticket: { id: string; title: string }
): Promise<void> {
  if (!resend) {
    console.log("[Resend] Skipped sendTicketAssigned (no RESEND_API_KEY)");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: [to],
      subject: `Ticket assigned to you: ${ticket.title}`,
      html: `<p>A support ticket has been assigned to you.</p><p><strong>${ticket.title}</strong></p><p>Ticket ID: ${ticket.id}</p>`,
    });
  } catch (e) {
    console.error("[Resend] sendTicketAssigned failed:", e);
  }
}
