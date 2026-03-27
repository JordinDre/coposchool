import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { useRoles as useRolesHook } from '@/hooks/use-roles'; // Safer to use the direct file if I know it exists
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user: User | null; showEmail?: boolean }) {
    const getInitials = useInitials();
    const { roles } = useRolesHook();

    if (!user) {
        return null;
    }

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium dark:text-white">{user.name}</span>
                <div className="flex flex-col gap-0.5">
                    {roles.length > 0 ? (
                        <span className="truncate text-xs text-muted-foreground capitalize">{roles[0]}</span>
                    ) : (
                        <span className="truncate text-xs text-muted-foreground">Sin Rol</span>
                    )}
                    {showEmail && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
                </div>
            </div>
        </>
    );
}
