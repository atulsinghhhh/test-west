import { Grade } from "../models/grade.model.js";

export const seedGrade = async()=>{
    const count = await Grade.countDocuments();

    if (count === 0) {
        const gradesArray = [
            "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5",
            "Grade 6","Grade 7","Grade 8","Grade 9","Grade 10",
            "Grade 11","Grade 12"
        ].map(name => ({ gradeName: name }));

        await Grade.insertMany(gradesArray);
        console.log("Grades 1 to 12 inserted successfully!");
    } else {
        console.log("Grades already exist. Skipping seeding.");
    }
}