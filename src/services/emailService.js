const resend = require("../config/email");

const sendQuoteNotificationToAdmin = async (quote) => {
  const quoteDetails = `
    <h3 style="color: #333; border-bottom: 2px solid #55b8f7; padding-bottom: 10px;">Contact Details</h3>
    <p><strong>Name:</strong> ${quote.full_name}</p>
    <p><strong>Email:</strong> ${quote.email}</p>
    <p><strong>Phone:</strong> ${quote.phone || "Not provided"}</p>
    <p><strong>Company:</strong> ${quote.company || "Not provided"}</p>
    
    <h3 style="color: #333; border-bottom: 2px solid #55b8f7; padding-bottom: 10px;">Cargo Details</h3>
    <p><strong>Origin Country:</strong> ${quote.origin_country}</p>
    <p><strong>Cargo Type:</strong> ${quote.cargo_type}</p>
    <p><strong>Transport Mode:</strong> ${quote.transport_mode}</p>
    <p><strong>Quantity:</strong> ${quote.cargo_quantity || "Not specified"}</p>
    <p><strong>Dimensions (L x W x H):</strong> ${quote.cargo_dimensions || "Not specified"}</p>
    <p><strong>Weight:</strong> ${quote.cargo_weight ? quote.cargo_weight + " tonnes" : "Not specified"}</p>
    
    <h3 style="color: #333; border-bottom: 2px solid #55b8f7; padding-bottom: 10px;">Route Details</h3>
    <p><strong>Route:</strong> ${quote.route || "Not specified"}</p>
    <p><strong>Route Details:</strong> ${quote.route_details || "Not provided"}</p>
    <p><strong>Delivery Country:</strong> ${quote.delivery_country || "Not specified"}</p>
    <p><strong>Final Destination:</strong> ${quote.final_destination || "Not specified"}</p>
    
    <h3 style="color: #333; border-bottom: 2px solid #55b8f7; padding-bottom: 10px;">Message</h3>
    <p>${quote.message || "No additional message"}</p>
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #55b8f7; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Quotation Submitted - Action Required</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9;">
        ${quoteDetails}
      </div>
      
      <div style="background-color: #1a1a1a; padding: 15px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">AURA EXPRESS AFRICA LTD - Delivering Excellence</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `AURA EXPRESS <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Quotation to Invoice - ${quote.full_name}`,
      html: html,
    });
  } catch (error) {
    console.error("Admin email error:", error);
    throw error;
  }
};

const sendQuoteConfirmationToCustomer = async (quote) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #55b8f7; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AURA EXPRESS AFRICA LTD</h1>
        <p style="color: white; margin: 5px 0 0 0;">Delivering Excellence</p>
      </div>
      
      <div style="padding: 30px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Dear ${quote.full_name},</h2>
        
        <p style="color: #555; line-height: 1.6;">
          Thank you for submitting your quotation with us. We have received your cargo details and specifications.
        </p>
        
        <p style="color: #555; line-height: 1.6;">
          Our logistics team is now preparing a detailed <strong>invoice</strong> based on your quotation. You can expect to receive it within <strong>24-48 hours</strong>.
        </p>
        
        <div style="background-color: #fff; border-left: 4px solid #55b8f7; padding: 15px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Your Quotation Summary:</h3>
          <p style="margin: 5px 0;"><strong>Transport Mode:</strong> ${quote.transport_mode}</p>
          <p style="margin: 5px 0;"><strong>Cargo Type:</strong> ${quote.cargo_type}</p>
          <p style="margin: 5px 0;"><strong>Route:</strong> ${quote.route || "To be discussed"}</p>
          <p style="margin: 5px 0;"><strong>Reference ID:</strong> QT-${quote.id}</p>
        </div>
        
        <p style="color: #555; line-height: 1.6;">
          If you need to reach us urgently:
        </p>
        
        <p style="color: #555;">
          <strong>Phone:</strong> +254 748 173 453<br>
          <strong>Email:</strong> info@auraexpressafrica.com<br>
          <strong>Location:</strong> Mombasa, Kenya
        </p>
        
        <p style="color: #555; line-height: 1.6;">
          Best regards,<br>
          <strong>AURA EXPRESS AFRICA LTD Team</strong>
        </p>
      </div>
      
      <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
        <p style="color: #55b8f7; margin: 0 0 10px 0; font-weight: bold;">Your Reliable Partner in International Procurement & Logistics</p>
        <p style="color: #999; margin: 0; font-size: 12px;">Road Freight | Sea Freight | Air Freight | Heavy Haulage</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `AURA EXPRESS <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: quote.email,
      subject:
        "Quotation Received - Invoice Coming Soon - AURA EXPRESS AFRICA LTD",
      html: html,
    });
  } catch (error) {
    console.error("Customer email error:", error);
    throw error;
  }
};

