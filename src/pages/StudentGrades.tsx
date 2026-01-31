import { useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { useQuizResults } from "@/hooks/useQuizResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Trophy, 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  Filter
} from "lucide-react";
import { courses } from "@/data/courses";

export default function StudentGrades() {
  const { results, loading } = useQuizResults();
  const [filterDepartment, setFilterDepartment] = useState<string>("all");

  // Get unique departments from courses
  const departments = [...new Set(courses.map((c) => c.department))];

  // Filter results by department
  const filteredResults = filterDepartment === "all" 
    ? results 
    : results.filter((r) => {
        const course = courses.find((c) => c.code === r.course_code);
        return course?.department === filterDepartment;
      });

  // Calculate stats
  const totalQuizzes = results.length;
  const passedQuizzes = results.filter((r) => r.passed).length;
  const averageScore = totalQuizzes > 0 
    ? Math.round(results.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) / totalQuizzes)
    : 0;

  const getCourseName = (code: string) => {
    const course = courses.find((c) => c.code === code);
    return course?.title || code;
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-pulse text-primary font-bold text-xl">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="py-12 px-4">
        <div className="container-wide">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/student"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="heading-2">Grades & Scores</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="card-urban">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-black text-foreground">{passedQuizzes}/{totalQuizzes}</p>
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Quizzes Passed</p>
              </CardContent>
            </Card>

            <Card className="card-urban">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-black text-foreground mb-1">{averageScore}%</div>
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Average Score</p>
              </CardContent>
            </Card>

            <Card className="card-urban">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-black text-foreground mb-1">
                  {totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0}%
                </div>
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Pass Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4 mb-6">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="bg-background border-2 border-border rounded-lg px-4 py-2 font-bold focus:border-primary outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Grades Table */}
          <Card className="card-urban">
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredResults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No quiz results yet</p>
                  <p>Complete quizzes in your courses to see your grades here.</p>
                  <Link to="/academics" className="text-primary font-bold hover:underline mt-4 inline-block">
                    Browse Courses →
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Quiz</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Percentage</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => {
                      const percentage = Math.round((result.score / result.total_questions) * 100);
                      return (
                        <TableRow key={result.id}>
                          <TableCell className="font-bold">{getCourseName(result.course_code)}</TableCell>
                          <TableCell className="text-muted-foreground">{result.quiz_id}</TableCell>
                          <TableCell className="text-center font-bold">
                            {result.score}/{result.total_questions}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${percentage >= 80 ? "text-green-400" : percentage >= 60 ? "text-yellow-400" : "text-destructive"}`}>
                              {percentage}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {result.passed ? (
                              <span className="inline-flex items-center gap-1 text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                Pass
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-destructive">
                                <XCircle className="h-4 w-4" />
                                Fail
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {new Date(result.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
