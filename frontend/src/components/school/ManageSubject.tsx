import { useState } from "react"
import { useAuth } from "../../context/AuthProvider"

type Grade = {
    _id: string,
    gradeName: string
}
type Subject = {
    _id: string,
    subjectName: string
}
type Chapter = {
    _id: string,
    chapterName: string
}
type Topic = {
    _id: string,
    topicName: string
}
type SubTopic = {
    _id: string,
    subtopicName: string
}


function ManageSubject() {
    const { baseurl } = useAuth();

    const [ grade,setGrade ] = useState<Grade[]>([]);
    const [ subject,setSubject ] = useState<Subject[]>([]);
    const [ chapter,setChapter ] = useState<Chapter[]>([]);
    const [ topic, setTopic ] = useState<Topic[]>([]);
    const [ subTopic,setSubTopic ] = useState<SubTopic[]>([]);

    

    return (
        <div>
        
        </div>
    )
}

export default ManageSubject
