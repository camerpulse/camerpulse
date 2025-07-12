import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Clock, XCircle } from "lucide-react";

interface VerificationBadgeProps {
  status: "verified" | "unverified" | "disputed" | "pending";
  score?: number;
  lastVerified?: string;
  className?: string;
}

export const VerificationBadge = ({ 
  status, 
  score, 
  lastVerified, 
  className 
}: VerificationBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "verified":
        return {
          icon: CheckCircle2,
          variant: "default" as const,
          text: "AI Verified",
          color: "text-green-600",
        };
      case "pending":
        return {
          icon: Clock,
          variant: "secondary" as const,
          text: "Pending Verification",
          color: "text-yellow-600",
        };
      case "disputed":
        return {
          icon: AlertTriangle,
          variant: "destructive" as const,
          text: "Disputed Info",
          color: "text-orange-600",
        };
      default:
        return {
          icon: XCircle,
          variant: "outline" as const,
          text: "Unverified",
          color: "text-gray-600",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className={`w-3 h-3 mr-1 ${config.color}`} />
      {config.text}
      {score && status === "verified" && (
        <span className="ml-1 text-xs">
          ({Math.round(score * 100)}%)
        </span>
      )}
    </Badge>
  );
};