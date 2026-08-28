import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    LayoutDashboard,
    UsersRound,
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
import { calendar, dashboard } from '@/routes';
import { index as adminClassroom } from '@/routes/admin/classroom';
import { index as adminMembers } from '@/routes/admin/members';
import { index as classroom } from '@/routes/classroom';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Classroom',
        href: classroom(),
        icon: BookOpen,
    },
    {
        title: 'Calendar',
        href: calendar(),
        icon: CalendarDays,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const navigationItems: NavItem[] =
        auth.user.role === 'admin'
            ? [
                  ...mainNavItems.map((item) =>
                      item.title === 'Classroom'
                          ? { ...item, href: adminClassroom() }
                          : item,
                  ),
                  {
                      title: 'Members',
                      href: adminMembers(),
                      icon: UsersRound,
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
