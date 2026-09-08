export function Wave({
  className,
  fill = "#f6faf3",
  flip = false,
}: {
  className?: string;
  fill?: string;
  flip?: boolean;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      className={`${className ?? ""} ${flip ? "rotate-180" : ""} w-full h-14 md:h-20`}
    >
      <path
        fill={fill}
        d="M0 40 C180 90 360 0 540 40 C720 80 900 10 1080 45 C1260 80 1380 20 1440 40 L1440 90 L0 90 Z"
      />
    </svg>
  );
}
