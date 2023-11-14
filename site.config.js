const CONFIG = {
  // profile setting (required)
  profile: {
    name: "윤태인",
    image: "/44636839-removebg-preview.png", // If you want to create your own notion avatar, check out https://notion-avatar.vercel.app
    role: "",
    bio: "새로움에 끊임없이 도전하는 개발자입니다.",
    email: "hey@yuntae.in",
    linkedin: "",
    github: "icecream0910",
    instagram: "",
  },
  projects: [
    {
      name: `About`,
      href: "https://yuntae.in",
    },
  ],
  // blog setting (required)
  blog: {
    title: "태인의 Blog",
    description: "새로움에 끊임없이 도전하는 태인의 Blog",
  },

  // CONFIG configration (required)
  link: "https://blog.yuntae.in",
  since: 2018, // If leave this empty, current year will be used.
  lang: "ko-KR", // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES', 'ko-KR']
  ogImageGenerateURL: "https://og-image-korean.vercel.app", // The link to generate OG image, don't end with a slash

  // notion configuration (required)
  notionConfig: {
    pageId: process.env.NOTION_PAGE_ID,
  },

  // plugin configuration (optional)
  googleAnalytics: {
    enable: false,
    config: {
      measurementId: process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID || "",
    },
  },
  googleSearchConsole: {
    enable: false,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  },
  utterances: {
    enable: true,
    config: {
      repo: "icecream0910/notion-blog",
      "issue-term": "og:title",
      label: "💬 Utterances",
    },
  },
  cusdis: {
    enable: false,
    config: {
      host: "https://cusdis.com",
      appid: "", // Embed Code -> data-app-id value
    },
  },
  isProd: process.env.VERCEL_ENV === "production", // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
  revalidateTime: 1800, // revalidate time for [slug], index
}

module.exports = { CONFIG }
