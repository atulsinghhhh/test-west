import ProgressBar from "./ProgressBar";

export default function SchoolCard({
  school,
}: {
  school: {
    name?: string;
    email?: string;
    questionLimit: number;
    paperLimit: number;
    questionCount: number;
    paperCount: number;
    remainingQuestions: number;
    remainingPapers: number;
  };
}) {
  const qPercent =
    school.questionLimit > 0
      ? (school.questionCount / school.questionLimit) * 100
      : 0;

  const pPercent =
    school.paperLimit > 0 ? (school.paperCount / school.paperLimit) * 100 : 0;

  return (
    <div
      className="p-4 rounded-lg border cursor-pointer bg-white/5 hover:shadow-md transition border-admin-border"
      title={school.name}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-muted-foreground">
            {school.name}
          </div>
          <div className="text-xs text-muted-foreground">
            {school.email}
          </div>
        </div>

        <div className="text-xs text-right text-muted-foreground">
          <div>{school.questionCount}/{school.questionLimit} Q</div>
          <div className="mt-1">{school.paperCount}/{school.paperLimit} P</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xs text-muted-foreground">Questions</div>
        <ProgressBar value={qPercent} />
      </div>

      <div className="mt-3">
        <div className="text-xs text-muted-foreground">Papers</div>
        <ProgressBar value={pPercent} />
      </div>

      <div className="flex justify-between text-xs mt-3 text-muted-foreground">
        <div>
          Remaining Q: <span className="text-foreground">{school.remainingQuestions}</span>
        </div>
        <div>
          Remaining P: <span className="text-foreground">{school.remainingPapers}</span>
        </div>
      </div>
    </div>

  );
}
