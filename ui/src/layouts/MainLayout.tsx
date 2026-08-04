// src/layouts/MainLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Store, HelpCircle, Mail, X, Power, ChevronRight, FileText, Bell, Shield, Settings, User, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useUIStore } from '../store/useUIStore';
import { useState } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MainLayout() {
  const { isSidebarOpen, isInboxOpen, toggleSidebar, toggleInbox, closeAll } = useUIStore();

  return (
    <div className="flex flex-col h-[100dvh] bg-bg-base text-text-primary relative overflow-hidden">
      {/* Topbar */}
      <header className="absolute top-0 left-0 w-full z-40 bg-bg-base/90 backdrop-blur-md border-b border-border-subtle px-6 py-4 flex justify-between items-center">
        <div className="font-extrabold tracking-tight text-xl text-accent">Neo<span className="text-text-primary">Bank</span></div>
        <div className="flex items-center gap-3">
          <button onClick={toggleInbox} className="interactive-item relative p-2 bg-bg-surface border border-border-subtle rounded-full">
            <Mail className="w-5 h-5 text-text-primary" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-bg-surface" />
          </button>
          <button onClick={toggleSidebar} className="interactive-item w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-accent/20">
            AG
          </button>
        </div>
      </header>

      <SidebarMenu isOpen={isSidebarOpen} onClose={closeAll} />
      <InboxPanel isOpen={isInboxOpen} onClose={closeAll} />

      <main className="flex-1 overflow-y-auto pb-24 pt-20 h-full scroll-smooth">
        <Outlet />
      </main>

      {/* Bottom Nav: Ahora ocupa todo el ancho y es mucho más visible */}
      <div className="fixed bottom-0 left-0 w-full z-30 bg-bg-surface/85 backdrop-blur-2xl border-t border-border-subtle pb-safe">
        <nav className="flex items-center justify-between w-full max-w-md mx-auto px-6 py-3">
          {[
            { to: "/", icon: Home, label: "Inicio" },
            { to: "/products", icon: LayoutGrid, label: "Productos" },
            { to: "/contract", icon: Store, label: "Contratar" },
            { to: "/help", icon: HelpCircle, label: "Ayuda" }
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center w-16 gap-1 cursor-pointer transition-colors"
            >
              {({ isActive }) => (
                <>
                  <div className={cn("p-1.5 rounded-full transition-all duration-300", isActive ? "bg-accent/10 text-accent" : "text-text-secondary")}>
                    <item.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={cn("text-[10px] font-semibold transition-all", isActive ? "text-accent" : "text-text-secondary")}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

/* --- MENU LATERAL (PERFIL) --- */
function SidebarMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  const handleSubMenuClick = (title: string) => {
    if (title === "Datos personales") setActiveSubMenu("personal");
  };

  return (
    <div className={cn("fixed inset-0 z-50 transition-all duration-500 ease-in-out", isOpen ? "visible" : "invisible pointer-events-none")}>
      <div className={cn("absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose} />
      
      <div className={cn("absolute top-0 right-0 w-full max-w-[380px] h-full bg-bg-base border-l border-border-subtle shadow-2xl transition-transform duration-500 ease-out flex flex-col", isOpen ? "translate-x-0" : "translate-x-full")}>
        
        <div className={cn("flex-1 flex flex-col transition-all duration-300", activeSubMenu ? "-translate-x-full absolute w-full h-full opacity-0" : "translate-x-0 opacity-100")}>
          <div className="px-6 pt-12 pb-6 flex justify-between items-start border-b border-border-subtle bg-bg-surface">
            <div className="flex flex-col gap-3">
              <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-accent/20">AG</div>
              <h2 className="text-[26px] font-bold tracking-tight leading-none text-white">Álvaro<br/>Gallardo</h2>
            </div>
            <div className="flex flex-col items-end gap-4">
              <button onClick={onClose} className="p-2 bg-bg-elevated hover:bg-border-subtle rounded-full transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
              <button className="text-danger flex items-center gap-1.5 text-sm font-bold bg-danger/10 hover:bg-danger/20 px-4 py-2 rounded-full transition-colors cursor-pointer">
                <Power className="w-4 h-4" /> Salir
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="flex flex-col gap-2">
              {[
                { icon: User, title: "Datos personales", desc: "Móvil, email, domicilio, DNI" },
                { icon: Settings, title: "Configuración", desc: "Idioma, notificaciones, cuentas" },
                { icon: Shield, title: "Privacidad", desc: "Gestión de consentimientos" },
                { icon: Shield, title: "Seguridad", desc: "Contraseña, dispositivos" }
              ].map((item, i) => (
                <button key={i} onClick={() => handleSubMenuClick(item.title)} className="interactive-item w-full flex items-center justify-between p-4 rounded-2xl text-left group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center text-accent"><item.icon className="w-5 h-5" /></div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[15px] text-white">{item.title}</span>
                      <span className="text-[13px] text-text-secondary">{item.desc}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-bg-surface border-t border-border-subtle text-[13px] text-text-secondary">
            <p className="font-medium">Último acceso: Hoy a las 21:20</p>
            <p className="mt-1 opacity-70">Versión 4.2616.1 (Enterprise)</p>
          </div>
        </div>

        {/* Submenú: Datos Personales */}
        <div className={cn("flex-1 flex flex-col transition-all duration-300 absolute w-full h-full bg-bg-base", activeSubMenu === 'personal' ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none")}>
           <div className="px-6 pt-12 pb-4 flex items-center gap-4 border-b border-border-subtle bg-bg-surface">
             <button onClick={() => setActiveSubMenu(null)} className="p-2 bg-bg-elevated hover:bg-border-subtle rounded-full transition-colors cursor-pointer rotate-180"><ChevronRight className="w-5 h-5" /></button>
             <h2 className="text-xl font-bold tracking-tight text-white">Datos personales</h2>
           </div>
           <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
             <div className="interactive-item p-4 bg-bg-surface border border-border-subtle rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Móvil personal</p>
                  <p className="font-bold text-[15px] text-white">+34 600 000 000</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary" />
             </div>
             <div className="interactive-item p-4 bg-bg-surface border border-border-subtle rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Email</p>
                  <p className="font-bold text-[15px] text-white">alvaro@example.com</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary" />
             </div>
             <div className="interactive-item p-4 bg-bg-surface border border-border-subtle rounded-2xl group">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-[15px] text-white">Domicilio fiscal</p>
                  <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-accent" />
                </div>
                <p className="text-sm text-text-secondary">Calle Falsa 123, 4ºB<br/>28080 Madrid</p>
             </div>
             <div className="interactive-item p-4 bg-bg-surface border border-border-subtle rounded-2xl group">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-[15px] text-white">Documento identificativo</p>
                  <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-accent" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                   <CheckCircle2 className="w-4 h-4 text-success" />
                   <span className="text-sm text-success font-medium">DNI Verificado</span>
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}

/* --- BUZÓN --- */
function InboxPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <div className={cn("fixed inset-0 z-50 transition-all duration-500 ease-in-out", isOpen ? "visible" : "invisible pointer-events-none")}>
      <div className={cn("absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <div className={cn("absolute top-0 right-0 w-full max-w-[380px] h-full bg-bg-base border-l border-border-subtle shadow-2xl transition-transform duration-500 ease-out flex flex-col", isOpen ? "translate-x-0" : "translate-x-full")}>
        <div className="px-6 pt-12 pb-6 flex justify-between items-center border-b border-border-subtle bg-bg-surface">
          <h2 className="text-[28px] font-bold tracking-tight text-white">Buzón</h2>
          <button onClick={onClose} className="p-2 bg-bg-elevated hover:bg-border-subtle rounded-full transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">
           <div className="flex flex-col gap-4">
              <div className="interactive-item p-5 rounded-3xl bg-bg-surface border border-border-subtle group">
                 <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3"><div className="p-2.5 bg-accent/10 rounded-xl"><Bell className="w-5 h-5 text-accent"/></div><span className="font-bold text-lg text-white">Notificaciones</span></div>
                    <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
                 </div>
                 <p className="text-sm text-text-secondary leading-relaxed">Avisos relacionados con tus operaciones o movimientos recientes.</p>
              </div>
              <div className="interactive-item p-5 rounded-3xl bg-bg-surface border border-border-subtle group">
                 <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3"><div className="p-2.5 bg-bg-elevated rounded-xl"><FileText className="w-5 h-5 text-white"/></div><span className="font-bold text-lg text-white">Comunicados</span></div>
                    <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
                 </div>
                 <p className="text-sm text-text-secondary leading-relaxed">Informes mensuales, liquidaciones, facturas y extractos detallados.</p>
              </div>
              <div className="interactive-item p-5 rounded-3xl bg-bg-surface border border-border-subtle group">
                 <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3"><div className="p-2.5 bg-bg-elevated rounded-xl"><Store className="w-5 h-5 text-white"/></div><span className="font-bold text-lg text-white">Contratos</span></div>
                    <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
                 </div>
                 <p className="text-sm text-text-secondary leading-relaxed">Contratos de productos y órdenes de transferencias.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}