import { AttackVectorStep } from "@/components/AttackVectorStep";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LogEntry {
  timestamp: string;
  level: "info" | "error" | "success";
  message: string;
  source?: string;
  type?: string;
  step_index?: number;
  step_name?: string;
  total_steps?: number;
  error?: string;
}

interface Step {
  index: number;
  name: string;
  status: "pending" | "running" | "success" | "error";
  logs: LogEntry[];
  severity: "high" | "medium" | "critical" | "low";
}

interface PenetrationTestLogProps {
  scanId: string;
  onComplete?: (status: string) => void;
  onCancel?: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function PenetrationTestLog({ scanId, onComplete, onCancel }: PenetrationTestLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [status, setStatus] = useState<"running" | "completed" | "failed" | "cancelled">("running");
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentStepIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/v1/scans/${scanId}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "complete") {
        setStatus(data.status === "completed" ? "completed" : "failed");
        eventSource.close();
        onComplete?.(data.status);
      } else if (data.type === "step_init") {
        // Initialize steps
        const totalSteps = data.total_steps;
        const initialSteps: Step[] = [];
        for (let i = 1; i <= totalSteps; i++) {
          initialSteps.push({
            index: i,
            name: `Step ${i}`,
            status: "pending",
            logs: [],
            severity: "medium",
          });
        }
        setSteps(initialSteps);
      } else if (data.type === "step_start") {
        currentStepIndexRef.current = data.step_index;
        setSteps((prev) =>
          prev.map((step) =>
            step.index === data.step_index
              ? { ...step, name: data.step_name, status: "running" }
              : step
          )
        );
      } else if (data.type === "step_success") {
        setSteps((prev) =>
          prev.map((step) =>
            step.index === data.step_index ? { ...step, status: "success" } : step
          )
        );
      } else if (data.type === "step_error") {
        setSteps((prev) =>
          prev.map((step) =>
            step.index === data.step_index ? { ...step, status: "error" } : step
          )
        );
      } else {
        // Regular log entry - skip step markers themselves
        if (data.message && !data.message.startsWith("[STEP_")) {
          const logEntry: LogEntry = {
            timestamp: data.timestamp,
            level: data.message.includes("[SUCCESS]") ? "success"
                   : data.message.includes("[ERROR]") ? "error"
                   : "info",
            message: data.message,
            source: data.source,
            type: data.type,
            step_index: data.step_index,
            step_name: data.step_name,
          };

          setLogs((prev) => [...prev, logEntry]);

          // Add log to the corresponding step using ref
          const stepIndex = currentStepIndexRef.current;
          if (stepIndex !== null) {
            setSteps((prev) =>
              prev.map((step) =>
                step.index === stepIndex
                  ? { ...step, logs: [...step.logs, logEntry] }
                  : step
              )
            );
          }
        }
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      if (status === "running") {
        setStatus("failed");
      }
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [scanId, onComplete]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCancel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/scans/${scanId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStatus("cancelled");
        eventSourceRef.current?.close();
        onCancel?.();
      }
    } catch (error) {
      console.error("Failed to cancel scan:", error);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = () => {
    const variants = {
      running: "default",
      completed: "default",
      failed: "destructive",
      cancelled: "secondary",
    };

    return (
      <Badge variant={variants[status] as any} className="flex items-center gap-1">
        {getStatusIcon()}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case "error":
        return <XCircle className="h-3 w-3 text-red-500" />;
      case "info":
        return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  return (
    <div className="w-full space-y-3">
      {steps.length === 0 && status === "running" ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Initializing penetration test...
        </div>
      ) : (
        steps.map((step) => (
          <AttackVectorStep
            key={step.index}
            stepIndex={step.index}
            stepName={step.name}
            status={step.status}
            logs={step.logs}
            severity={step.severity}
            scanId={scanId}
            onCancel={onCancel}
          />
        ))
      )}

      {!isConnected && status === "running" && logs.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Connection lost. Attempting to reconnect...</span>
        </div>
      )}
    </div>
  );
}
