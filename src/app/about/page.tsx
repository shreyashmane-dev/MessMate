import { InfoPageLayout } from "@/components/shared/InfoPageLayout";

export default function AboutPage() {
  return (
    <InfoPageLayout 
      title="About MessMate" 
      description="We are on a mission to revolutionize how students find and manage their daily meals."
    >
      <div className="space-y-6 text-slate-700 leading-relaxed">
        <p>MessMate was born out of a simple observation: students often struggle to find hygienic and affordable mess services, while mess owners struggle to reach their target audience effectively.</p>
        <p>Our platform bridges this gap by providing a modern, digital interface for discovery, management, and community building in the student meal industry.</p>
      </div>
    </InfoPageLayout>
  );
}
