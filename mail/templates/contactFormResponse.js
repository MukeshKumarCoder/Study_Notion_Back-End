exports.contactUsEmail = (
  email,
  firstName,
  lastName,
  message,
  phoneNo,
  countryCode
) => {
  return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Contact Form Confirmation</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.5;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: left;
            }
            .logo {
                max-width: 150px;
                margin-bottom: 20px;
            }
            .message {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
            .highlight {
                font-weight: bold;
            }
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="https://studynotion-edtech-project.vercel.app">
                <img class="logo" src="https://i.ibb.co/7Xyj3PC/logo.png" alt="StudyNotion Logo">
            </a>
            <div class="message">Thank you for contacting us!</div>
            <div class="body">
                <p>Dear <span class="highlight">${firstName || "User"} ${
    lastName || ""
  }</span>,</p>
                <p>We have received your message and will respond to you as soon as possible.</p>
                <p><strong>Here are the details you provided:</strong></p>
                <ul>
                    <li><strong>Name:</strong> ${firstName || ""} ${
    lastName || ""
  }</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone Number:</strong> +${countryCode || ""} ${
    phoneNo || ""
  }</li>
                    <li><strong>Message:</strong> ${
                      message || "No message provided"
                    }</li>
                </ul>
                <p>We appreciate your interest and will get back to you shortly.</p>
            </div>
            <div class="support">
                If you have any further questions or need immediate assistance, please contact us at 
                <a href="mailto:info@studynotion.com">info@studynotion.com</a>.
            </div>
        </div>
    </body>
    </html>`;
};
