import { google } from "googleapis";
import credentials from "../../client_secret.json" assert { type: "json" };
import path from "path";

const { client_secret, client_id } = credentials.installed;

export const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  "http://localhost:3000"
);
export const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
export const accessTokenFile = path.join("token.json");
