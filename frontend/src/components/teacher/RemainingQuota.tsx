import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthProvider'
import axios from 'axios'


interface RemainingQuota {
    _id: string
    questionLimit: number,
    questionCount?: number,
    paperLimit: number,
    paperCount: number
    remainingQuestions: number
    remainingPapers: number
}

function RemainingQuota() {
    const { baseurl } = useAuth();
    const [quota, setQuota] = useState<RemainingQuota | null>(null);
    const [loading,setLoading] = useState<boolean>(false);

    useEffect(()=>{
        const fetchRemaingQuota = async()=>{
            setLoading(true);
            try {
                const response = await axios.get(`${baseurl}/teacher/quota`,{withCredentials: true});
                setQuota(response.data.quota)
                console.log(response.data.quota);
            } catch (error) {
                console.log("Failed to fetch the remaining Quota",error);
            } finally {
                setLoading(false);
            }
        }
        fetchRemaingQuota();
    },[])

    if (loading) return <div>Loading...</div>;
    if (!quota) return <div>No quota found</div>;

    return (
        <div className="grid grid-cols-2 gap-4 mt-4">

            {/* Question card */}
            <div className="bg-[#0d1117] border border-[#30363d] text-white p-4 rounded-xl">
                <h2 className="text-lg font-semibold">Questions</h2>
                <p>Total Created: {quota.questionCount}/{quota.questionLimit}</p>
                <p>Remaining: {quota.remainingQuestions}</p>
            </div>

            {/* Paper card */}
            <div className="bg-[#0d1117] border border-[#30363d] text-white p-4 rounded-xl">
                <h2 className="text-lg font-semibold">Papers</h2>
                <p>Total Created: {quota.paperCount}/{quota.paperLimit}</p>
                <p>Remaining: {quota.remainingPapers}</p>
            </div>

        </div>
    )
}

export default RemainingQuota
