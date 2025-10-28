import { Suspense } from "react";
import { Client } from "./client";

export default function JoinClubPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Client />
        </Suspense>
    );
}
