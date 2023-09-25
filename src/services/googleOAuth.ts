import {
  GMAIL_SCOPES,
  accessTokenFile,
  oAuth2Client,
} from "../config/googleOAuth.js";
import open from "open";
import AccessToken from "../models/accesstoken.js";
import fs from "fs";
import { google } from "googleapis";

async function authenticate() {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
  });
  await open(url);
}
function getStoredAuthToken(): AccessToken | undefined {
  if (!fs.existsSync(accessTokenFile)) return;
  let rawdata = fs.readFileSync(accessTokenFile).toString();
  const storedAccessToken = JSON.parse(rawdata);
  return storedAccessToken;
}
async function verifyTokenAndSetCredentials(token: AccessToken) {
  //better to do this the the catch block in the controller itself
  oAuth2Client.setCredentials(token);

  await oAuth2Client.refreshAccessToken();
}

async function getTokenFromAuthCodeAndStore(code: string) {
  const token = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(token.tokens);
  fs.writeFileSync(accessTokenFile, JSON.stringify(token.tokens));
}
export default {
  authenticate,
  getStoredAuthToken,
  verifyTokenAndSetCredentials,
  getTokenFromAuthCodeAndStore,
};
