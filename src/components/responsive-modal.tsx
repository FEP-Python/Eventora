import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ResponsiveModalProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
}

export const ResponsiveModal = ({ children, open, onOpenChange, title }: ResponsiveModalProps) => {
    const isMobile = useIsMobile();

    if (!isMobile) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full sm:max-w-lg border-none overflow-y-auto hide-scrollbar max-h-[85vh]">
                    <DialogHeader className="mb-2">
                        <DialogTitle>
                            {title}
                        </DialogTitle>
                    </DialogHeader>
                    {children}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader className="mb-2">
                    <DrawerTitle>
                        {title}
                    </DrawerTitle>
                </DrawerHeader>
                <div className="overflow-y-auto hide-scrollbar max-h-[85vh]">
                    {children}
                </div>
            </DrawerContent>
        </Drawer>
    )
}
