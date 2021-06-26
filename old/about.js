import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Effect Node By You!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Effect Node By You!</h1>

        <p className={styles.description}>
          VFX on Web = Cables and Boxes Visual Programming + Battries Pack + YOU
        </p>

        <div style={{ height: "3rem" }}></div>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>Your Own Hosting &rarr;</h3>
            <p>You can host on vercel / netlify / your server.</p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h3>Customize ALL by YOU. &rarr;</h3>
            <p>
              Edit your own EffectNode Cables and Boxes GUI with Total Freedom
            </p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h3>Learn &rarr;</h3>
            <p>Learn about Effect Node with Concpet Guides.</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Examples &rarr;</h3>
            <p>Discover what can vfx be like on Web.</p>
          </a>
        </div>

        <p className={styles.description}>Other Advanced Featrues.</p>

        <div className={styles.grid}>
          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Developer Experience &rarr;</h3>
            <p>
              Your own Firebase is used to enhace the development experience.
            </p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Dream Code API &rarr;</h3>
            <p>
              Easy and Simple Code API with total customistaion such as
              Self-clean up for hooks like onLoop and onResize
            </p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Free Batteries of Code &rarr;</h3>
            <p>Creating dynamic code of VFX for your web experience.</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Your Batteries of Code &rarr;</h3>
            <p>You can customise each module with custom code.</p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Inventor's Personal Note: Thanking Jesus for all your heavenly
          inspirations for the benefit of mankind.
        </a>
      </footer>
    </div>
  );
}
