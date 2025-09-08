'use client';

import { useRouter } from 'next/navigation';
import { useOrgStore } from '@/hooks/use-org-store';
import { useUserAllOrgs } from '@/hooks/use-users-org';

const DashboardPage = () => {
    const router = useRouter();
    const { setActiveOrg } = useOrgStore();
    const { data: orgs = [], isLoading, error, hasOrganizations } = useUserAllOrgs();

    if(isLoading) {
        return <div>Loading dashboard...</div>
    }

    if (error) {
        return <div>Error loading dashboard</div>;
    }

    if (!hasOrganizations) {
        return router.push('/create-org');
    }

    if(orgs && orgs.length !== 0) {
        setActiveOrg(orgs[0]);
    }
}

export default DashboardPage;
