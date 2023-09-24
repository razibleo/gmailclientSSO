import MailComposer from "nodemailer/lib/mail-composer/index.js";
import { MailOptions } from "../models/typehelpers.js";
import { google } from "googleapis";
import { oAuth2Client } from "../config/googleOAuth.js";

async function createMail(options: MailOptions) {
  const mailComposer = new MailComposer(options);
  const message = await mailComposer.compile().build();
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendEmail({ mailOptions }: { mailOptions: MailOptions }) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  const rawMessage = await createMail(mailOptions);
  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: rawMessage },
  });
}
export default { sendEmail };
