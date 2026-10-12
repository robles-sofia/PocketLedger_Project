"use client";

const BACKEND_URL = "http://localhost:8080";
const USE_MOCK = true; //Use mock login for now, change to false when OAuth is ready

export default function transactionsPage() { 

    function pageTransition(destination: string) { 
    window.location.href = destination; 
    } 

    
    return (
        <main className=" flex flex-wrap flex-col justify-center p-8 min-h-screen overflow-hidden bg-linear-to-b from-[#E4EFE3] via-[#E3EDF1] via-40% to-[#FBF8EF] to-75% md:flex-row md:bg-linear-to-r"> 
            {/* Background grid */}
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(#9BB5A3_1px,transparent_1px),linear-gradient(90deg,#9BB5A3_1px,transparent_1px)] [background-size:32px_32px]" />
            
            {/* grid flexbox. layout stuff via col-# and row-# */}
            <div className="grid grow grid-flow-col grid-cols-6 grid-rows-6 gap-6 p-8 border-2 border-double border-indigo-300"> 
                
                {/* Box 1 */}
                <div className="basis-1/2 border-8 border-double border-indigo-300 text-black">01
                    Transactions Page Header
                </div>

                {/* Box 2 */}
                <div className=" basis-1/2 border-8 border-double border-indigo-300 text-black">02
                    <button
                        onClick={() =>pageTransition("/dashboard")} 
                        className="mt-2 w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-4 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]" >
                        Return to Dashboard
                    </button>
                </div>
                
                {/* Box 3 */}
                <div className="self-center basis-1/2 border-8 border-double border-indigo-300 text-black">03
                    <div className="flex items-center justify-center w-full h-full">
                    <p
                        
                        className="justify-center mt-8 w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-4 font-medium text-[#3F5747] ">
                        transactions Area
                    </p> 
                    </div>
                </div>
            </div>
            
        </main>
    )
}