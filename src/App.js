import BaseOffers from './components/BaseOffers';
import ContactForm from './components/ContactForm';
import CustomModules from './components/CustomModules';
import Expertise from './components/Expertise';
import HeroSection from './components/HeroSection';

function App() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <BaseOffers />
      <CustomModules />
      <Expertise />
      <ContactForm />
    </main>
  );
}

export default App;
