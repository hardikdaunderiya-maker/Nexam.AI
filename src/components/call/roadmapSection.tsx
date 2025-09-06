import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, BookOpen, ArrowRight, Star, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Props {
  callId: string;
}

interface FeedbackData {
  ats_score?: {
    score: number;
    max_score: number;
    factors: any;
    improvement_suggestions: string[];
  };
  topic_wise_feedback?: Array<{
    topic: string;
    performance_rating: number;
    areas_for_improvement: string[];
    resume_alignment: string;
  }>;
  overall_assessment?: {
    resume_interview_consistency: number;
    recommendation: string;
    strengths: string[];
    weaknesses: string[];
  };
}

interface Course {
  title: string;
  duration: string;
  level: string;
  skills: string[];
  description: string;
  rating: number;
}

function RoadmapSection({ callId }: Props) {
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateFeedback = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.post("/api/generate-resume-feedback", {
          callId,
        });

        setFeedbackData(response.data.feedback);
      } catch (error: any) {
        console.error("Error generating feedback:", error);
        const errorMessage = error.response?.data?.error || "Failed to generate feedback";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (callId) {
      generateFeedback();
    }
  }, [callId]);

  // Check if roadmap should be shown (poor performance indicators)
  const shouldShowRoadmap = (feedbackData: FeedbackData) => {
    const atsScore = feedbackData.ats_score?.score || 0;
    const overallConsistency = feedbackData.overall_assessment?.resume_interview_consistency || 0;
    const recommendation = feedbackData.overall_assessment?.recommendation?.toUpperCase();
    
    // Show roadmap if:
    // 1. ATS score is below 70
    // 2. Resume-interview consistency is below 70%
    // 3. Recommendation is "NOT_SELECTED" or "DEVELOPMENTAL"
    // 4. Any topic has performance rating <= 2
    const hasLowTopicRating = feedbackData.topic_wise_feedback?.some(topic => topic.performance_rating <= 2) || false;
    
    return (
      atsScore < 70 || 
      overallConsistency < 70 || 
      recommendation === "NOT_SELECTED" || 
      recommendation === "DEVELOPMENTAL" ||
      hasLowTopicRating
    );
  };

  // Get recommended courses based on weak areas
  const getRecommendedCourses = (feedbackData: FeedbackData): Course[] => {
    const weakAreas: string[] = [];
    
    // Collect weak areas from topic feedback
    feedbackData.topic_wise_feedback?.forEach(topic => {
      if (topic.performance_rating <= 2) {
        weakAreas.push(topic.topic);
        weakAreas.push(...topic.areas_for_improvement);
      }
    });
    
    // Add overall weaknesses
    if (feedbackData.overall_assessment?.weaknesses) {
      weakAreas.push(...feedbackData.overall_assessment.weaknesses);
    }
    
    // UpGrad course recommendations based on common weak areas
    const courseDatabase: Course[] = [
      {
        title: "Full Stack Web Development",
        duration: "6 months",
        level: "Beginner to Advanced",
        skills: ["React", "Node.js", "JavaScript", "MongoDB", "Express"],
        description: "Master modern web development with hands-on projects and industry mentorship.",
        rating: 4.8
      },
      {
        title: "Data Science & Machine Learning",
        duration: "8 months",
        level: "Intermediate",
        skills: ["Python", "Machine Learning", "Data Analysis", "Statistics", "AI"],
        description: "Become a data scientist with real-world projects and expert guidance.",
        rating: 4.7
      },
      {
        title: "Software Engineering Fundamentals",
        duration: "4 months",
        level: "Beginner",
        skills: ["Programming", "Algorithms", "System Design", "Problem Solving"],
        description: "Build strong programming foundations with industry best practices.",
        rating: 4.6
      },
      {
        title: "Cloud Computing & DevOps",
        duration: "5 months",
        level: "Intermediate",
        skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Cloud Architecture"],
        description: "Master cloud technologies and deployment strategies.",
        rating: 4.5
      },
      {
        title: "Product Management",
        duration: "6 months",
        level: "Beginner to Intermediate",
        skills: ["Product Strategy", "User Research", "Analytics", "Leadership"],
        description: "Learn to build and manage successful products from ideation to launch.",
        rating: 4.4
      }
    ];
    
    // Match courses based on weak areas
    const recommendedCourses = courseDatabase.filter(course => {
      return course.skills.some(skill => 
        weakAreas.some(area => 
          area.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(area.toLowerCase())
        )
      );
    });
    
    // If no specific matches, recommend fundamental courses
    if (recommendedCourses.length === 0) {
      return [courseDatabase[2], courseDatabase[0]]; // Software Engineering + Full Stack
    }
    
    return recommendedCourses.slice(0, 3); // Limit to 3 courses
  };

  if (loading) {
    return (
      <div className="bg-slate-200 rounded-2xl min-h-[200px] p-4 px-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5" />
          <p className="font-semibold">Personalized Learning Roadmap</p>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-slate-600">Analyzing performance...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-200 rounded-2xl min-h-[200px] p-4 px-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5" />
          <p className="font-semibold">Personalized Learning Roadmap</p>
        </div>
        <div className="text-red-600 text-center p-4">
          Unable to generate roadmap: {error}
        </div>
      </div>
    );
  }

  // Don't show roadmap for strong performers
  if (!feedbackData || !shouldShowRoadmap(feedbackData)) {
    return null; // Don't show roadmap for strong performers
  }

  const recommendedCourses = getRecommendedCourses(feedbackData);

  return (
    <div className="bg-slate-200 rounded-2xl min-h-[200px] p-4 px-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5" />
        <p className="font-semibold">Personalized Learning Roadmap</p>
      </div>

      <div className="rounded-2xl text-sm h-96 overflow-y-auto whitespace-pre-line px-2 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200">
        <div className="text-sm p-4 rounded-2xl leading-5 bg-slate-50">

          {/* Improvement Areas - Concise Version */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="w-4 h-4" />
                Key Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Topic-wise improvements */}
                {feedbackData.topic_wise_feedback?.filter(topic => topic.performance_rating <= 2).slice(0, 2).map((topic, index) => (
                  <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-orange-800 text-sm">{topic.topic}</h4>
                      <span className="text-xs bg-orange-200 text-orange-700 px-2 py-1 rounded">
                        {topic.performance_rating}/5
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {topic.areas_for_improvement[0] || "Focus on fundamentals"}
                    </p>
                  </div>
                ))}
                
                {/* Overall weaknesses - compact */}
                {feedbackData.overall_assessment?.weaknesses && feedbackData.overall_assessment.weaknesses.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="font-medium text-red-800 text-sm mb-2">General Skills</h4>
                    <p className="text-xs text-slate-600">
                      {feedbackData.overall_assessment.weaknesses.slice(0, 2).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Courses - Concise Version */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="w-4 h-4" />
                Recommended UpGrad Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendedCourses.slice(0, 2).map((course, index) => (
                  <div key={index} className="border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg hover:border-orange-200 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-sm text-slate-800 leading-tight group-hover:text-orange-700 transition-colors">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-1 ml-2 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium text-yellow-700">{course.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                        <span>⏱️</span>
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                        <span>📊</span>
                        <span>{course.level}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {course.skills.slice(0, 3).map((skill, sIndex) => (
                          <span key={sIndex} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                        {course.skills.length > 3 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            +{course.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 border-0 rounded-lg"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Enroll Now
                    </Button>
                  </div>
                ))}
                
                {recommendedCourses.length > 2 && (
                  <div className="text-center py-2">
                    <p className="text-xs text-slate-500">
                      +{recommendedCourses.length - 2} more courses available
                    </p>
                  </div>
                )}
              </div>
              
              {recommendedCourses.length === 0 && (
                <div className="text-center py-6 text-slate-600">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm">Great performance across all areas!</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

export default RoadmapSection;
