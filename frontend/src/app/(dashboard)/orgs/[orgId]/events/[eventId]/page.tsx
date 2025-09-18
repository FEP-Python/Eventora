interface EventIdPageProps {
    params: Promise<{
        orgId: string,
        eventId: string,
    }>
}

const EventIdPage = async ({ params }: EventIdPageProps) => {
    const { orgId, eventId } = await params;
    return (
        <div>
            OrgId: {orgId}
            <br />
            eventId: {eventId}
        </div>
    )
}

export default EventIdPage;