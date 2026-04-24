import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  BrandMark,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  SectionBadge,
  Select,
} from '@bocam/ui-core';
import { useTenant } from '../context/TenantContext';

const IconShield = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </svg>
);

const IconBuilding = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
    <path d="M8 14h.01" />
    <path d="M16 14h.01" />
  </svg>
);

const IconMail = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const DEV_TENANTS = [
  { id: '11111111-aaaa-bbbb-cccc-111111111111', name: 'Tenant Demo A' },
  { id: '22222222-aaaa-bbbb-cccc-222222222222', name: 'Tenant Demo B' },
];

export const LoginView: React.FC = () => {
  const { login, loginDemo, loginError } = useTenant();
  const [email, setEmail] = useState('admin@alfa.bocam.com');
  const [password, setPassword] = useState('Admin.2026');
  const [tenantId, setTenantId] = useState(DEV_TENANTS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      await login(email, password, tenantId);
    } catch {
      setLocalError(loginError || 'Error al iniciar sesion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const error = localError || loginError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 px-4 py-12 font-sans">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md items-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex w-fit items-center justify-center rounded-2xl border border-border/40 bg-card p-3 shadow-sm">
              <BrandMark label="Tenant Shell" className="h-12 w-12" />
              <IconShield className="-ml-2 h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter text-foreground">Portal de Acceso</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Shell multi-tenant para modulos operativos
            </p>
          </div>

          <Card className="border-border/40 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle>Iniciar Sesion</CardTitle>
              <CardDescription className="font-medium leading-relaxed text-balance">
                Ingresa tus credenciales y selecciona la organizacion de trabajo.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {error ? (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/10 bg-destructive/5 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <span className="text-xs font-semibold leading-relaxed text-destructive">{error}</span>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField label="Organizacion">
                  <div className="group relative">
                    <IconBuilding className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Select
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      id="login-tenant-select"
                      className="bg-background py-3 pl-11 pr-10"
                    >
                      {DEV_TENANTS.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </option>
                      ))}
                    </Select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-50">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M1 1L5 5L9 1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </FormField>

                <FormField label="Correo Corporativo">
                  <div className="group relative">
                    <IconMail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@empresa.com"
                      required
                      id="login-email-input"
                      className="bg-background py-3 pl-11 pr-4"
                    />
                  </div>
                </FormField>

                <FormField label="Contrasena">
                  <div className="group relative">
                    <IconLock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      id="login-password-input"
                      className="bg-background py-3 pl-11 pr-4"
                    />
                  </div>
                </FormField>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  id="login-submit-btn"
                  className="mt-4 h-14 w-full shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    'Acceder al Ecosistema'
                  )}
                </Button>
              </form>

              <div className="border-t border-border/40 pt-5 space-y-4">
                <button
                  type="button"
                  onClick={loginDemo}
                  className="w-full rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/10 hover:border-primary/50"
                >
                  ⚡ Explorar sistema en modo demo
                </button>
                <div className="text-center">
                  <SectionBadge className="shadow-inner">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Sesion segura via JWT
                  </SectionBadge>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Plataforma white-label multi-tenant
          </p>
        </div>
      </div>
    </div>
  );
};
