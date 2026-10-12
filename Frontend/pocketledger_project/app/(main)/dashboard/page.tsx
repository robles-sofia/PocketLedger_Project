"use client";

const BACKEND_URL = "http://localhost:8080";
const USE_MOCK = true; //Use mock login for now, change to false when OAuth is ready

export default function DashboardPage() { 

    function handleLogin() { 
    if (USE_MOCK) { //Go straight to the home page while using mock data
      window.location.href = "/accounts"; 
      return; 
    } 
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`; //Use Google OAuth when the backend login is ready
    } 

    function pageTransition(destination: string) { 
    if (USE_MOCK) { //Go straight to the home page while using mock data
      window.location.href = destination; 
      return; 
    } 
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`; //Use Google OAuth when the backend login is ready
    } 

    return (
        <main className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-b from-[#E4EFE3] via-[#E3EDF1] via-40% to-[#FBF8EF] to-75% md:flex-row md:bg-linear-to-r"> 
            {/* Background grid */}
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(#9BB5A3_1px,transparent_1px),linear-gradient(90deg,#9BB5A3_1px,transparent_1px)] [background-size:32px_32px]" />
            
            {/* grid flexbox. layout stuff via col-# and row-# */}
            <div className="grid grow grid-flow-col grid-cols-6 grid-rows-6 gap-6 p-8 border-2 border-double border-indigo-300">
                
                {/* Box 1 */}
                <div className="col-start-2 col-span-4 row-span-1  border-8 border-double border-indigo-300 
                flex justify-center text-black">
                    <button
                        onClick={() =>pageTransition("/login")} 
                        className="mt-4 mb-4 w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-4 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]" >
                        Dashboard Header / Current Return to Login
                    </button>
                </div>
                 <div className="col-start-6 col-span-1 row-span-1  border-8 border-double border-indigo-300 
                flex justify-center text-black">
                    <button
                        onClick={() =>pageTransition("/login")} 
                        className="mt-8 mb-8 w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-4 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]" >
                        Return to Login
                    </button>
                </div>

                {/* Box 2 */}
                <div className="col-span-2 row-span-4 border-8 border-double border-indigo-300 
                flex flex-col justify-center gap-8 text-black">
                    <button 
                        onClick={() =>pageTransition("/accounts")} 
                        className=" w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-4 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]" >
                        Account Details
                    </button> 
                    <button 
                        onClick={() =>pageTransition("/budgets")} 
                        className=" w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-4 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]" >
                        Budget Management
                    </button> 
                    <button 
                        onClick={() =>pageTransition("/import")} 
                        className=" w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-4 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]" >
                        Import Transactions
                    </button> 
                    <button 
                        onClick={() =>pageTransition("/settings")} 
                        className=" w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-4 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]" >
                        Settings
                    </button> 
                    <button 
                        onClick={() =>pageTransition("/transactions")} 
                        className=" w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-4 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]" >
                        Transaction History
                    </button> 
                </div>

                {/* Box 3 */}
                <div className="col-span-4 row-span-4 border-8 border-double border-indigo-300 text-black">
                    <div className="flex items-center justify-center w-full h-full">
                    <button 
                        onClick={handleLogin} 
                        className="justify-centermt-8 w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-4 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]" >
                        Chart / Graph / Data Visualization Preview
                    </button> 
                    </div>
                </div>
            </div>
        </main>
    )


    

}