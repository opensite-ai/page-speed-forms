"use client";

import { ContactVendor } from "@opensite/ui/blocks/contact/contact-vendor";
import { demoFormEngineApi } from "@/lib/form-demo-data";
import type { FormFieldConfig } from "@opensite/ui";

const formFields: FormFieldConfig[] = [
  {
    name: "company_name",
    type: "text",
    label: "Company Name",
    placeholder: "Your company",
    required: true,
    columnSpan: 12,
  },
  {
    name: "contact_name",
    type: "text",
    label: "Contact Person",
    placeholder: "Full name",
    required: true,
    columnSpan: 6,
  },
  {
    name: "title",
    type: "text",
    label: "Job Title",
    placeholder: "Your title",
    required: true,
    columnSpan: 6,
  },
  {
    name: "email",
    type: "email",
    label: "Business Email",
    placeholder: "contact@company.com",
    required: true,
    columnSpan: 6,
  },
  {
    name: "phone",
    type: "tel",
    label: "Phone Number",
    placeholder: "+1 (555) 000-0000",
    required: true,
    columnSpan: 6,
  },
  {
    name: "company_website",
    type: "url",
    label: "Company Website",
    placeholder: "https://yourcompany.com",
    required: false,
    columnSpan: 12,
  },
  {
    name: "vendor_category",
    type: "checkbox-group",
    label: "Product/Service Categories",
    placeholder: "Select all that apply",
    required: true,
    columnSpan: 12,
    layout: "grid",
    options: [
      {
        value: "materials",
        label: "Raw Materials",
        description: "Supply of raw materials and components.",
      },
      {
        value: "manufacturing",
        label: "Manufacturing",
        description: "Contract manufacturing services.",
      },
      {
        value: "logistics",
        label: "Logistics & Shipping",
        description: "Transportation and delivery services.",
      },
      {
        value: "technology",
        label: "Technology Services",
        description: "IT, software, and technical solutions.",
      },
      {
        value: "marketing",
        label: "Marketing Services",
        description: "Advertising, design, and promotional services.",
      },
      {
        value: "consulting",
        label: "Consulting",
        description: "Business consulting and advisory services.",
      },
      {
        value: "facilities",
        label: "Facilities & Maintenance",
        description: "Building maintenance and facility services.",
      },
      {
        value: "other",
        label: "Other",
        description: "Other products or services.",
      },
    ],
  },
  {
    name: "partnership_type",
    type: "radio",
    label: "Type of Partnership",
    required: true,
    columnSpan: 12,
    layout: "grid",
    options: [
      {
        value: "new",
        label: "New Vendor",
        description: "First time working with us.",
      },
      {
        value: "existing",
        label: "Existing Vendor",
        description: "Already in our vendor network.",
      },
      {
        value: "renewal",
        label: "Contract Renewal",
        description: "Renew existing contract.",
      },
    ],
  },
  {
    name: "annual_capacity",
    type: "select",
    label: "Annual Business Capacity",
    required: true,
    columnSpan: 12,
    options: [
      { value: "under50k", label: "Under $50,000" },
      { value: "50k-250k", label: "$50,000 - $250,000" },
      { value: "250k-1m", label: "$250,000 - $1M" },
      { value: "1m-5m", label: "$1M - $5M" },
      { value: "over5m", label: "Over $5M" },
    ],
  },
  {
    name: "content",
    type: "textarea",
    label: "Tell us about your company and offerings",
    placeholder: "Describe your products/services, experience, key differentiators, and why you'd like to work with us...",
    required: true,
    rows: 5,
    columnSpan: 12,
  },
  {
    name: "certifications",
    type: "textarea",
    label: "Certifications and Compliance",
    placeholder: "List any relevant certifications (ISO, minority-owned, women-owned, veteran-owned, etc.)",
    required: false,
    rows: 3,
    columnSpan: 12,
  },
  {
    name: "company_docs",
    type: "file",
    label: "Upload Company Documents",
    placeholder: "Upload company profile, certifications, insurance, etc...",
    required: false,
    accept: ".pdf,.doc,.docx",
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
    multiple: true,
    columnSpan: 12,
  },
];

export default function Demo() {
  return (
    <ContactVendor
      heading="Become a Vendor Partner"
      description="We're always looking for reliable vendors to join our supply chain. Tell us about your company and how we can work together to create mutual success."
      buttonText="Submit Vendor Application"
      formFields={formFields}
      formConfig={demoFormEngineApi}
      successMessage="Thank you for your interest in becoming a vendor partner! Our procurement team will review your application and reach out within 5-7 business days to discuss next steps."
      background="white"
      pattern="dashedGridFadeTop"
      patternOpacity={0.9}
    />
  );
}
