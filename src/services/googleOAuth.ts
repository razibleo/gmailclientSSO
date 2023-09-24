import {
  GMAIL_SCOPES,
  accessTokenFile,
  oAuth2Client,
} from "../config/googleOAuth.js";
import open from "open";
import AccessToken from "../models/accesstoken.js";
import fs from "fs";

async function getAuthCode() {
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
  await oAuth2Client.getTokenInfo(token.access_token);
  oAuth2Client.setCredentials(token);
}

async function getTokenFromAuthCodeAndStore(code: string) {
  const token = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(token.tokens);
  fs.writeFileSync(accessTokenFile, JSON.stringify(token.tokens));
}
export default {
  getAuthCode,
  getStoredAuthToken,
  verifyTokenAndSetCredentials,
  getTokenFromAuthCodeAndStore,
};
