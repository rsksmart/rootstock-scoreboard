import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarLinkProps {
  href: string;
  icon: string;
  label: string;
  requiredRole?: number;
  badge?: string;
}

export default function SidebarLink({ href, icon, label, badge }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all
        ${isActive
          ? 'bg-custom-green/10 border-l-4 border-custom-green text-custom-green font-semibold'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border-l-4 border-transparent'
        }
      `}
    >
      <span className="text-lg sm:text-xl">{icon}</span>
      <span className="text-sm sm:text-base flex-1">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 text-xs bg-custom-green/20 text-custom-green rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}
