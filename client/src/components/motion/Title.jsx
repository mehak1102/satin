import { motion, useInView, useReducedMotion } from "framer-motion";
import { Children, Fragment, cloneElement, isValidElement, useRef } from "react";

export const dropLine = { hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } } };

const still = { hidden: { opacity: 1 }, show: { opacity: 1 } };
const drop = {
  hidden: { opacity: 0, y: "-0.5em", filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.3, ease: [0.33, 1, 0.68, 1] } },
};

// Words drop in one after another; the parent heading drives them with `dropLine`.
export function DropText({ text, reduce }) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => (
      <Fragment key={`${word}-${index}`}>
        {index > 0 && " "}
        <motion.span variants={reduce ? still : drop} className="inline-block">
          {word}
        </motion.span>
      </Fragment>
    ));
}

function DropWords({ children, reduce }) {
  return Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") return <DropText text={String(child)} reduce={reduce} />;
    if (!isValidElement(child)) return child;
    if (typeof child.props.children === "string") return cloneElement(child, undefined, <DropText text={child.props.children} reduce={reduce} />);
    return (
      <motion.span variants={reduce ? still : drop} className="inline-block">
        {child}
      </motion.span>
    );
  });
}

// Any page heading: drops in word by word the first time it scrolls into view. `animate` (rather
// than whileInView) lets words that mount later, when the heading text changes, drop in too.
export function Title({ as = "h2", children, ...props }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const seen = useInView(ref, { once: true });
  const Tag = motion[as];

  return (
    <Tag ref={ref} initial={reduce ? false : "hidden"} animate={seen || reduce ? "show" : "hidden"} variants={dropLine} {...props}>
      <DropWords reduce={reduce}>{children}</DropWords>
    </Tag>
  );
}
