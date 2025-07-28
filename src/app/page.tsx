// pages/index.js
import Head from 'next/head';

import ShowerConfigurator from './components/GlassPanel3D';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Shower Door Configurator</title>
        <meta name="description" content="Custom shower door designer" />
      </Head>

      <main>
        <ShowerConfigurator />
      </main>
    </div>
  );
}
