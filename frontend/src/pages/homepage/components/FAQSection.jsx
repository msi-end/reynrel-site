import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const faqs = [
  {
    question: 'How much does a project with Reynrel Infotech cost?',
    answer:
      "It depends on scope — a tech consultation can start around ₹5,000, while a full custom web or software build typically ranges from ₹1.2L to ₹20L+ depending on complexity. We always share a clear, itemized quote before any work begins, so there are no surprises."
  },
  {
    question: 'How long does a typical project take?',
    answer:
      'Most website projects take 6-12 weeks, custom software applications take 8-16 weeks, and technical consultations can be wrapped up in 2-4 weeks. We agree on milestones upfront so you always know where the project stands.'
  },
  {
    question: 'Do you offer support after the project is delivered?',
    answer:
      "Yes — every engagement includes a post-launch warranty period for bug fixes, and we offer ongoing support & maintenance plans with 15/7 availability and typical response times under 15 minutes for critical issues."
  },
  {
    question: 'What technologies do you work with?',
    answer:
      'We work across modern web and mobile stacks — React, Next.js, Node.js, React Native, Flutter — along with cloud platforms like AWS and Azure. We pick the stack that fits your project, not the other way around.'
  },
  {
    question: 'Who owns the code and IP after the project is complete?',
    answer:
      'Once your project is fully paid for, ownership of the custom code and designs built for you transfers to you. Full details are in our Terms of Service.'
  },
  {
    question: 'Do you work with businesses outside Guwahati/Assam?',
    answer:
      'Yes — while we\'re based in Guwahati, we work with clients across India remotely, with regular video updates and a dedicated point of contact for your project.'
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-[var(--color-background)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 rounded-full mb-4 md:mb-6">
            <Icon name="HelpCircle" size={16} color="var(--color-primary)" />
            <span className="text-xs md:text-sm font-medium text-[var(--color-primary)]">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4 md:mb-6">
            Common Questions
          </h2>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            Everything you'd want to know before reaching out — if something's missing, just ask us directly.
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {faqs?.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm md:text-base font-semibold text-[var(--color-foreground)]">
                    {faq?.question}
                  </span>
                  <Icon
                    name={isOpen ? 'Minus' : 'Plus'}
                    size={18}
                    color="var(--color-primary)"
                    className="flex-shrink-0"
                  />
                </button>
                {isOpen && (
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <p className="text-sm md:text-base text-[var(--color-muted-foreground)] leading-relaxed">
                      {faq?.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