const sendContactNotificationToAdmin = async (contact) => {
  const html = `
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
  `;

  try {
    await resend.emails.send({
      from: `AURA EXPRESS <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Message - ${contact.subject || "General Inquiry"}`,
      html: html,
    });
  } catch (error) {
    console.error("Admin email error:", error);
    throw error;
  }
};

const sendContactConfirmationToCustomer = async (contact) => {
  const html = `
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
        <p style="color: #55b8f7; margin: 0 0 10px 0; font-weight: bold;">Your Reliable Partner in International Procurement & Logistics</p>
        <p style="color: #999; margin: 0; font-size: 12px;">Mombasa, Kenya</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `AURA EXPRESS <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: contact.email,
      subject: "Message Received - AURA EXPRESS AFRICA LTD",
      html: html,
    });
  } catch (error) {
    console.error("Customer email error:", error);
    throw error;
  }
};

const sendInvoiceToCustomer = async (invoice, pdfBuffer) => {
  const currency = invoice.currency || "USD";
  const total = Number(invoice.total || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #55b8f7; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AURA EXPRESS AFRICA LTD</h1>
        <p style="color: white; margin: 5px 0 0 0;">Delivering Excellence</p>
      </div>

      <div style="padding: 30px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Dear ${invoice.client_name},</h2>

        <p style="color: #555; line-height: 1.6;">
          Thank you for your quotation. Please find attached the invoice
          <strong>${invoice.invoice_number}</strong> prepared based on your shipment details.
        </p>

        <div style="background-color: #fff; border-left: 4px solid #55b8f7; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
          <p style="margin: 5px 0;"><strong>Transport Mode:</strong> ${invoice.transport_mode || "-"}</p>
          <p style="margin: 5px 0;"><strong>Route:</strong> ${invoice.route || "-"}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> ${currency} ${total}</p>
        </div>

        <p style="color: #555; line-height: 1.6;">
          The full breakdown is available in the attached PDF. If you have any questions about
          this invoice, please reply to this email or contact us directly.
        </p>

        <p style="color: #555;">
          <strong>Phone:</strong> +254 748 173 453<br>
          <strong>Email:</strong> info@auraexpressafricaltd.com<br>
          <strong>Location:</strong> Majengo, Mombasa, Kenya
        </p>

        <p style="color: #555; line-height: 1.6;">
          Best regards,<br>
          <strong>AURA EXPRESS AFRICA LTD Team</strong>
        </p>
      </div>

      <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
        <p style="color: #55b8f7; margin: 0 0 10px 0; font-weight: bold;">Your Reliable Partner in International Procurement & Logistics</p>
        <p style="color: #999; margin: 0; font-size: 12px;">Road Freight | Sea Freight | Air Freight | Heavy Haulage</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `AURA EXPRESS <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: invoice.client_email,
      subject: `Invoice ${invoice.invoice_number} - AURA EXPRESS AFRICA LTD`,
      html: html,
      attachments: [
        {
          filename: `${invoice.invoice_number}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });
  } catch (error) {
    console.error("Invoice email error:", error);
    throw error;
  }
};

module.exports = {
  sendQuoteNotificationToAdmin,
  sendQuoteConfirmationToCustomer,
  sendContactNotificationToAdmin,
  sendContactConfirmationToCustomer,
  sendInvoiceToCustomer,
};
