import Email from "@/components/main/pages/email";
import { smtpEmail, transporter } from "@/lib/nodemailer";
import { contactFormSchema } from "@/lib/validation/contact";
import { render } from "@react-email/components";
import { NextRequest } from "next/server";
import * as z from "zod";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_EMAIL?.trim() || !process.env.GOOGLE_PASSWORD?.trim()) {
      console.error("[Contact API] Missing GOOGLE_EMAIL or GOOGLE_PASSWORD in env");
      return new Response(
        JSON.stringify({ success: false, error: "Email is not configured" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = contactFormSchema.parse(body);
    const { name, email, message } = validatedData;

    const emailHtml = await render(
      <Email name={name} email={email} message={message} />,
    );

    const options = {
      from: smtpEmail,
      to: smtpEmail,
      subject: "New Form Submission",
      html: emailHtml,
    };

    await transporter.sendMail(options);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const isAuthError =
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "EAUTH";

    if (isAuthError) {
      console.error(
        "[Contact API] Gmail auth failed. Use App Password if 2FA is on: https://support.google.com/accounts/answer/185833"
      );
    } else {
      console.error("[Contact API Error]", error);
    }

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: isAuthError
          ? "Email configuration error. Please try again later."
          : "Failed to send message",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
