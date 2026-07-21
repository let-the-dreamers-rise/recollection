import { ResponseForm } from "./response-form";
export default async function RespondPage({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <ResponseForm token={token} />; }
