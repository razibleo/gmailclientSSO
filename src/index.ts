import express from "express";
import { MailOptions } from "./models/typehelpers.js";
import GmailService from "./services/gmail.js";
import GoogleOAuthSevice from "./services/googleOAuth.js";
const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  const code = req.query.code;
  try {
    if (!code) throw Error("No Code Found!");
    await GoogleOAuthSevice.getTokenFromAuthCodeAndStore(code.toString());
    writeEmail();
    return res.send("Code was received");
  } catch (e) {
    return res.send("No code was received");
  }
});

async function writeEmail() {
  console.log("writeEmail");
  const myEmail: MailOptions = {
    to: "razibsarkerleo@gmail.com",
    subject: "Hello Amit 🚀",
    text: "This email is sent from the command line",
    html: `<p>🙋🏻‍♀️  &mdash; This is a <b>test email</b> from <a href="https://digitalinspiration.com">Digital Inspiration</a>.</p>`,
    // attachments: fileAttachments,
    textEncoding: "base64",
    headers: [
      { key: "X-Application-Developer", value: "Razib Sarker" },
      { key: "X-Application-Version", value: "v1.0.0" },
    ],
  };
  const result = await GmailService.sendEmail({
    mailOptions: myEmail,
  });
}

async function main(): Promise<void> {
  const authToken = GoogleOAuthSevice.getStoredAuthToken();
  if (!authToken) return GoogleOAuthSevice.getAuthCode();

  try {
    await GoogleOAuthSevice.verifyTokenAndSetCredentials(authToken);
    writeEmail();
  } catch (e) {
    console.log("Error getting token info");
    console.log(e);
    return GoogleOAuthSevice.getAuthCode();
  }

  return;
}

app.listen(port, async () => {
  console.log(`App listening on port ${port}`);
  main();
});
