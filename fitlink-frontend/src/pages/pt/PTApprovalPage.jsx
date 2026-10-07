import { useEffect } from "react";
import PTMainLayout from "@/layouts/pt/PTMainLayout";
import { ptGetMyLatestRequest } from "@/services/ptApprovalService";
import { useState } from "react";

export default function PTApprovalPage() {
    const [request, setRequest] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const res = await ptGetMyLatestRequest();
            // setRequest(res.request || null);
            console.log("PTApprovalPage: ", res);
        }

        fetchData();

    }, [request]);

    return (
        <PTMainLayout>
            <div>PT Approval Page</div>
        </PTMainLayout>
    );
}
