import express from "express";
import { MailOptions } from "./models/typehelpers.js";
import GmailService from "./services/gmail.js";
import GoogleOAuthSevice from "./services/googleOAuth.js";
import receipients from "./data/receipients.js";
const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  const code = req.query.code;
  try {
    if (!code) throw Error("No Code Found!");
    await GoogleOAuthSevice.getTokenFromAuthCodeAndStore(code.toString());
    await writeEmail();
    return res.send("Code was received");
  } catch (e) {
    return res.send("No code was received");
  }
});

async function writeEmail() {
  console.log("Sending Emails in progress...");

  for (let recepient of receipients.careerOpportunitesReceipients) {
    try {
      const myEmail: MailOptions = {
        to: recepient.email,
        subject: "Full Stack Developer interested in UAE career opportunities",
        html: `
            <p>
            Hi ${recepient.name},  
            </p>
      
            <p>
            I hope you're well. I came across your profile on LinkedIn and am currently exploring potential opportunities in the UAE. With over 3 years of expeirence as a Full Stack Engineer, I've worked on a variety of web and mobile projects, utilizing various cloud services from AWS, GCP, etc. in addition to some CI/CD.
            </p>
      
            <p>
            My portfolio at www.razibdev.com showcases my work, emphasizing my adaptability and commitment to excellence. I have also attached my resume in case you would like to get a detailed view of my current and past experiences and responsibilities. Thank you for your time, and possibly would like to connect. 
            </p>
      
            <div>Best regards,</div>
            <div>Razib Sarker</div>`,
        attachments: [
          {
            filename: "resume.pdf",
            path: recepient.resumePath,
          },
        ],
        textEncoding: "base64",
        headers: [
          { key: "X-Application-Developer", value: "Razib Sarker" },
          { key: "X-Application-Version", value: "v1.0.0" },
        ],
      };
      const result = await GmailService.sendEmail({
        mailOptions: myEmail,
      });
      console.log("Email successfully sent to " + recepient.email);
    } catch (e) {
      console.log("Error sending email to " + recepient.email);
    }
  }
}

async function main(): Promise<void> {
  const authToken = GoogleOAuthSevice.getStoredAuthToken();
  if (!authToken) return GoogleOAuthSevice.authenticate();

  try {
    await GoogleOAuthSevice.verifyTokenAndSetCredentials(authToken);

    await writeEmail();
  } catch (e) {
    console.log("Error getting token info");
    console.log(e);
    return GoogleOAuthSevice.authenticate();
  }

  return;
}

app.listen(port, async () => {
  console.log(`App listening on port ${port}`);
  main();
});
