const isHttps = (url) => typeof url === "string" && /^https:\/\/\S+$/i.test(url.trim());

const fallbacks = {
  instagram: "https://www.instagram.com/parivarseva/",
  facebook: "https://www.facebook.com/parivarseva",
  linkedin: "https://www.linkedin.com/company/parivarsevasanstha",
};

export function socialProfiles(social = {}) {
  return [
    {
      key: "instagram",
      label: "Instagram",
      url: isHttps(social.instagram) ? social.instagram.trim() : fallbacks.instagram,
    },
    {
      key: "facebook",
      label: "Facebook",
      url: isHttps(social.facebook) ? social.facebook.trim() : fallbacks.facebook,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      url: isHttps(social.linkedin) ? social.linkedin.trim() : fallbacks.linkedin,
    },
  ];
}

/** @deprecated Prefer socialProfiles — kept for text lists that only show saved links. */
export function savedSocialLinks(social) {
  return [
    ["Instagram", social?.instagram],
    ["Facebook", social?.facebook],
    ["LinkedIn", social?.linkedin],
    ["YouTube", social?.youtube],
  ].filter(([, url]) => isHttps(url));
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-grad)" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="#fff" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.5 19v-6.2h2.1l.3-2.4h-2.4V8.9c0-.7.2-1.2 1.2-1.2h1.3V5.6c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.8H8.6v2.4h2.3V19h2.6z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M7.2 10.1H9v7.2H7.2v-7.2zm.9-2.9a1.05 1.05 0 1 1 0-2.1 1.05 1.05 0 0 1 0 2.1zM11 10.1h1.7v.98h.02c.24-.45.82-1.1 1.9-1.1 2.03 0 2.4 1.34 2.4 3.08v4.24h-1.78v-3.76c0-.9-.02-2.05-1.25-2.05-1.25 0-1.44.98-1.44 1.99v3.82H11v-7.2z"
      />
    </svg>
  );
}

const icons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  linkedin: LinkedInIcon,
};

export function SocialIconLinks({ social, className = "" }) {
  const links = socialProfiles(social);

  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {links.map(({ key, label, url }) => {
        const Icon = icons[key];
        return (
          <li key={key}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_8px_18px_-10px_rgba(0,0,0,0.55)] transition hover:scale-105"
            >
              <Icon />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function SocialLinks({ social, className = "" }) {
  const links = savedSocialLinks(social);
  if (!links.length) return null;
  return (
    <ul className={className}>
      {links.map(([label, url]) => (
        <li key={label}>
          <a href={url} className="text-sm underline" rel="noreferrer" target="_blank">
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
