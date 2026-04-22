/**
 * Catalog of supported third-party integrations.
 * Each entry knows how to render its config field(s) and how to build
 * the inline/src script that gets injected once enabled & consented.
 */

export type IntegrationCategory =
  | "Analytics"
  | "Marketing & Ads"
  | "Customer Support"
  | "Accessibility"
  | "CRM"
  | "Other";

export type ConsentCategory = "necessary" | "functional" | "analytics" | "marketing";

export type IntegrationField = {
  key: string;
  label: string;
  placeholder?: string;
  helpText?: string;
};

export type IntegrationDefinition = {
  provider: string;          // unique key, e.g. "ga4"
  name: string;              // display name
  description: string;       // one-line
  logo: string;              // 2-letter mark used as a chip
  brandColor: string;        // bg color of the chip
  category: IntegrationCategory;
  defaultConsent: ConsentCategory;
  fields: IntegrationField[]; // user-supplied config keys
  /** Build a head-script payload from saved config. Empty string => skip. */
  buildScript: (config: Record<string, string>) => { src?: string; inline?: string };
  docsUrl?: string;
};

export const INTEGRATION_CATALOG: IntegrationDefinition[] = [
  {
    provider: "ga4",
    name: "Google Analytics 4",
    description: "Track pageviews, events and audiences.",
    logo: "GA",
    brandColor: "bg-[#F9AB00] text-black",
    category: "Analytics",
    defaultConsent: "analytics",
    fields: [{ key: "measurementId", label: "Measurement ID", placeholder: "G-XXXXXXXXXX" }],
    docsUrl: "https://support.google.com/analytics/answer/9304153",
    buildScript: (c) => {
      const id = (c.measurementId || "").trim();
      if (!id) return {};
      return {
        src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`,
        inline: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`,
      };
    },
  },
  {
    provider: "gtm",
    name: "Google Tag Manager",
    description: "Manage tags without redeploying code.",
    logo: "GT",
    brandColor: "bg-[#246FDB] text-white",
    category: "Analytics",
    defaultConsent: "analytics",
    fields: [{ key: "containerId", label: "Container ID", placeholder: "GTM-XXXXXXX" }],
    docsUrl: "https://support.google.com/tagmanager/answer/6103696",
    buildScript: (c) => {
      const id = (c.containerId || "").trim();
      if (!id) return {};
      return {
        inline: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`,
      };
    },
  },
  {
    provider: "meta-pixel",
    name: "Meta Pixel",
    description: "Track conversions from Facebook & Instagram ads.",
    logo: "Mt",
    brandColor: "bg-[#1877F2] text-white",
    category: "Marketing & Ads",
    defaultConsent: "marketing",
    fields: [{ key: "pixelId", label: "Pixel ID", placeholder: "1234567890123456" }],
    docsUrl: "https://developers.facebook.com/docs/meta-pixel/get-started",
    buildScript: (c) => {
      const id = (c.pixelId || "").trim();
      if (!id) return {};
      return {
        inline: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`,
      };
    },
  },
  {
    provider: "linkedin-insight",
    name: "LinkedIn Insight Tag",
    description: "Conversion tracking and audience building for LinkedIn ads.",
    logo: "Li",
    brandColor: "bg-[#0A66C2] text-white",
    category: "Marketing & Ads",
    defaultConsent: "marketing",
    fields: [{ key: "partnerId", label: "Partner ID", placeholder: "1234567" }],
    docsUrl: "https://www.linkedin.com/help/lms/answer/a417869",
    buildScript: (c) => {
      const id = (c.partnerId || "").trim();
      if (!id) return {};
      return {
        inline: `_linkedin_partner_id="${id}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s)})(window.lintrk);`,
      };
    },
  },
  {
    provider: "hotjar",
    name: "Hotjar",
    description: "Heatmaps, recordings and surveys.",
    logo: "Hj",
    brandColor: "bg-[#FD3A5C] text-white",
    category: "Analytics",
    defaultConsent: "analytics",
    fields: [{ key: "siteId", label: "Site ID", placeholder: "1234567" }],
    docsUrl: "https://help.hotjar.com/hc/en-us/articles/115011639927",
    buildScript: (c) => {
      const id = (c.siteId || "").trim();
      if (!id) return {};
      return {
        inline: `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${id},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-',".js?sv=");`,
      };
    },
  },
  {
    provider: "intercom",
    name: "Intercom",
    description: "Live chat & customer messaging.",
    logo: "In",
    brandColor: "bg-[#1F8DED] text-white",
    category: "Customer Support",
    defaultConsent: "functional",
    fields: [{ key: "appId", label: "App ID", placeholder: "abcd1234" }],
    docsUrl: "https://www.intercom.com/help/en/articles/170-integrate-intercom-in-a-website",
    buildScript: (c) => {
      const id = (c.appId || "").trim();
      if (!id) return {};
      return {
        inline: `window.intercomSettings={app_id:'${id}'};(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${id}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`,
      };
    },
  },
  {
    provider: "mailchimp",
    name: "Mailchimp",
    description: "Site visitor tracking for email campaigns.",
    logo: "Mc",
    brandColor: "bg-[#FFE01B] text-black",
    category: "Marketing & Ads",
    defaultConsent: "marketing",
    fields: [
      { key: "userId", label: "User ID", placeholder: "abc123" },
      { key: "dc", label: "Data center", placeholder: "us1" },
    ],
    docsUrl: "https://mailchimp.com/help/about-site-tracking/",
    buildScript: (c) => {
      const u = (c.userId || "").trim();
      const dc = (c.dc || "us1").trim();
      if (!u) return {};
      return {
        inline: `!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/${u}/${dc}.js");`,
      };
    },
  },
  {
    provider: "hubspot",
    name: "HubSpot",
    description: "CRM tracking, forms and chat.",
    logo: "Hs",
    brandColor: "bg-[#FF7A59] text-white",
    category: "CRM",
    defaultConsent: "marketing",
    fields: [{ key: "portalId", label: "Hub ID", placeholder: "12345678" }],
    docsUrl: "https://knowledge.hubspot.com/reports/install-the-hubspot-tracking-code",
    buildScript: (c) => {
      const id = (c.portalId || "").trim();
      if (!id) return {};
      return {
        src: `https://js.hs-scripts.com/${encodeURIComponent(id)}.js`,
      };
    },
  },
  {
    provider: "cookiebot",
    name: "Cookiebot",
    description: "Third-party cookie consent banner.",
    logo: "Ck",
    brandColor: "bg-[#1F4E5F] text-white",
    category: "Other",
    defaultConsent: "necessary",
    fields: [{ key: "cbid", label: "Cookiebot ID", placeholder: "00000000-0000-0000-0000-000000000000" }],
    docsUrl: "https://www.cookiebot.com/en/help/",
    buildScript: (c) => {
      const id = (c.cbid || "").trim();
      if (!id) return {};
      return {
        src: `https://consent.cookiebot.com/uc.js`,
        // Note: Cookiebot expects an attribute on the tag; we add it via inline before-load.
        inline: `(function(){var s=document.querySelector('script[src="https://consent.cookiebot.com/uc.js"]');if(s){s.setAttribute('data-cbid','${id}');s.setAttribute('data-blockingmode','auto');}})();`,
      };
    },
  },
  {
    provider: "userway",
    name: "UserWay (Accessibility)",
    description: "Third-party accessibility widget.",
    logo: "Uw",
    brandColor: "bg-[#293F6C] text-white",
    category: "Accessibility",
    defaultConsent: "necessary",
    fields: [{ key: "accountId", label: "Account ID", placeholder: "abcdef123456" }],
    docsUrl: "https://userway.org/docs",
    buildScript: (c) => {
      const id = (c.accountId || "").trim();
      if (!id) return {};
      return {
        src: `https://cdn.userway.org/widget.js`,
        inline: `(function(){var s=document.querySelector('script[src="https://cdn.userway.org/widget.js"]');if(s){s.setAttribute('data-account','${id}');}})();`,
      };
    },
  },
];

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  "Analytics",
  "Marketing & Ads",
  "Customer Support",
  "Accessibility",
  "CRM",
  "Other",
];

