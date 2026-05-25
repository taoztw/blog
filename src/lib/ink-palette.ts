export const INK_PALETTE = [
  "#C23B22",
  "#B8863E",
  "#5B7A5E",
  "#5C7A8A",
  "#7A6B8A",
  "#8B6F47",
  "#6B7B7A",
  "#A0826D",
  "#5C5751",
  "#8B4040",
  "#4A6741",
  "#A0522D",
] as const;

export const pickRandomInkColor = () =>
  INK_PALETTE[Math.floor(Math.random() * INK_PALETTE.length)]!;
