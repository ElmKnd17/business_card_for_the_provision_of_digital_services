import { lazy, Suspense, useEffect, useState } from 'react';
import HeroSection from './components/HeroSection';

const BaseOffers = lazy(() => import('./components/BaseOffers'));
const CustomModules = lazy(() => import('./components/CustomModules'));
const Expertise = lazy(() => import('./components/Expertise'));
const ContactForm = lazy(() => import('./components/ContactForm'));

function DeferredSectionsFallback() {
  return (
    <div aria-hidden="true" className="deferred-sections-fallback">
      <section className="min-h-[42rem] px-6 py-24 sm:px-8 lg:px-12 lg:py-32" />
      <section className="min-h-[52rem] px-6 py-24 sm:px-8 lg:px-12 lg:py-32" />
      <section className="min-h-[44rem] px-6 py-24 sm:px-8 lg:px-12 lg:py-32" />
      <section className="min-h-[100svh] px-6 pt-24 sm:px-8 lg:min-h-screen lg:px-12 lg:pt-32">
        <div id="contact" />
      </section>
    </div>
  );
}

function App() {
  const [shouldLoadSections, setShouldLoadSections] = useState(false);

  useEffect(() => {
    const loadSections = () => setShouldLoadSections(true);
    let idleId;

    const delayId = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(loadSections, {
          timeout: 1600,
        });

        return;
      }

      loadSections();
    }, 1200);

    return () => {
      window.clearTimeout(delayId);

      if (idleId) {
        window.cancelIdleCallback?.(idleId);
      }
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#000000]">
      <div
        className="site-bg-layer pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle at 18% 12%, rgba(139, 92, 246, 0.18) 0%, transparent 34%), radial-gradient(circle at 82% 32%, rgba(59, 130, 246, 0.16) 0%, transparent 36%), #000000',
        }}
      />

      {/* Глобальные анимированные пятна (свет) */}
      <div className="site-bg-layer pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        <div className="aurora-blob aurora-blob-one absolute -left-32 top-10 h-[30rem] w-[30rem] rounded-full bg-[rgba(139,92,246,0.2)] blur-[96px]" />
        <div className="aurora-blob aurora-blob-two absolute right-[-10rem] top-1/4 h-[34rem] w-[34rem] rounded-full bg-[rgba(59,130,246,0.18)] blur-[104px]" />
        <div className="aurora-blob aurora-blob-three absolute bottom-[-12rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-[rgba(139,92,246,0.14)] blur-[110px]" />
        <div className="aurora-blob aurora-blob-four absolute left-[42%] top-[42%] h-[22rem] w-[22rem] rounded-full bg-[rgba(59,130,246,0.1)] blur-[90px]" />
      </div>

      {/* Глобальный фон с шумом */}
      <div className="site-bg-layer pointer-events-none fixed inset-0 z-[2] bg-noise opacity-45" />
      <div className="site-bg-layer pointer-events-none fixed inset-0 z-[3] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.08)_46%,rgba(0,0,0,0.78)_100%)]" />

      <div className="relative z-10">
        <HeroSection />
        {shouldLoadSections ? (
          <Suspense fallback={<DeferredSectionsFallback />}>
            <BaseOffers />
            <CustomModules />
            <Expertise />
            <ContactForm />
          </Suspense>
        ) : (
          <DeferredSectionsFallback />
        )}
      </div>
    </main>
  );
}

export default App;
