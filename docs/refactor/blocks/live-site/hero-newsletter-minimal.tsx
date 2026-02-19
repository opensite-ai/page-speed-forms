"use client";

import { HeroNewsletterMinimal } from "@opensite/ui/blocks/hero/hero-newsletter-minimal";
import { DynamicIcon } from "@opensite/ui/components/dynamic-icon";
import { demoFormEngineApi } from "@/lib/form-demo-data";
import type { FormFieldConfig } from "@opensite/ui";

const formFields: FormFieldConfig[] = [
  {
    name: "email",
    type: "email",
    className: "w-full",
    placeholder: "Enter your email",
    required: true,
    columnSpan: 12,
  },
];

export default function Demo() {
  return (
    <HeroNewsletterMinimal
      heading="Stay in the loop"
      description="Get weekly insights, tips, and updates delivered straight to your inbox. Join 50,000+ subscribers who never miss a beat."
      formFields={formFields}
      formConfig={demoFormEngineApi}
      buttonAction={{
        label: "Subscribe",
        variant: "default",
        iconAfter: <DynamicIcon name="lucide/arrow-right" size={16} />,
      }}
      successMessage="Thank you for subscribing! Check your inbox for a confirmation email."
      stats={[
        {
          icon: (
            <DynamicIcon
              name="lucide/briefcase"
              size={24}
              className="text-primary"
            />
          ),
          value: "500+",
          label: "Projects Completed",
        },
        {
          icon: (
            <DynamicIcon
              name="lucide/users"
              size={24}
              className="text-primary"
            />
          ),
          value: "50M+",
          label: "Users Reached",
        },
        {
          icon: (
            <DynamicIcon
              name="lucide/star"
              size={24}
              className="text-primary"
            />
          ),
          value: "98%",
          label: "Client Satisfaction",
        },
      ]}
      background="dark"
    />
  );
}
