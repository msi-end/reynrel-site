import React from 'react';
import LegalPageLayout from './components/LegalPageLayout';

const PrivacyPolicy = () => {
  return (
    <LegalPageLayout
      icon="ShieldCheck"
      title="Privacy Policy"
      lastUpdated="August 5, 2026"
      description="How Reynrel Infotech collects, uses, and protects your personal information."
      path="/privacy-policy"
    >
      <p>
        Reynrel Infotech ("Reynrel Infotech", "we", "us", or "our") respects your privacy and is
        committed to protecting the personal information you share with us. This Privacy Policy
        explains what information we collect, how we use it, and the choices you have, when you
        visit reynrel.in or use our products and services (together, the "Services").
      </p>

      <h2>1. Information We Collect</h2>
      <p>We collect information in the following ways:</p>
      <ul>
        <li>
          <strong>Information you provide directly</strong> — such as your name, email address,
          phone number, company name, and project details when you fill out a contact or lead
          form, request a quote, sign up for a client account, or message us on WhatsApp.
        </li>
        <li>
          <strong>Account information</strong> — when you create a client account, we store your
          login credentials, project and billing details, and any files or messages exchanged
          through your client dashboard.
        </li>
        <li>
          <strong>Usage information</strong> — such as your IP address, browser type, device
          information, pages visited, and referring URLs, collected automatically through cookies
          and similar technologies (see our <a href="/cookie-policy">Cookie Policy</a>).
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To respond to inquiries, provide quotes, and deliver the Services you request</li>
        <li>To create and manage your client account, projects, invoices, and renewals</li>
        <li>To communicate with you about your project, support requests, or account updates</li>
        <li>To improve our website, products, and services</li>
        <li>To send occasional updates about our work, offers, or new products (you may opt out at any time)</li>
        <li>To comply with legal obligations and protect against fraud or misuse of our Services</li>
      </ul>

      <h2>3. How We Share Your Information</h2>
      <p>
        We do not sell your personal information. We may share information with:
      </p>
      <ul>
        <li>Service providers who help us operate our website, hosting, payments, and communication tools, under confidentiality obligations</li>
        <li>Professional advisors (legal, accounting) where necessary</li>
        <li>Authorities, where required by law or to protect our rights and the safety of others</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        We retain personal information for as long as necessary to provide the Services, maintain
        business and legal records, and fulfil the purposes described in this policy, after which
        it is securely deleted or anonymized.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We use reasonable administrative, technical, and physical safeguards to protect your
        information. However, no method of transmission or storage is 100% secure, and we cannot
        guarantee absolute security.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        Depending on your location, you may have the right to access, correct, update, or request
        deletion of your personal information, and to object to or restrict certain processing.
        To exercise these rights, contact us using the details below.
      </p>

      <h2>7. Children's Privacy</h2>
      <p>
        Our Services are intended for businesses and individuals over the age of 18 and are not
        directed at children. We do not knowingly collect personal information from children.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be reflected by
        updating the "Last updated" date above. We encourage you to review this page periodically.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or how we handle your information, contact
        us at:
      </p>
      <ul>
        <li>Email: <a href="mailto:info.reynrel@gmail.com">info.reynrel@gmail.com</a></li>
        <li>Phone: +91 94010 69337</li>
        <li>Address: House No. 46, LKRB Path, Nabin Nagar, Guwahati, Assam 781024, India</li>
      </ul>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
