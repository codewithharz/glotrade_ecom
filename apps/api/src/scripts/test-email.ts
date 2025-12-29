import "dotenv/config";
import EmailService from "../services/EmailService";

async function testEmail() {
    const recipient = process.argv[2];
    if (!recipient) {
        console.error("Please provide a recipient email address: npx ts-node -r dotenv/config src/scripts/test-email.ts user@example.com");
        process.exit(1);
    }

    console.log(`Testing EmailService with provider: ${process.env.EMAIL_PROVIDER || 'smtp (default)'}`);
    console.log(`Sending test email to: ${recipient}...`);

    try {
        await EmailService.sendEmail({
            to: recipient,
            subject: "Glotrade Email Test",
            text: "This is a test email from the Glotrade EmailService.",
            html: "<h1>Glotrade Email Test</h1><p>This is a test email from the <strong>Glotrade EmailService</strong>.</p>",
        });
        console.log("✅ Email sent successfully!");
    } catch (error) {
        console.error("❌ Failed to send email:", error);
    }
}

testEmail().catch(console.error);

// run ses test email in terminal ( your-email@example.com use recipient email codewithhars@gmail.com ) this is verified email from aws ses
// cd apps/api && npx ts-node -r dotenv/config src/scripts/test-email.ts your-email@example.com