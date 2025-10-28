'use client';

import { useOrgStore } from '@/hooks/use-org-store';
import { useUserAllOrgs } from '@/hooks/use-users-org';

const DashboardPage = () => {
    const { setActiveOrg, activeOrg } = useOrgStore();
    const { data: orgs = [], isLoading, error } = useUserAllOrgs();

    if(isLoading) {
        return <div>Loading dashboard...</div>
    }

    if (error) {
        return <div>Error loading dashboard</div>;
    }

    // if (!hasOrganizations && orgs.length === 0) {
    //     return router.push('/create-org');
    // }

    if(orgs && orgs.length !== 0 && !activeOrg) {
        setActiveOrg(orgs[0]);
    }
}

export default DashboardPage;
