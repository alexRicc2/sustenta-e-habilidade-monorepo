import type { ReactNode } from "react";

export function OdsLink({
  children = "ODS",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <a href="#ods" className={className}>
      {children}
    </a>
  );
}

export function EventTagline({
  className,
  odsClassName,
}: {
  className?: string;
  odsClassName?: string;
}) {
  return (
    <p className={className}>
      Ações e Inovações em Química na Busca dos{" "}
      <OdsLink className={odsClassName}>ODS</OdsLink>
    </p>
  );
}
