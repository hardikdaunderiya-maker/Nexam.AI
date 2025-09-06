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

      <ScrollArea className="rounded-2xl text-sm h-96 overflow-y-auto whitespace-pre-line px-2" style={{scrollbarWidth: 'thin'}}>
        <div className="text-sm p-4 rounded-2xl leading-5 bg-slate-50">

          {/* Improvement Areas */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedbackData.topic_wise_feedback?.filter(topic => topic.performance_rating <= 2).map((topic, index) => (
                  <div key={index} className="border-l-4 border-orange-400 pl-4">
                    <h4 className="font-medium text-orange-700">{topic.topic}</h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Performance: {topic.performance_rating}/5 stars
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {topic.areas_for_improvement.slice(0, 2).map((area, aIndex) => (
                        <li key={aIndex} className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                
                {/* Overall weaknesses */}
                {feedbackData.overall_assessment?.weaknesses && feedbackData.overall_assessment.weaknesses.length > 0 && (
                  <div className="border-l-4 border-red-400 pl-4">
                    <h4 className="font-medium text-red-700">General Areas</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {feedbackData.overall_assessment.weaknesses.slice(0, 2).map((weakness, wIndex) => (
                        <li key={wIndex} className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5" />
                Recommended UpGrad Courses
              </CardTitle>
              <p className="text-sm text-slate-600">
                Curated courses to strengthen your weak areas and boost your career
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedCourses.map((course, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg text-blue-700">{course.title}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3 text-sm text-slate-600">
                      <span>📅 {course.duration}</span>
                      <span>📊 {course.level}</span>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-3">{course.description}</p>
                    
                    <div className="mb-3">
                      <h5 className="font-medium text-sm mb-2">Skills you'll learn:</h5>
                      <div className="flex flex-wrap gap-2">
                        {course.skills.map((skill, sIndex) => (
                          <span key={sIndex} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Enroll Now - Transform Your Career
                    </Button>
                  </div>
                ))}
              </div>
              
              {recommendedCourses.length === 0 && (
                <div className="text-center py-8 text-slate-600">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p>Great job! Your performance is strong across all areas.</p>
                  <p className="text-sm">Keep up the excellent work!</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </ScrollArea>
    </div>
  );
}

export default RoadmapSection;
