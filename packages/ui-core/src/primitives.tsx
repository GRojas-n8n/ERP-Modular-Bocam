import * as React from 'react';

function toClassName(value: unknown): string {
  if (!value) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(toClassName).filter(Boolean).join(' ');
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key)
      .join(' ');
  }

  return String(value);
}

export function cn(...values: unknown[]): string {
  return values.map(toClassName).filter(Boolean).join(' ');
}

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'icon';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:brightness-110 shadow-sm',
  outline: 'border border-border/50 bg-card text-foreground hover:bg-muted',
  ghost: 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
  destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/15',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  icon: 'h-10 w-10',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  );
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-2xl border border-border/40 bg-card shadow-sm', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-xl font-bold text-foreground', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function EmptyStatePanel({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className={cn('border-dashed border-border/60', className)} {...props}>
      <CardContent className="space-y-4 p-16 text-center">
        {icon ? <div className="flex justify-center">{icon}</div> : null}
        <div className="space-y-1">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
          {description ? (
            <p className="mx-auto max-w-xl text-[11px] text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex justify-center">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

export function BrandMark({
  label,
  logoUrl,
  className,
}: {
  label: string;
  logoUrl?: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <div className={cn('flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-card', className)}>
        <img src={logoUrl} alt={label} className="h-full w-full object-cover" />
      </div>
    );
  }

  const fallback = label.trim().charAt(0).toUpperCase() || 'T';
  return (
    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground shadow-sm', className)}>
      {fallback}
    </div>
  );
}

export function SectionBadge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground', className)}
      {...props}
    />
  );
}

export function FieldLabel({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn(
        'flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
      {required ? <span className="text-destructive">*</span> : null}
    </label>
  );
}

export function FieldHint({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-[9px] font-medium text-muted-foreground/70', className)} {...props} />;
}

export function FormField({
  className,
  label,
  required,
  hint,
  children,
}: React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
      {hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}

export const formControlClassName =
  'w-full rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-sm font-medium text-foreground transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(formControlClassName, className)} {...props} />;
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(formControlClassName, 'min-h-[100px] resize-none', className)}
      {...props}
    />
  );
});

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(formControlClassName, 'cursor-pointer appearance-none', className)}
      {...props}
    >
      {children}
    </select>
  );
});

export interface SideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  topSlot?: React.ReactNode;
  maxWidthClassName?: string;
  overlayClassName?: string;
  panelClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
  closeAriaLabel?: string;
}

export function SideSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  topSlot,
  maxWidthClassName = 'max-w-lg',
  overlayClassName,
  panelClassName,
  headerClassName,
  contentClassName,
  showCloseButton = true,
  closeAriaLabel = 'Cerrar panel',
}: SideSheetProps) {
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);

      return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener('keydown', handleEsc);
      };
    }

    return undefined;
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={cn(
          'absolute inset-0 animate-in fade-in bg-black/40 backdrop-blur-sm duration-300',
          overlayClassName
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'relative flex h-full w-full animate-in slide-in-from-right flex-col overflow-hidden bg-card shadow-2xl duration-300',
          maxWidthClassName,
          panelClassName
        )}
      >
        {topSlot}

        {title || description || showCloseButton ? (
          <div
            className={cn(
              'flex items-center justify-between border-b border-border/40 px-8 py-6',
              headerClassName
            )}
          >
            <div>
              {title ? (
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            {showCloseButton ? (
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                size="icon"
                aria-label={closeAriaLabel}
                className="bg-muted/50 hover:bg-muted"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className={cn('flex-1 overflow-y-auto px-8 py-6', contentClassName)}>{children}</div>
      </div>
    </div>
  );
}

export function TableContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('overflow-x-auto', className)} {...props} />;
}

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full text-left', className)} {...props} />;
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('border-b border-border/40 bg-muted/30', className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-border/20', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('transition-colors hover:bg-primary/[0.02]', className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground md:px-6',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-5 md:px-6', className)} {...props} />;
}

export function TableFooterBar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-border/40 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6',
        className
      )}
      {...props}
    />
  );
}
