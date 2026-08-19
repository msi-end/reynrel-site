import React from 'react';
import LegalPageLayout from './components/LegalPageLayout';

const RefundCancellation = () => {
  return (
    <LegalPageLayout
      icon="RotateCcw"
      title="Cancellation & Refund Policy"
      lastUpdated="August 6, 2026"
      description="Reynrel Infotech's policy on cancelling engagements and requesting refunds for our services and products."
      path="/refund-cancellation"
    >
      <p>
        This Cancellation & Refund Policy applies to services, products, and subscriptions
        purchased from Reynrel Infotech ("Reynrel Infotech", "we", "us", or "our") through
        reynrel.in or any proposal, quote, or invoice issued by us. By making a payment to us, you
        agree to the terms below.
      </p>

      <h2>1. Project & Service Engagements</h2>
      <p>
        For custom software, web development, mobile app development, and consultation
        engagements, cancellation terms are governed primarily by the project agreement, proposal,
        or quote you accepted. In general:
      </p>
      <ul>
        <li>Work already completed, and any milestones already delivered or approved, are non-refundable.</li>
        <li>If you cancel a project before work begins, any advance paid will be refunded after deducting charges for time already spent on planning, discovery, or design.</li>
        <li>If you cancel a project mid-way, we will invoice for work completed up to the point of cancellation, and refund any remaining unearned advance.</li>
      </ul>

      <h2>2. Products & Subscriptions</h2>
      <p>
        For our standard software products (such as Inventory Manager, CRM, or Billing Software)
        billed on an annual or recurring basis:
      </p>
      <ul>
        <li>Refund requests must be raised within <strong>seven (7) days</strong> of the initial purchase or activation, provided the product has not been substantially used or customized for your account.</li>
        <li>Renewal payments, once processed, are non-refundable, but you may choose not to renew for the following period by notifying us before the renewal date.</li>
        <li>No refunds are provided for change of mind after the 7-day window, or for issues arising from misuse, third-party integrations, or requirements not communicated to us prior to purchase.</li>
      </ul>

      <h2>3. Eligibility for a Refund</h2>
      <p>
        Once a service or product has been delivered, the primary grounds on which you may request
        a replacement, correction, or refund are:
      </p>
      <ul>
        <li>The delivered product or service materially does not match the description, features, or scope agreed with you; or</li>
        <li>A verifiable defect or malfunction that we are unable to fix within a reasonable time after being notified.</li>
      </ul>
      <p>
        We reserve full discretion in evaluating cancellation and refund requests and may ask for
        additional details, screen recordings, or access before approving one.
      </p>

      <h2>4. How to Request a Cancellation or Refund</h2>
      <p>
        To request a cancellation or refund, contact us with your invoice/order details and a
        clear description of the reason for your request:
      </p>
      <ul>
        <li>Email: <a href="mailto:info.reynrel@gmail.com">info.reynrel@gmail.com</a></li>
        <li>Phone: +91 94010 69337</li>
      </ul>
      <p>
        Requests should be raised within the timeframe stated in the applicable section above, or
        as otherwise specified in your project agreement or invoice.
      </p>

      <h2>5. Refund Processing</h2>
      <p>
        Approved refunds are processed to the original method of payment within <strong>7–10
        business days</strong> of approval. Depending on your bank or payment provider, it may take
        additional time for the refunded amount to reflect in your account.
      </p>

      <h2>6. Changes to This Policy</h2>
      <p>
        We may update this Cancellation & Refund Policy from time to time. Material changes will
        be reflected by updating the "Last updated" date above.
      </p>

      <h2>7. Contact Us</h2>
      <ul>
        <li>Email: <a href="mailto:info.reynrel@gmail.com">info.reynrel@gmail.com</a></li>
        <li>Phone: +91 94010 69337</li>
        <li>Address: House No. 46, LKRB Path, Nabin Nagar, Guwahati, Assam 781024, India</li>
      </ul>
    </LegalPageLayout>
  );
};

export default RefundCancellation;
