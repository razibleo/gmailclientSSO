import credentials from "../client_secret.json" assert { type: "json" };
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import open from "open";
import express from "express";
import MailComposer from "nodemailer/lib/mail-composer/index.js";
const app = express();
const port = 3000;
const accessTokenFile = "token.json";
const { client_secret, client_id } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  "http://localhost:3000"
);
const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
interface AccessToken {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}
type MailOptions = ConstructorParameters<typeof MailComposer>[0];

async function getAuthCode() {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
  });
  await open(url);
}

app.get("/", async (req, res) => {
  const code = req.query.code;
  try {
    if (!code) throw Error("No Code Found!");
    const token = await oAuth2Client.getToken(code.toString());

    const tokenPath = path.join(accessTokenFile);
    fs.writeFileSync(tokenPath, JSON.stringify(token.tokens));
    oAuth2Client.setCredentials(token.tokens);
    writeEmail();
    return res.send("Code was received");
  } catch (e) {
    return res.send("No code was received");
  }
});

function getStoredAuthToken(): AccessToken | undefined {
  if (!fs.existsSync(accessTokenFile)) return;
  let rawdata = fs.readFileSync(accessTokenFile).toString();
  const storedAccessToken = JSON.parse(rawdata);
  return storedAccessToken;
}

const createMail = async (options: MailOptions) => {
  const mailComposer = new MailComposer(options);
  const message = await mailComposer.compile().build();
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};
async function writeEmail() {
  console.log("writeEmail");
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  const rawMessage = await createMail({
    to: "razibsarkerleo@gmail.com",
    subject: "Hello Amit 🚀",
    text: "This email is sent from the command line",
    html: `<p>🙋🏻‍♀️  &mdash; This is a <b>test email</b> from <a href="https://digitalinspiration.com">Digital Inspiration</a>.</p>`,
    // attachments: fileAttachments,
    textEncoding: "base64",
    headers: [
      { key: "X-Application-Developer", value: "Amit Agarwal" },
      { key: "X-Application-Version", value: "v1.0.0.2" },
    ],
  });
  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: rawMessage },
  });
}

async function main(): Promise<void> {
  const authToken = getStoredAuthToken();
  if (!authToken) return getAuthCode();

  try {
    const result = await oAuth2Client.getTokenInfo(authToken.access_token);
    oAuth2Client.setCredentials(authToken);

    writeEmail();
  } catch (e) {
    console.log("Error getting token info");
    console.log(e);
    return getAuthCode();
  }

  return;
}

app.listen(port, async () => {
  console.log(`App listening on port ${port}`);
  main();
});
