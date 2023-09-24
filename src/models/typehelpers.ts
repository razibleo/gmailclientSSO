import MailComposer from "nodemailer/lib/mail-composer/index.js";

type MailOptions = ConstructorParameters<typeof MailComposer>[0];
export { MailOptions };
