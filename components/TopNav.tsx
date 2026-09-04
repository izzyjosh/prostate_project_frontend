import BrandMark from "./BrandMark";
import Button from "./Button";

export default function TopNav() {
  return (
    <nav className="sticky top-0 z-[100] flex items-center justify-between bg-navy px-[5%] py-4">
      <div className="flex items-center gap-3">
        <BrandMark />
        <div className="flex flex-col">
          <span className="font-display text-[1.1rem] leading-none text-white">
            Prostatecare
          </span>
          <span className="mt-0.5 text-[0.68rem] tracking-wide text-white/45">
            Clinical Decision Support System
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost-nav" href="/login">
          Sign In
        </Button>
        <Button variant="nav-primary" href="/register">
          Register as Patient
        </Button>
      </div>
    </nav>
  );
}
