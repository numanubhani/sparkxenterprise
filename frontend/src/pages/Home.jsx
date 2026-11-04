import Hero from '../components/home/Hero.jsx';
import FeatureBand from '../components/home/FeatureBand.jsx';
import EcosystemStrip from '../components/home/EcosystemStrip.jsx';
import CategoryRow from '../components/home/CategoryRow.jsx';
import Solutions from '../components/home/Solutions.jsx';
import Process from '../components/home/Process.jsx';
import Compliance from '../components/home/Compliance.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureBand />
      <EcosystemStrip />
      <CategoryRow />
      <Solutions />
      <Process />
      <Compliance />
      <CtaBanner />
    </>
  );
}
