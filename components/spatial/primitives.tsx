import type { ComponentPropsWithoutRef, ReactNode } from "react"

type PrimitiveProps = ComponentPropsWithoutRef<"section"> & {
  eyebrow?: string
  title?: string
  children: ReactNode
}

export function SpatialSection({ eyebrow, title, children, className = "", ...props }: PrimitiveProps) {
  return (
    <section className={`spatial-section ${className}`.trim()} {...props}>
      {eyebrow ? <p className="spatial-eyebrow">{eyebrow}</p> : null}
      {title ? <h2 className="spatial-heading">{title}</h2> : null}
      <div className="spatial-copy">{children}</div>
    </section>
  )
}

export function SpatialCard({ children, className = "", ...props }: ComponentPropsWithoutRef<"article">) {
  return (
    <article className={`spatial-card ${className}`.trim()} {...props}>
      {children}
    </article>
  )
}
