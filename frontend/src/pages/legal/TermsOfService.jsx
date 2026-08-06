import React from 'react';
import LegalPageLayout from './components/LegalPageLayout';

const TermsOfService = () => {
  return (
    <LegalPageLayout
      icon="FileText"
      title="Terms of Service"
      lastUpdated="August 5, 2026"
      description="The terms governing your use of Reynrel Infotech's website and software development services."
      path="/terms-of-service"
    >
      <p>
        These Terms of Service ("Terms") govern your access to and use of the website reynrel.in
        and the software development, web development, consultation, and product services
        (together, the "Services") provided by Reynrel Infotech ("Reynrel Infotech", "we", "us",
        or "our"). By accessing our website, requesting a quote, or engaging our Services, you
        agree to be bound by these Terms.
      </p>

      <h2>1. Our Services</h2>
      <p>
        Reynrel Infotech provides custom software development, website development, mobile/Android
        application development, technology consultation, and related digital products. The exact
        scope, deliverables, timelines, and fees for any engagement are set out separately in a
        proposal, quote, or service agreement agreed with you before work begins.
      </p>

      <h2>2. Client Accounts</h2>
      <p>
        Some parts of our Services, such as the client dashboard, require you to create an
        account. You are responsible for maintaining the confidentiality of your login
        credentials and for all activity that occurs under your account. Notify us immediately of
        any unauthorized use.
      </p>

      <h2>3. Project Engagement, Payments &amp; Renewals</h2>
      <ul>
        <li>Project scope, milestones, and pricing will be confirmed in writing before work commences.</li>
        <li>Invoices are due within the timeframe stated on the invoice unless otherwise agreed.</li>
        <li>Late payments may result in suspension of ongoing work or support until settled.</li>
        <li>Where applicable, hosting, maintenance, or software licenses are subject to periodic renewal as communicated to you in advance.</li>
      </ul>

      <h2>4. Intellectual Property</h2>
      <p>
        Unless otherwise agreed in writing, ownership of custom deliverables (source code,
        designs) transfers to the client upon full payment. Reynrel Infotech retains the right to
        reuse general know-how, pre-existing tools, frameworks, and components that are not
        specific to your project. Our own website content, branding, and product software (such
        as our standard product offerings) remain the property of Reynrel Infotech.
      </p>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use our website or Services for any unlawful purpose or in violation of applicable regulations</li>
        <li>Attempt to gain unauthorized access to our systems, other clients' data, or the client/admin portals</li>
        <li>Interfere with or disrupt the integrity or performance of our Services</li>
        <li>Reverse engineer, resell, or misrepresent any product or software provided by us without authorization</li>
      </ul>

      <h2>6. Warranties &amp; Support</h2>
      <p>
        We aim to deliver high-quality work and stand by it. Post-delivery bug fixes, warranty
        periods, and ongoing support/maintenance terms (if any) will be specified in your project
        agreement. Beyond what is agreed, Services are provided "as is" without additional
        warranties, express or implied.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Reynrel Infotech shall not be liable for any
        indirect, incidental, special, or consequential damages arising out of or related to your
        use of our Services. Our total liability for any claim shall not exceed the amount you
        paid us for the Services giving rise to the claim.
      </p>

      <h2>8. Third-Party Services</h2>
      <p>
        Our Services may integrate with or rely on third-party tools (e.g., hosting providers,
        payment gateways, WhatsApp). We are not responsible for the availability or performance of
        third-party services outside our control.
      </p>

      <h2>9. Termination</h2>
      <p>
        Either party may terminate an ongoing engagement in accordance with the terms of the
        specific project agreement. We reserve the right to suspend or terminate access to the
        client/admin portals for violation of these Terms.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        These Terms are governed by the laws of India, and any disputes shall be subject to the
        exclusive jurisdiction of the courts in Guwahati, Assam.
      </p>

      <h2>11. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of our website or Services
        after changes are posted constitutes acceptance of the revised Terms.
      </p>

      <h2>12. Contact Us</h2>
      <ul>
        <li>Email: <a href="mailto:info.reynrel@gmail.com">info.reynrel@gmail.com</a></li>
        <li>Phone: +91 94010 69337</li>
        <li>Address: House No. 46, LKRB Path, Nabin Nagar, Guwahati, Assam 781024, India</li>
      </ul>
    </LegalPageLayout>
  );
};

export default TermsOfService;
