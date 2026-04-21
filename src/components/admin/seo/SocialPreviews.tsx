import { useState } from "react";

interface Props {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName?: string;
}

type Platform = "facebook" | "twitter" | "slack" | "whatsapp";

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "facebook", label: "Facebook / LinkedIn" },
  { id: "twitter", label: "Twitter / X" },
  { id: "slack", label: "Slack / Discord" },
  { id: "whatsapp", label: "WhatsApp / iMessage" },
];

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ImageOrFallback({ src, className }: { src: string; className: string }) {
  if (!src) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <span className="text-xs text-muted-foreground">No image</span>
      </div>
    );
  }
  return <img src={src} alt="" className={className} />;
}

function FacebookCard({ title, description, image, url }: Props) {
  const domain = getDomain(url);
  return (
    <div className="rounded-lg overflow-hidden border bg-white max-w-md">
      <ImageOrFallback src={image} className="w-full aspect-[1.91/1] object-cover" />
      <div className="px-3 py-2 bg-[#f2f3f5]">
        <p className="text-[11px] uppercase text-[#606770] tracking-wide truncate">{domain}</p>
        <p className="text-[15px] font-semibold text-[#1c1e21] leading-tight mt-0.5 line-clamp-2">
          {title || "Untitled"}
        </p>
        <p className="text-[13px] text-[#606770] mt-1 line-clamp-2">{description || "No description"}</p>
      </div>
    </div>
  );
}

function TwitterCard({ title, description, image, url }: Props) {
  const domain = getDomain(url);
  return (
    <div className="rounded-2xl overflow-hidden border border-[#cfd9de] bg-white max-w-md">
      <ImageOrFallback src={image} className="w-full aspect-[1.91/1] object-cover" />
      <div className="px-3 py-2.5 border-t border-[#cfd9de]">
        <p className="text-[13px] text-[#536471] truncate">{domain}</p>
        <p className="text-[15px] text-[#0f1419] leading-snug mt-0.5 line-clamp-2">
          {title || "Untitled"}
        </p>
        <p className="text-[13px] text-[#536471] mt-0.5 line-clamp-2">{description || "No description"}</p>
      </div>
    </div>
  );
}

function SlackCard({ title, description, image, url, siteName }: Props) {
  const domain = getDomain(url);
  return (
    <div className="flex gap-3 max-w-lg pl-3 border-l-4 border-[#1d9bd1] bg-white p-3 rounded">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#1d1c1d] font-medium">{siteName || domain}</p>
        <p className="text-[15px] text-[#1264a3] font-semibold mt-0.5 line-clamp-2 hover:underline cursor-pointer">
          {title || "Untitled"}
        </p>
        <p className="text-[14px] text-[#1d1c1d] mt-1 line-clamp-3">{description || "No description"}</p>
        {image && (
          <div className="mt-2 rounded overflow-hidden border border-[#e8e8e8] max-w-xs">
            <img src={image} alt="" className="w-full aspect-[1.91/1] object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}

function WhatsappCard({ title, description, image, url }: Props) {
  const domain = getDomain(url);
  return (
    <div className="rounded-lg overflow-hidden bg-[#dcf8c6] max-w-sm shadow-sm">
      {image && <ImageOrFallback src={image} className="w-full aspect-[1.91/1] object-cover" />}
      <div className="px-3 py-2">
        <p className="text-[14px] font-semibold text-[#303030] leading-tight line-clamp-2">
          {title || "Untitled"}
        </p>
        <p className="text-[13px] text-[#5e5e5e] mt-0.5 line-clamp-2">{description || "No description"}</p>
        <p className="text-[12px] text-[#8696a0] mt-1 truncate">{domain}</p>
      </div>
    </div>
  );
}

const SocialPreviews = ({ title, description, image, url, siteName }: Props) => {
  const [active, setActive] = useState<Platform>("facebook");
  const props = { title, description, image, url, siteName };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 p-1 bg-muted/40 rounded-lg w-fit">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActive(p.id)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
              active === p.id
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-lg border bg-muted/20 flex justify-center overflow-x-auto">
        {active === "facebook" && <FacebookCard {...props} />}
        {active === "twitter" && <TwitterCard {...props} />}
        {active === "slack" && <SlackCard {...props} />}
        {active === "whatsapp" && <WhatsappCard {...props} />}
      </div>
    </div>
  );
};

export default SocialPreviews;
