"use client";

const BACKEND_URL = "http://localhost:8080";
const USE_MOCK = true; //Use mock login for now, change to false when OAuth is ready

export default function importPage() { 

    function pageTransition(destination: string) { 
    window.location.href = destination; 
    } 
    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        
        const formData = new FormData(event.currentTarget);
        
        
        const data = Object.fromEntries(formData);
        
        console.log("Form Submitted Data:", data);
    };
    return (
        <main className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-b from-[#E4EFE3] via-[#E3EDF1] via-40% to-[#FBF8EF] to-75% md:flex-row md:bg-linear-to-r"> 
            {/* Background grid */}
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(#9BB5A3_1px,transparent_1px),linear-gradient(90deg,#9BB5A3_1px,transparent_1px)] [background-size:32px_32px]" />
            
            {/* grid flexbox. layout stuff via col-# and row-# */}
            <div className="grid grow grid-flow-row grid-cols-6 grid-rows-6 gap-6 p-8 border-2 border-double border-indigo-300">
                
                {/* Box 1 */}
                <div className="col-start-1 col-span-5 row-span-1  border-8 border-double border-indigo-300 text-black">01
                    Import Page Header
                </div>

                {/* Box 2 */}
                <div className="col-start-6 col-span-1 row-span-1 border-8 border-double border-indigo-300 text-black">02
                    <button
                        onClick={() =>pageTransition("/dashboard")} 
                        className="mt-2 w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-4 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]" >
                        Return to Dashboard
                    </button>
                </div>
                
                {/* Box 3 */}
                <div className="col-span-2 row-span-2 border-8 border-double border-indigo-300
                flex flex-col justify-center text-black">
                    <label htmlFor="importForm" className="block text-sm font-medium text-gray-700">
                        Import Transactions
                    </label>
                    <form id="importForm" onSubmit={handleSubmit} >
                        <div>
                            <label htmlFor="file">Upload CSV:</label>
                            <input id="file" name="file" type="file" accept=".csv" required className="border-4 border-dotted border-gray-400" />
                        </div>
                        <button type="submit" className="mt-2 w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-2 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]" >
                            Import
                        </button>
                    </form>
                </div>
                <div className="col-span-3 row-span-3 border-8 border-double border-indigo-300
                flex flex-col justify-center text-black">
                    <label htmlFor="manualForm" className="block text-sm font-medium text-gray-700">
                        Add Transaction Manually
                    </label>
                    <form id="manualForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
                    <div>
                        <label htmlFor="date" >Date:</label>
                        <input id="date" name="date" type="date" required className="border-4 border-dotted border-gray-400" />
                    </div>
                    <div>
                        <label htmlFor="category">Category(needs to be a dropdown):</label>
                        <select id="category" name="category" required className="border-4 border-dotted border-gray-400">
                            <option value="">Select a category</option>
                            <option value="Food">Food</option>
                            <option value="Transportation">Transportation</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Utilities">Utilities</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="amount" >Amount:</label>
                        <input id="amount" name="amount" type="number" step="0.01" required className="border-4 border-dotted border-gray-400" />
                    </div>
                    <div>
                        <label htmlFor="description">Description:</label>
                        <input id="description" name="description" type="text" required className="border-4 border-dotted border-gray-400" />
                    </div>
                    <button type="submit" className="mt-2 w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] py-2 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]" >
                        Submit
                    </button>
                    </form>
                </div>

            </div>
            
        </main>
    )
}