import React from 'react';
import LegalPageLayout from './components/LegalPageLayout';

const CookiePolicy = () => {
  return (
    <LegalPageLayout
      icon="Cookie"
      title="Cookie Policy"
      lastUpdated="August 5, 2026"
      description="How Reynrel Infotech uses cookies and similar technologies on reynrel.in."
      path="/cookie-policy"
    >
      <p>
        This Cookie Policy explains how Reynrel Infotech ("we", "us", or "our") uses cookies and
        similar technologies on reynrel.in and our client portal. It should be read alongside our{' '}
        <a href="/privacy-policy">Privacy Policy</a>.
      </p>

      <h2>1. What Are Cookies</h2>
      <p>
        Cookies are small text files placed on your device when you visit a website. They help
        the site function correctly, remember your preferences, and understand how visitors use
        the site.
      </p>

      <h2>2. Types of Cookies We Use</h2>
      <ul>
        <li>
          <strong>Essential cookies</strong> — required for core functionality such as keeping you
          signed in to your client or admin account, remembering session state, and securing forms.
          These cannot be disabled as the site would not work properly without them.
        </li>
        <li>
          <strong>Functional cookies</strong> — remember your preferences (such as previously
          viewed pages) to improve your experience.
        </li>
        <li>
          <strong>Analytics cookies</strong> — help us understand how visitors interact with our
          website (e.g., pages visited, time on site) so we can improve content and performance.
        </li>
        <li>
          <strong>Third-party cookies</strong> — set by services we embed or link to, such as
          WhatsApp chat, social media links, or map/embed tools, which are subject to those
          providers' own cookie and privacy practices.
        </li>
      </ul>

      <h2>3. How We Use Cookies</h2>
      <ul>
        <li>To keep you logged in to the client dashboard or admin panel</li>
        <li>To remember your preferences and improve site navigation</li>
        <li>To measure website traffic and understand how our Services are used</li>
        <li>To support security features and prevent fraudulent activity</li>
      </ul>

      <h2>4. Managing Cookies</h2>
      <p>
        Most web browsers let you control cookies through their settings, including blocking or
        deleting cookies. Because essential cookies are necessary for account login and core
        functionality, disabling them may prevent parts of the website (such as the client
        dashboard) from working correctly.
      </p>

      <h2>5. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes in the cookies we
        use or for legal reasons. The "Last updated" date above indicates when this policy was
        last revised.
      </p>

      <h2>6. Contact Us</h2>
      <p>If you have questions about our use of cookies, contact us at:</p>
      <ul>
        <li>Email: <a href="mailto:info.reynrel@gmail.com">info.reynrel@gmail.com</a></li>
        <li>Phone: +91 94010 69337</li>
        <li>Address: House No. 46, LKRB Path, Nabin Nagar, Guwahati, Assam 781024, India</li>
      </ul>
    </LegalPageLayout>
  );
};

export default CookiePolicy;
