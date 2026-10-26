import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Title } from "../motion/Title";

export function StreeClinicCue() {
  return (
    <section className="bg-[#f7eef4] text-ink">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">Stree Clinic</p>
          <Title as="h2" className="mt-3 max-w-xl font-display text-[clamp(2.15rem,5.5vw,3.6rem)] leading-[1.02] font-medium">
            If you want medical assistance, visit Stree Clinic.
          </Title>
          <p className="mt-5 max-w-md text-sm leading-7 text-ink-soft">
            Satin sells pads. Questions about health belong with a clinician. Stree Clinic is a unit of Parivar Seva Sanstha, for women of all ages.
          </p>
          <Link
            to="/stree-clinic"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-paper transition hover:bg-ink/90"
          >
            About Stree Clinic
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <figure className="overflow-hidden rounded-[28px] bg-white shadow-[0_28px_50px_-36px_rgba(40,20,40,0.45)]">
          <img
            src="/clinic/stree-women.webp"
            alt="Five women standing with the Stree Clinic mark. For women of all ages."
            width={1600}
            height={900}
            className="h-auto w-full object-cover"
          />
        </figure>
      </div>
    </section>
  );
}
