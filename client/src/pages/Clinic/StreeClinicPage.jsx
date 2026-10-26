// import {
//   Baby,
//   DoorOpen,
//   HeartPulse,
//   ScanLine,
//   Shield,
//   ShoppingBag,
//   Sprout,
//   Stethoscope,
//   Syringe,
//   UserRound,
//   HeartHandshake,
// } from "lucide-react";
// import { Link } from "react-router-dom";
// import { PageHero } from "../../components/layout/PageHero";
// import { PageMeta } from "../../components/seo/PageMeta";
// import { Title } from "../../components/motion/Title";

// const stats = [
//   ["30", "Clinics"],
//   ["11", "States"],
//   ["15", "Key cities"],
// ];

// const values = ["Quality healthcare", "Accessible to all", "Affordable"];

// const states = [
//   "Delhi",
//   "Uttar Pradesh",
//   "West Bengal",
//   "Bihar",
//   "Chhattisgarh",
//   "Gujarat",
//   "Karnataka",
//   "Madhya Pradesh",
//   "Rajasthan",
//   "Odisha",
//   "Haryana",
// ];

// const services = [
//   { icon: Stethoscope, name: "Gynae consultations & procedures" },
//   { icon: HeartPulse, name: "Preventive health packages" },
//   { icon: Shield, name: "Contraception & family planning" },
//   { icon: Syringe, name: "Vaccinations & immunisations" },
//   { icon: HeartHandshake, name: "Safe & legal abortion services" },
//   { icon: Baby, name: "Pre-pregnancy & post-delivery care" },
//   { icon: ScanLine, name: "Cancer screening" },
//   { icon: Sprout, name: "Stree natural fertility consultations" },
//   { icon: DoorOpen, name: "Walk-in & walk-out services" },
//   { icon: ShoppingBag, name: "Reproductive health products" },
//   { icon: UserRound, name: "General health consultation" },
// ];

// export function StreeClinicPage() {
//   return (
//     <>
//       <PageMeta
//         title="Stree Clinic — Satin"
//         description="If you want medical assistance, visit Stree Clinic. A unit of Parivar Seva Sanstha, for women of all ages."
//         path="/stree-clinic"
//         image="/clinic/stree-women.webp"
//       />
//       <article className="mx-auto max-w-6xl px-5 pt-10 pb-24 text-ink sm:px-8">
//         <p className="text-sm text-ink-soft">
//           <Link to="/" className="underline underline-offset-4">
//             Home
//           </Link>
//           <span aria-hidden="true"> / </span>
//           Stree Clinic
//         </p>

//         <div className="mt-8">
//           <PageHero eyebrow="Parivar Seva Sanstha" title="Stree Clinic" size="md">
//             <p>
//               If you want medical assistance, visit Stree Clinic. Satin sells pads. Clinicians sit at the clinic — a unit of Parivar Seva Sanstha, established 1978, for women of all ages.
//             </p>
//           </PageHero>
//         </div>

//         <figure className="mt-12 overflow-hidden rounded-[32px] bg-[#f3d9de]">
//           <img
//             src="/clinic/stree-women.webp"
//             alt="Five women with the Stree Clinic mark. For women of all ages. A unit of Parivar Seva Sanstha."
//             width={1600}
//             height={900}
//             className="h-auto w-full object-cover object-[center_20%]"
//           />
//         </figure>

//         <ul className="mt-10 grid grid-cols-3 gap-3 sm:gap-6">
//           {stats.map(([value, label]) => (
//             <li key={label} className="rounded-[24px] border border-line bg-white/70 px-3 py-5 text-center sm:px-6 sm:py-8">
//               <p className="font-display text-[clamp(2rem,6vw,3.5rem)] leading-none font-medium">{value}</p>
//               <p className="mt-2 text-[11px] tracking-[0.18em] text-ink-soft uppercase">{label}</p>
//             </li>
//           ))}
//         </ul>

//         <ul className="mt-4 flex flex-wrap gap-2">
//           {values.map((value) => (
//             <li key={value} className="rounded-full bg-[#f7eef4] px-4 py-2 text-sm text-ink">
//               {value}
//             </li>
//           ))}
//         </ul>

//         <section className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
//           <div>
//             <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">Across India</p>
//             <Title as="h2" className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-tight font-medium">
//               Clinics in 11 states and 15 key cities.
//             </Title>
//             <p className="mt-4 text-sm leading-7 text-ink-soft">
//               Stree Clinic lists thirty clinics. The map is from their published network art. Ask a clinic for hours and whether a service is offered that day.
//             </p>
//             <ul className="mt-6 flex flex-wrap gap-2">
//               {states.map((state) => (
//                 <li key={state} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs tracking-wide text-ink">
//                   {state}
//                 </li>
//               ))}
//             </ul>
//           </div>
//           <figure className="overflow-hidden rounded-[28px]">
//             <img
//               src="/clinic/stree-network.png"
//               alt="Stree Clinic network map of India, with 30 clinics, 15 states, and a circle of life-stage care."
//               width={1600}
//               height={900}
//               className="h-auto w-full object-contain"
//             />
//           </figure>
//         </section>

//         <section className="mt-20">
//           <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">On their list</p>
//           <Title as="h2" className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-tight font-medium">
//             Services Stree Clinic publishes.
//           </Title>
//           <p className="mt-4 max-w-xl text-sm leading-7 text-ink-soft">
//             Copied from Stree Clinic’s services menu. This shop does not book appointments or give medical advice.
//           </p>
//           <ol className="mt-10 grid gap-3 sm:grid-cols-2">
//             {services.map((service, index) => {
//               const Icon = service.icon;
//               return (
//                 <li
//                   key={service.name}
//                   className="flex items-start gap-4 rounded-[22px] border border-line bg-white/80 px-4 py-4"
//                 >
//                   <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f7eef4] text-plum">
//                     <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
//                   </span>
//                   <span>
//                     <span className="block text-[11px] tracking-[0.2em] text-ink-soft uppercase">
//                       {String(index + 1).padStart(2, "0")}
//                     </span>
//                     <span className="mt-1 block font-display text-xl leading-snug">{service.name}</span>
//                   </span>
//                 </li>
//               );
//             })}
//           </ol>
//         </section>

//         <section className="mt-20">
//           <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">Find a clinic</p>
//           <Title as="h2" className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-tight font-medium">
//             Addresses as Stree Clinic printed them.
//           </Title>
//           <p className="mt-4 max-w-xl text-sm leading-7 text-ink-soft">
//             Zoom the poster if a line is small. Call the number on that card before you travel.
//           </p>
//           <figure className="mt-8 overflow-auto rounded-[28px]">
//             <img
//               src="/clinic/stree-clinics.png"
//               alt="Poster of 30 Stree Clinics in 11 states and 15 key cities of India, with addresses and phone numbers."
//               width={1600}
//               height={2000}
//               className="mx-auto h-auto w-full min-w-[640px] object-contain"
//             />
//           </figure>
//         </section>

//         <p className="mt-12 max-w-2xl text-sm leading-7 text-ink-soft">
//           Satin is a pad shop. Stree Clinic is where to take health questions. Customer care: customercare@parivarseva.org · 011-24335055 · toll free 1800-123-7075.
//         </p>
//       </article>
//     </>
//   );
// }
import { useEffect } from "react";

export function StreeClinicPage() {
  useEffect(() => {
    window.location.replace("https://www.streeclinic.com/");
  }, []);

  return null;
}