export const CONSENT_CATEGORY_OPTIONS: { value: ConsentCategory; label: string; description: string }[] = [
  {
    value: "necessary",
    label: "Necessary",
    description: "Always runs. Use only for scripts strictly required for the site.",
  },
  {
    value: "functional",
    label: "Functional",
    description: "Runs after visitor accepts Functional cookies in the banner.",
  },
  {
    value: "analytics",
    label: "Analytics",
    description: "Runs after visitor accepts Analytics cookies in the banner.",
  },
  {
    value: "marketing",
    label: "Marketing",
    description: "Runs after visitor accepts Marketing/Advertising cookies in the banner.",
  },
];

/**
 * Map our admin-facing consent categories to the runtime gating categories
 * already implemented in src/lib/consent-gated-scripts.ts.
 *  - necessary  -> always run (no gating)
 *  - functional -> functional gate
 *  - analytics  -> analytics gate
 *  - marketing  -> advertising gate (existing system uses "advertising")
 */
export function toRuntimeCategory(c: ConsentCategory): "functional" | "analytics" | "advertising" | null {
  if (c === "necessary") return null;
  if (c === "functional") return "functional";
  if (c === "analytics") return "analytics";
  return "advertising";
}

export function getDefinition(provider: string): IntegrationDefinition | undefined {
  return INTEGRATION_CATALOG.find((d) => d.provider === provider);
}
