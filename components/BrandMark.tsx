export default function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <div
      className={
        small
          ? "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] bg-gradient-to-br from-teal to-teal-light font-display text-sm text-white"
          : "flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-teal to-teal-light font-display text-xl text-white"
      }
    >
      P
    </div>
  );
}
