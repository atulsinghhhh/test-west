import { Router } from "express"
import { addChapters, addGrade, addSubject, addSubtopic, addTeachers, addTopic, deleteChapter, deleteSubject, deleteSubtopic, deleteTopic, getChapters, getGrade, getStatsSchool, getSubjects, getSubtopics, getTeacher, getTopic } from "../controllers/school.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/add",verifyJwt,addTeachers)
router.get("/",verifyJwt,getTeacher)

router.post("/grade",verifyJwt,addGrade)
router.get("/grade",verifyJwt,getGrade);

router.post("/grade/:gradeId/subject", verifyJwt, addSubject);
router.get("/grade/:gradeId/subject", verifyJwt, getSubjects);
router.delete("/subject/:subjectId", verifyJwt, deleteSubject);

router.post("/subject/:subjectId/chapter", verifyJwt, addChapters);
router.get("/subject/:subjectId/chapter", verifyJwt, getChapters);
router.delete("/chapter/:chapterId", verifyJwt, deleteChapter);


router.post("/chapter/:chapterId/topic", verifyJwt, addTopic);
router.get("/chapter/:chapterId/topic", verifyJwt, getTopic);
router.delete("/topic/:topicId", verifyJwt, deleteTopic);

router.post("/topic/:topicId/subtopic", verifyJwt, addSubtopic);
router.get("/topic/:topicId/subtopic", verifyJwt, getSubtopics);
router.delete("/subtopic/:subtopicId", verifyJwt, deleteSubtopic);

router.get("/stats", verifyJwt, getStatsSchool);


export default router;