exports.paymentSuccessEmail = (name, amount, orderId, paymentId) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Confirmation</title>
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
      padding: 24px;
      text-align: center;
    }
    .logo {
      max-width: 200px;
      margin-bottom: 20px;
    }
    .message {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #111;
    }
    .body-content {
      font-size: 16px;
      margin-bottom: 24px;
      text-align: left;
    }
    .cta {
      display: inline-block;
      padding: 10px 20px;
      background-color: #FFD60A;
      color: #000000;
      text-decoration: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
      margin-top: 20px;
    }
    .support {
      font-size: 14px;
      color: #777777;
      margin-top: 30px;
    }
    .highlight {
      font-weight: bold;
      color: #000;
    }
    a {
      color: #1a73e8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="https://studynotion-edtech-project.vercel.app">
      <img class="logo" src="https://i.ibb.co/7Xyj3PC/logo.png" alt="StudyNotion Logo" />
    </a>
    <div class="message">Course Payment Confirmation</div>
    <div class="body-content">
      <p>Dear ${name},</p>
      <p>We have received your payment of <span class="highlight">₹${amount}</span>.</p>
      <p><strong>Payment ID:</strong> ${paymentId}</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
    </div>
    <div class="support">
      If you have any questions or need assistance, please reach out to us at
      <a href="mailto:info@studynotion.com">info@studynotion.com</a>.
    </div>
  </div>
</body>
</html>`;
};
