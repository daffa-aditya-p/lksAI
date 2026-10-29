import Image from "next/image";

/**
 * Logo SATU AI — gambar dari /public/logo.png.
 * `withWordmark` menampilkan teks "SATU AI" di samping logo.
 */
export function Logo({
  size = 32,
  withWordmark = false,
  className = "",
  dark = false,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
  dark?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      suppressHydrationWarning
    >
      <Image
        src="/logo-no-background.png"
        alt="Logo SATU AI"
        width={size}
        height={size}
        priority
        className="object-contain"
      />
      {withWordmark && (
        <span className="flex flex-col leading-none" suppressHydrationWarning>
          <span
            className={`text-base font-black tracking-tight ${dark ? "text-white" : "text-slate-900"}`}
            suppressHydrationWarning
          >
            SATU <span className="text-[#15B2C6]" suppressHydrationWarning>AI</span>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-[#FFA800] ml-1 mb-2 align-middle"
              suppressHydrationWarning
            ></span>
          </span>
        </span>
      )}
    </span>
  );
}
