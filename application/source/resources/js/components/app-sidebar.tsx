import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    LayoutDashboard,
    MessageSquareText,
    Search,
    Settings2,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Classroom',
        href: '/dashboard#classroom',
        icon: BookOpen,
    },
    {
        title: 'Community',
        href: '/dashboard#community',
        icon: MessageSquareText,
    },
    {
        title: 'Calendar',
        href: '/dashboard#calendar',
        icon: CalendarDays,
    },
    {
        title: 'Search',
        href: '/dashboard#search',
        icon: Search,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const navigationItems: NavItem[] =
        auth.user.role === 'admin'
            ? [
                  ...mainNavItems.map((item) =>
                      item.title === 'Classroom'
                          ? { ...item, href: '/admin/classroom' }
                          : item,
                  ),
                  {
                      title: 'Admin',
                      href: '/admin/sessions',
                      icon: Settings2,
                  },
              ]
            : mainNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navigationItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
