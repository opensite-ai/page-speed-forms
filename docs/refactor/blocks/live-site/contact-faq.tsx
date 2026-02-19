"use client";

import { ContactFaq } from "@opensite/ui/blocks/contact/contact-faq";
import { demoFormEngineApi } from "@/lib/form-demo-data";
import type { FormFieldConfig } from "@opensite/ui";

const formFields: FormFieldConfig[] = [
  {
    name: "name",
    type: "text",
    label: "Full Name",
    placeholder: "Full Name",
    required: true,
    columnSpan: 6,
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "your@email.com",
    required: true,
    columnSpan: 6,
  },
  {
    name: "subject",
    type: "text",
    label: "Subject",
    placeholder: "What is this regarding?",
    required: true,
    columnSpan: 12,
  },
  {
    name: "content",
    type: "textarea",
    label: "Message",
    placeholder: "Please describe your question in detail...",
    required: true,
    rows: 5,
    columnSpan: 12,
  },
];

export default function Demo() {
  return (
    <ContactFaq
      heading="Have Questions?"
      description="Can't find what you're looking for in our FAQ? Send us a message and our team will get back to you within 24 hours."
      formHeading="Send Us a Message"
      buttonText="Submit Question"
      formFields={formFields}
      formConfig={demoFormEngineApi}
      successMessage="Thank you for reaching out! We'll get back to you within 24 hours."
      background="white"
      pattern="dashedGridFadeTop"
      patternOpacity={0.9}
      faqHeading="Frequently Asked Questions"
      items={[
        {
          id: "billing-cycle",
          question: "When will I be charged?",
          answer:
            "Billing occurs on the same day each month or year, depending on your plan. You'll receive an invoice via email 3 days before each billing cycle.",
        },
        {
          id: "refunds",
          question: "What is your refund policy?",
          answer:
            "We offer a 30-day money-back guarantee. If you're not satisfied, contact us within 30 days of your initial purchase for a full refund.",
        },
        {
          id: "upgrades",
          question: "How do plan upgrades work?",
          answer:
            "Upgrades take effect immediately. You'll be charged a prorated amount for the remainder of your billing cycle at the new plan rate.",
        },
        {
          id: "downgrade",
          question: "Can I downgrade my plan?",
          answer:
            "Yes, downgrades take effect at the end of your current billing cycle. You'll continue to have access to your current plan features until then.",
        },
      ]}
    />
  );
}
