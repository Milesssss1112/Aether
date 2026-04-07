export const easeCosmic: [number, number, number, number] = [0.4, 0, 0.2, 1];

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: easeCosmic },
};

export const cardHover = {
  y: -4,
  scale: 1.02,
  transition: { duration: 0.3, ease: easeCosmic },
};
