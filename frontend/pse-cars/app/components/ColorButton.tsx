export default function ColorButton({
  color,
  className,
  onClick,
}: {
  color: string;
  className?: string;
  onClick?: () => void;
}) {
  const baseStyles = "transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary";
  return (
    <button
      className={`${baseStyles} ${className}`}
      style={{backgroundColor: color, borderColor: "white", borderRadius: "50%", width: "3rem", height: "3rem"}}
      onClick={onClick}
    >

    </button>
  );
}
