"use client";

const BACKEND_URL = "http://localhost:8080";
const USE_MOCK = true; //Use mock login for now, change to false when OAuth is ready

export default function transactionsPage() { 

    function pageTransition(destination: string) { 
    window.location.href = destination; 
    } 

    
    return (
        <main className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-b from-[#E4EFE3] via-[#E3EDF1] via-40% to-[#FBF8EF] to-75% md:flex-row md:bg-linear-to-r"> 
            {/* Background grid */}
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(#9BB5A3_1px,transparent_1px),linear-gradient(90deg,#9BB5A3_1px,transparent_1px)] [background-size:32px_32px]" />
            
        </main>
    )
}