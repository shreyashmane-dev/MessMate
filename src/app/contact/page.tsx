import { InfoPageLayout } from "@/components/shared/InfoPageLayout";

export default function ContactPage() {
  return (
    <InfoPageLayout 
      title="Contact Us" 
      description="Have questions? We're here to help you get started with MessMate."
    >
      <div className="space-y-6">
        <p className="text-slate-700">Email: support@messmate.com</p>
        <p className="text-slate-700">Phone: +91 98765 43210</p>
        <p className="text-slate-700">Address: Digital Square, Kolhapur, Maharashtra</p>
      </div>
    </InfoPageLayout>
  );
}
