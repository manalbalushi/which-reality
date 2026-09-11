import { clsx } from "clsx";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-lg border border-slate-200">
      <table className={clsx("w-full min-w-max text-left text-sm", className)}>{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</thead>;
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={clsx("whitespace-nowrap px-4 py-3", className)}>{children}</th>;
}

export function Td({ children, className, title }: { children?: React.ReactNode; className?: string; title?: string }) {
  return (
    <td className={clsx("whitespace-nowrap px-4 py-3 text-slate-700", className)} title={title}>
      {children}
    </td>
  );
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={clsx("border-t border-slate-100 hover:bg-slate-50/70", className)}>{children}</tr>;
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}
