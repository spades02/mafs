import Breadcrumbs from "@/components/breadcrumbs";
import FightAnalysisContent from "@/components/fight-analysis";
import InitialUI from "@/components/initial-ui";
import MainContent from "@/components/main-contet";
import { PageFooter } from "@/components/page-footer";

export default function Home() {
  return (
    <main className="container mx-auto px-6 py-12 max-w-[1600px] page-glow-frame rounded-3xl mt-6 mb-6 bg-digital-noise">
      <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <Breadcrumbs />
      <MainContent />
      </div>
      <PageFooter />
    </main>
  );
}
