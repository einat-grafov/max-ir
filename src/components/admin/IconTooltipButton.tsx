import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IconTooltipButtonProps {
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  children: ReactNode;
  variant?: "ghost" | "outline" | "destructive" | "default";
  className?: string;
  disabled?: boolean;
  asChild?: boolean;
  side?: "top" | "bottom" | "left" | "right";
}

const IconTooltipButton = ({
  label,
  onClick,
  children,
  variant = "ghost",
  className,
  disabled,
  side = "top",
}: IconTooltipButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant={variant}
        size="icon"
        className={cn("h-8 w-8", className)}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent side={side}>
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);

export default IconTooltipButton;
