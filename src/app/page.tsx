// pages/index.js
import Head from 'next/head';

import ShowerConfigurator from './components/GlassPanel3D';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Glass Layout Configurator</title>
        <meta name="description" content="Glass Layout Configurator" />
      </Head>

      <main>
        <ShowerConfigurator />
      </main>
    </div>
  );
}
