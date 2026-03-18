import { auth } from "@/lib/auth";

export default async function TestAuthPage() {
  const session = await auth();
  
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <pre className="p-4 bg-gray-100 rounded">
        {JSON.stringify(session, null, 2)}
      </pre>
      {!session && <p className="text-red-500 mt-4">No session found on server.</p>}
    </div>
  );
}
