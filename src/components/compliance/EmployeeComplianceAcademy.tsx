import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Award, CheckCircle2, Clock, BookOpen, 
  Sparkles, ShieldCheck, Download, UserCheck, Play, 
  RotateCcw, ArrowRight, Check, X, AlertCircle, FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Course {
  id: string;
  title: string;
  targetAudience: string;
  durationMinutes: number;
  modulesCount: number;
  completionRate: number;
  framework: string;
  badge: string;
  summary: string;
  quizQuestions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

interface Certificate {
  id: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  issuedDate: string;
  expiryDate: string;
  score: number;
  verificationHash: string;
}

export const EmployeeComplianceAcademy: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  
  // Interactive Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [learnerName, setLearnerName] = useState('Alexander Vance');
  const [learnerEmail, setLearnerEmail] = useState('alexander.vance@acme-europe.eu');
  const [newlyIssuedCert, setNewlyIssuedCert] = useState<Certificate | null>(null);

  const fetchAcademyData = async () => {
    setLoading(true);
    try {
      const [resCourses, resCerts] = await Promise.all([
        fetch('/api/v1/privacy-suite/academy/courses'),
        fetch('/api/v1/privacy-suite/academy/certificates')
      ]);
      const dataCourses = await resCourses.json();
      const dataCerts = await resCerts.json();
      if (dataCourses.success) setCourses(dataCourses.courses);
      if (dataCerts.success) setCertificates(dataCerts.certificates);
    } catch (e) {
      console.error('Failed to load academy data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademyData();
  }, []);

  const handleStartCourse = (course: Course) => {
    setActiveCourse(course);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setNewlyIssuedCert(null);
  };

  const handleOptionSelect = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx });
  };

  const handleSubmitQuiz = async () => {
    if (!activeCourse) return;
    let correctCount = 0;
    activeCourse.quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / activeCourse.quizQuestions.length) * 100);
    setQuizScore(calculatedScore);
    setQuizSubmitted(true);

    if (calculatedScore >= 75) {
      try {
        const res = await fetch('/api/v1/privacy-suite/academy/complete-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: activeCourse.id,
            userName: learnerName,
            userEmail: learnerEmail,
            score: calculatedScore
          })
        });
        const result = await res.json();
        if (result.success) {
          setNewlyIssuedCert(result.certificate);
          setCertificates([result.certificate, ...certificates]);
        }
      } catch (err) {
        console.error('Error generating certificate', err);
      }
    }
  };

  const downloadCertJson = (cert: Certificate) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cert, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${cert.id}_${cert.userName.replace(/\s+/g, '_')}_OfficialCertificate.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Mandatory Annual Compliance Training
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verifiable Certifications
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            Interactive Employee Compliance Academy
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Automated micro-trainings across GDPR, EU AI Act, NIS2, and Whistleblower Protection with verifiable completion credentials.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Organization Completion</span>
            <span className="text-sm font-black text-emerald-600">93.8% Staff Certified</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Badges</span>
            <span className="text-sm font-black text-indigo-600">{certificates.length} Issued</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Courses & Recent Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Course Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Curated Regulatory Training Modules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {course.framework}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.durationMinutes} min
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-2">{course.title}</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{course.summary}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Audience: <b>{course.targetAudience}</b></span>
                    <span className="text-emerald-600 font-bold">{course.completionRate}% completion</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartCourse(course)}
                  className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Start Interactive Quiz
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Issued Credentials & Verifications */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            Verified Staff Certifications ({certificates.length})
          </h3>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 max-h-[500px] overflow-y-auto">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{cert.userName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                    Score: {cert.score}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium line-clamp-1">{cert.courseTitle}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/60">
                  <span>Issued: {cert.issuedDate}</span>
                  <button
                    onClick={() => downloadCertJson(cert)}
                    className="text-indigo-600 hover:text-indigo-800 font-sans font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> PDF / Hash
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Quiz & Certification Modal */}
      <AnimatePresence>
        {activeCourse && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{activeCourse.framework} Academy</span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{activeCourse.title}</h3>
                </div>
                <button
                  onClick={() => setActiveCourse(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Learner Info Banner */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Learner Name</label>
                  <input
                    type="text"
                    value={learnerName}
                    onChange={(e) => setLearnerName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-1.5 font-bold text-slate-800 mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Corporate Email</label>
                  <input
                    type="email"
                    value={learnerEmail}
                    onChange={(e) => setLearnerEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-1.5 font-bold text-slate-800 mt-0.5"
                  />
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {activeCourse.quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-2.5">
                    <span className="text-xs font-bold text-slate-900 block">
                      Question {qIdx + 1}: {q.question}
                    </span>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = quizAnswers[qIdx] === optIdx;
                        const isCorrect = optIdx === q.correctIndex;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleOptionSelect(qIdx, optIdx)}
                            className={`p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                              quizSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                  : isSelected
                                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                                : isSelected
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <b>Statutory Explanation:</b> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Results / Certificate Issuance */}
              {newlyIssuedCert && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                  <Award className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div>
                    <h4 className="text-base font-black text-emerald-900">Certification Passed & Anchored!</h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      Certificate <b>{newlyIssuedCert.id}</b> issued to <b>{newlyIssuedCert.userName}</b>.
                    </p>
                    <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-2">
                      Proof Hash: {newlyIssuedCert.verificationHash}
                    </span>
                  </div>
                </div>
              )}

              {/* Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveCourse(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>

                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length < activeCourse.quizQuestions.length}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      Object.keys(quizAnswers).length === activeCourse.quizQuestions.length
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Submit & Evaluate Exam
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                      setNewlyIssuedCert(null);
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake Training
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
