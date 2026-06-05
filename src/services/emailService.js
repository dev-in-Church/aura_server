const transporter = require("../config/email");

const sendQuoteNotificationToAdmin = async (quote) => {
  const mailOptions = {
    from: `"AURA EXPRESS Website" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Quote Request - ${quote.full_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #55b8f7; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Quote Request</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333; border-bottom: 2px solid #55b8f7; padding-bottom: 10px;">Contact Details</h2>
          <p><strong>Name:</strong> ${quote.full_name}</p>
          <p><strong>Email:</strong> ${quote.email}</p>
          <p><strong>Phone:</strong> ${quote.phone || "Not provided"}</p>
          <p><strong>Company:</strong> ${quote.company || "Not provided"}</p>
          
          <h2 style="color: #333; border-bottom: 2px solid #55b8f7; padding-bottom: 10px;">Cargo Details</h2>
          <p><strong>Origin Country:</strong> ${quote.origin_country}</p>
          <p><strong>Cargo Type:</strong> ${quote.cargo_type}</p>
          <p><strong>Transport Mode:</strong> ${quote.transport_mode}</p>
          <p><strong>Quantity:</strong> ${quote.cargo_quantity || "Not specified"}</p>
          <p><strong>Dimensions (L x W x H):</strong> ${quote.cargo_dimensions || "Not specified"}</p>
          <p><strong>Weight:</strong> ${quote.cargo_weight ? quote.cargo_weight + " tonnes" : "Not specified"}</p>
          
          <h2 style="color: #333; border-bottom: 2px solid #55b8f7; padding-bottom: 10px;">Route Details</h2>
          <p><strong>Route:</strong> ${quote.route || "Not specified"}</p>
          <p><strong>Route Details:</strong> ${quote.route_details || "Not provided"}</p>
          <p><strong>Delivery Country:</strong> ${quote.delivery_country || "Not specified"}</p>
          <p><strong>Final Destination:</strong> ${quote.final_destination || "Not specified"}</p>
          
          <h2 style="color: #333; border-bottom: 2px solid #55b8f7; padding-bottom: 10px;">Message</h2>
          <p>${quote.message || "No additional message"}</p>
        </div>
        
        <div style="background-color: #1a1a1a; padding: 15px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">AURA EXPRESS AFRICA LTD - Delivering Excellence</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendQuoteConfirmationToCustomer = async (quote) => {
  const mailOptions = {
    from: `"AURA EXPRESS AFRICA LTD" <${process.env.SMTP_USER}>`,
    to: quote.email,
    subject: "Quote Request Received - AURA EXPRESS AFRICA LTD",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #55b8f7; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">AURA EXPRESS AFRICA LTD</h1>
          <p style="color: white; margin: 5px 0 0 0;">Delivering Excellence</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Dear ${quote.full_name},</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Thank you for your quote request. We have received your inquiry and our team is reviewing your requirements.
          </p>
          
          <p style="color: #555; line-height: 1.6;">
            A member of our logistics team will contact you within <strong>24-48 hours</strong> with a detailed quotation based on your cargo specifications.
          </p>
          
          <div style="background-color: #fff; border-left: 4px solid #55b8f7; padding: 15px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Request Summary:</h3>
            <p style="margin: 5px 0;"><strong>Transport Mode:</strong> ${quote.transport_mode}</p>
            <p style="margin: 5px 0;"><strong>Cargo Type:</strong> ${quote.cargo_type}</p>
            <p style="margin: 5px 0;"><strong>Route:</strong> ${quote.route || "To be discussed"}</p>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            If you have any urgent questions, please don't hesitate to contact us:
          </p>
          
          <p style="color: #555;">
            <strong>Phone:</strong> +254 736 758 613<br>
            <strong>Email:</strong> auraexpressafrica@gmail.com<br>
            <strong>Location:</strong> Mombasa, Kenya
          </p>
          
          <p style="color: #555; line-height: 1.6;">
            Best regards,<br>
            <strong>AURA EXPRESS AFRICA LTD Team</strong>
          </p>
        </div>
        
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
          <p style="color: #55b8f7; margin: 0 0 10px 0; font-weight: bold;">Your Reliable Partner in Freight & Logistics</p>
          <p style="color: #999; margin: 0; font-size: 12px;">Road Freight | Sea Freight | Air Freight | Heavy Haulage</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendContactNotificationToAdmin = async (contact) => {
  const mailOptions = {
    from: `"AURA EXPRESS Website" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact Message - ${contact.subject || "General Inquiry"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #55b8f7; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Contact Message</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333; border-bottom: 2px solid #55b8f7; padding-bottom: 10px;">Contact Details</h2>
          <p><strong>Name:</strong> ${contact.full_name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Phone:</strong> ${contact.phone || "Not provided"}</p>
          <p><strong>Subject:</strong> ${contact.subject || "Not specified"}</p>
          
          <h2 style="color: #333; border-bottom: 2px solid #55b8f7; padding-bottom: 10px;">Message</h2>
          <p style="white-space: pre-wrap;">${contact.message}</p>
        </div>
        
        <div style="background-color: #1a1a1a; padding: 15px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">AURA EXPRESS AFRICA LTD - Delivering Excellence</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendContactConfirmationToCustomer = async (contact) => {
  const mailOptions = {
    from: `"AURA EXPRESS AFRICA LTD" <${process.env.SMTP_USER}>`,
    to: contact.email,
    subject: "Message Received - AURA EXPRESS AFRICA LTD",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #55b8f7; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">AURA EXPRESS AFRICA LTD</h1>
          <p style="color: white; margin: 5px 0 0 0;">Delivering Excellence</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Dear ${contact.full_name},</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Thank you for contacting AURA EXPRESS AFRICA LTD. We have received your message and will respond as soon as possible.
          </p>
          
          <p style="color: #555; line-height: 1.6;">
            Our team typically responds within <strong>24 hours</strong> during business days.
          </p>
          
          <p style="color: #555; line-height: 1.6;">
            Best regards,<br>
            <strong>AURA EXPRESS AFRICA LTD Team</strong>
          </p>
        </div>
        
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
          <p style="color: #55b8f7; margin: 0 0 10px 0; font-weight: bold;">Your Reliable Partner in Freight & Logistics</p>
          <p style="color: #999; margin: 0; font-size: 12px;">Mombasa, Kenya</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendQuoteNotificationToAdmin,
  sendQuoteConfirmationToCustomer,
  sendContactNotificationToAdmin,
  sendContactConfirmationToCustomer,
};
