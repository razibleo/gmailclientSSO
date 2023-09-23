import credentials from "../client_secret.json" assert { type: "json" };
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import open from "open";
import express from "express";
const app = express();
const port = 3000;
const authCodeFile = "./authcode.txt";
const { client_secret, client_id } = credentials.installed;

async function main() {
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost:3000"
  );

  const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
  });
  await open(url);

  //   const authCode =
  //     "4/0Adeu5BVU84vXk_iJkdH8xsfWQZ-junmkJ5tZCykZL7sxT98uoL9wY3aCsf6-AWpputYw8A";

  //   const token = await oAuth2Client.getToken(authCode);
  //   const tokenPath = path.join("token.json");
  //   fs.writeFileSync(tokenPath, JSON.stringify(token.tokens));
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

function getStoredAuthToken(): string | undefined {
  if (fs.existsSync(authCodeFile)) {
    const authCode = fs.readFileSync("./authcode.txt", "utf-8");
    return authCode;
  } else {
    fs.writeFileSync(authCodeFile, "");
  }
}

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  const authToken = getStoredAuthToken();
  if (authToken) {
    console.log("authToken", authToken);
  } else {
    console.log("No auth token found");
    main();
  }
});
