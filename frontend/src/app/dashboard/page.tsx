import { Dashboard } from '@/components/dashboard';
import { OrganizationGuard } from '@/components/dashboard/organization/org-guard';

const DashboardPage = () => {
    return (
        <OrganizationGuard>
            <Dashboard />
        </OrganizationGuard>
    );
}

export default DashboardPage;
