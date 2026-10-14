export function savedSocialLinks(social) {
  return [
    ["Instagram", social?.instagram],
    ["Facebook", social?.facebook],
    ["YouTube", social?.youtube],
  ].filter(([, url]) => typeof url === "string" && /^https:\/\/\S+$/i.test(url.trim()));
}

export function SocialLinks({ social, className = "" }) {
  const links = savedSocialLinks(social);
  if (!links.length) return null;
  return (
    <ul className={className}>
      {links.map(([label, url]) => (
        <li key={label}>
          <a href={url} className="text-sm underline" rel="noreferrer">
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
