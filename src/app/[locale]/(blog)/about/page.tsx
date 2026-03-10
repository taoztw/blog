import React from "react";

const AboutPage = () => {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-10 text-center">
        <blockquote className="space-y-2">
          <p className="font-cormorant text-3xl font-light tracking-widest text-ink-800 dark:text-ink-200 sm:text-4xl">
            此中有真意，欲辨已忘言
          </p>
          <p className="text-sm font-light tracking-wide text-ink-500 dark:text-ink-400">
            Here lies the true meaning — yet when I would speak, words already fail.
          </p>
          <p className="text-xs text-ink-400 dark:text-ink-500">
            — 陶渊明《饮酒·其五》
          </p>
        </blockquote>

        <a
          href="mailto:tztw4723@gmail.com"
          className="text-sm text-ink-500 transition-colors duration-200 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200"
        >
          tztw4723@gmail.com
        </a>
      </div>
    </main>
  );
};

export default AboutPage;
