import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lightbulb } from "lucide-react";

interface QueryPlanDisplayProps {
  plan?: string;
  subQueries?: string[];
  isLoading?: boolean;
}

export function QueryPlanDisplay({
  plan,
  subQueries,
  isLoading = false,
}: QueryPlanDisplayProps) {
  if (!plan && !isLoading) return null;

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-base">Query Analysis & Plan</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-blue-200 rounded w-3/4"></div>
            <div className="h-3 bg-blue-200 rounded w-1/2"></div>
          </div>
        ) : (
          <>
            {plan && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Search Strategy:
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{plan}</p>
              </div>
            )}

            {subQueries && subQueries.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Key Search Aspects:
                </p>
                <div className="flex flex-wrap gap-2">
                  {subQueries.map((subQuery, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 border-blue-200"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {subQuery}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
