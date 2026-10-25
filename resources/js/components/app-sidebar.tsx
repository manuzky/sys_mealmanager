import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { User, Folder, BookUser, Tag, LayoutGrid, Shield, MapPinHouse, Utensils, ShoppingCart, NotebookText  } from 'lucide-react';
import AppLogo from './app-logo';
import { useCan } from '@/lib/useCan';
import { Settings } from 'lucide-react';

const platformItems: NavItem[] = [
    {
        title: 'Panel Principal',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Pedidos',
        url: '/meal-requests',
        icon: ShoppingCart ,
        // permission: 'meals.view',
    },
    {
        title: 'Comidas',
        url: '/meals',
        icon: Utensils,
        permission: 'meals.view',
    },
    {
        title: 'Reportes',
        url: '/reports',
        icon: NotebookText,
        // permission: 'meals.view',
    },
];

const adminItems: NavItem[] = [
    {
        title: 'Personal',
        url: '/personnel',
        icon: BookUser,
        permission: 'personnel.view',
    },
    {
        title: 'Cargos',
        url: '/positions',
        icon: Tag,
        permission: 'positions.view',
    },
    {
        title: 'Usuarios',
        url: '/users',
        icon: User,
        permission: 'users.view',
    },
    {
        title: 'Roles y Permisos',
        url: '/roles',
        icon: Shield,
        permission: 'roles.view',
    },
    {
        title: 'Areas',
        url: '/areas',
        icon: MapPinHouse,
        permission: 'areas.view',
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     url: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     url: 'https://laravel.com/docs/starter-kits',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { can } = useCan();

    const filteredAdminItems = adminItems.filter(item => {
        if (!item.permission) return true;
        return can(item.permission);
    });

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    platformItems={platformItems}
                    adminGroup={{
                        title: 'Configuración',
                        icon: Settings,
                        items: filteredAdminItems,
                    }}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
