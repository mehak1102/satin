import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AmbientVideo } from "../home/AmbientVideo";
import { Title } from "../motion/Title";

/** Split closing block after the condoms grid — video left, copy right. */
export function CondomClosingVideo() {
  return (
    <section
      aria-labelledby="condoms-closing-title"
      className="mt-12 w-full overflow-hidden lg:mt-14"
    >
      <div className="grid overflow-hidden border-y border-line bg-[#e8e4e0] lg:min-h-[min(65svh,600px)] lg:grid-cols-2">
        <div className="relative order-1 min-h-[min(48svh,420px)] w-full lg:min-h-0 lg:h-full">
          <AmbientVideo
            src="/home/moments/moment-flow.mp4"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center center" }}
          />
        </div>

        <div className="order-2 flex items-center bg-gradient-to-br from-[#eaf3f9] to-[#dce8f2] px-6 py-12 sm:px-10 sm:py-14 lg:px-12 lg:py-16 xl:px-16">
          <div className="w-full max-w-md">
            <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">Pack facts</p>
            <Title as="h2" id="condoms-closing-title" className="mt-3 font-display text-3xl leading-[1.05] font-medium sm:text-4xl lg:text-[2.35rem]">
              Read the pack, not the pitch
            </Title>
            <p className="mt-5 text-sm leading-7 text-ink-soft sm:text-base">
              Stallion, Rider, Sawan, and Night Bliss — names, counts, and prices as printed. This shop does not publish medical
              advice.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#condoms-grid"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90"
              >
                Back to condoms
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/80 px-6 py-3 text-sm font-medium text-ink transition hover:border-ink"
              >
                Satin pads
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}