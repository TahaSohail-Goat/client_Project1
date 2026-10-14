type EditorialHeadingProps = {
  as?: "h1" | "h2" | "h3";
  lead: string;
  emphasis?: string;
  className?: string;
  id?: string;
};

/** A consistent structural-sans + expressive-serif headline lockup. */
export function EditorialHeading({
  as: Tag = "h2",
  lead,
  emphasis,
  className = "",
  id,
}: EditorialHeadingProps) {
  return (
    <Tag id={id} className={`editorial-heading ${className}`.trim()}>
      <span className="editorial-heading__line">
        <span>{lead}</span>
      </span>
      {emphasis && (
        <span className="editorial-heading__line editorial-heading__line--italic">
          <em>{emphasis}</em>
        </span>
      )}
    </Tag>
  );
}
