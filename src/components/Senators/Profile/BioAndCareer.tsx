import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, GraduationCap, Briefcase, Calendar } from 'lucide-react';
import { Senator } from '@/hooks/useSenators';
import { format } from 'date-fns';

interface BioAndCareerProps {
  senator: Senator;
}

export function BioAndCareer({ senator }: BioAndCareerProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Biography & Career
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about" className="flex items-center gap-2">
              🧾 About
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              📚 Education
            </TabsTrigger>
            <TabsTrigger value="career" className="flex items-center gap-2">
              💼 Career
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6">
            <div className="space-y-4">
              {senator.about ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {senator.about}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No biographical information available</p>
                </div>
              )}

              {senator.date_of_birth && (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{formatDate(senator.date_of_birth)}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="education" className="mt-6">
            <div className="space-y-4">
              {senator.education && senator.education.length > 0 ? (
                <div className="space-y-4">
                  {senator.education.map((edu: any, index: number) => (
                    <div key={index} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{edu.degree || edu.qualification}</h4>
                        <p className="text-muted-foreground">{edu.institution}</p>
                        {edu.year && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {edu.year}
                          </Badge>
                        )}
                        {edu.description && (
                          <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No education information available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="career" className="mt-6">
            <div className="space-y-4">
              {senator.career_history && senator.career_history.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted"></div>
                  
                  <div className="space-y-6">
                    {senator.career_history.map((career: any, index: number) => (
                      <div key={index} className="relative flex gap-4">
                        <div className="bg-primary rounded-full p-2 z-10">
                          <Briefcase className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-semibold">{career.position || career.title}</h4>
                            <p className="text-muted-foreground">{career.organization || career.company}</p>
                            
                            <div className="flex gap-2 mt-2">
                              {career.start_year && (
                                <Badge variant="outline" className="text-xs">
                                  {career.start_year} - {career.end_year || 'Present'}
                                </Badge>
                              )}
                            </div>
                            
                            {career.description && (
                              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                {career.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No career history available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}